import { MQTTClient } from "@hive-command/amqp-client";
import OPCUAClient from "@hive-command/opcua-client";

import { DataType } from "node-opcua";
import { DataTypes, fromOPCType, parseValue } from "@hive-command/scripting";
import { EventEmitter } from 'events';
import { merge, isEqual, debounce, DebouncedFunc } from 'lodash'
import { ValueStore } from "./valuestore";
import { Runner } from "./runner";

export interface SidecarOptions {

    tags: { name: string, type: string }[]
    types: { name: string, fields: { name: string, type: string }[] }[]

    iot?: {
        host?: string;
        user?: string;
        pass?: string

        exchange?: string;
    }

    opcuaServer?: string;

    //Provided at boot to map subscription tags to deviceMap paths
    deviceMap?: {
        path: string,
        tag: string
    }[]

    //Provided at boot to kick-start subscriptions to the OPCUA-Server
    // Important to be provided at oot for runner value mapping
    subscriptionMap: {
        path: string,
        tag: string
    }[]
}

export class OPCMQTTClient extends EventEmitter {

    private client?: OPCUAClient;
    private clientEndpoint?: string;

    private subscription?: { events: EventEmitter, paths: { tag: string, path: string }[], unsubscribe: () => void };

    private mqttPublisher?: MQTTClient;

    private options?: SidecarOptions;
    // private sessions : {[key: string]: ClientSession} = {};

    private valueStore: ValueStore;

    private runner : Runner;

    private tagUpdateFn: {[key: string]: DebouncedFunc<(value: any) => void> | { [key: string]: DebouncedFunc<(value: any) => void> }} = {};

    constructor(config?: SidecarOptions) {
        super();

        this.options = config;

        this.runner = new Runner(this);

        this.valueStore = new ValueStore(this, this.runner)

        this.valueStore.on('keys-changed', this.onKeyChanged.bind(this))

    }

    updateConfig(config: SidecarOptions){

        let lastConfig = Object.assign({}, this.options);

        this.options = config;

        this.runner = new Runner(this);
        this.valueStore = new ValueStore(this, this.runner);
        this.valueStore.on('keys-changed', this.onKeyChanged.bind(this))

    }

    getConfig(){
        return this.options
    }

    get values(){
        return this.valueStore.values
    }

    async start(){

        const config = this.getConfig();

        if(config?.opcuaServer){
            console.log("Connecting to opcua server: ", config?.opcuaServer)
            this.client = await this.connect(config?.opcuaServer)
        }

        if(config?.subscriptionMap && config?.deviceMap && config?.tags && config?.types){
            console.log("Subscring to subscription-map...")

            await this.subscribe(config?.subscriptionMap)
        }

        if(config?.iot && config?.iot.host && config?.iot.user && config?.iot.pass && config?.iot.exchange){
            console.log("Publishing data...")

            await this.setup_data(config?.iot.host, config?.iot.user, config?.iot.pass, config?.iot.exchange)
        }
    }

    shutdown(){
    
        this.client?.disconnect()

    }
    
    async getDataType(path: string) {
        return await this.client?.getType(path, true)
    }

    async setData(path: string, dataType: DataType, value: any) {
        console.log("Set Data")
        const statusCode = await this.client?.setDetails(path, dataType, value)
        console.log("Set Data Done")

        return statusCode?.value;
    }

    async setTag(key: string, value: any){
        const setTags = await this.runner.setTag(this.valueStore.values, key, value)

        await Promise.all((setTags || []).map(async (tags) => {
            await this.setData(tags.tag, tags.dataType, tags.value)
        }))
    }


    getTagPaths(object: any, parent?: string): any {
        console.log("Get tag paths", object, parent)

        if (typeof (object) == 'object' && !Array.isArray(object)) {
            return Object.keys(object).map((key) => this.getTagPaths(object[key], parent ? `${parent}.${key}` : key)).reduce((prev, curr) => prev.concat((Array.isArray(curr) ? curr : [curr])), [])
        } else {
            return { parent, tag: object };
        }

    }


    //Must be starte
    async subscribe(paths: { tag: string, path: string }[]) {
        if(!this.client) throw new Error("Client must be started before subscribing");

        const { monitors, unsubscribe, unwrap } = await this.client?.subscribeMulti(paths, 1000) || {}

        monitors?.on('changed', (item, value, index) => {

            //zeroed timeout or async await block (macrotask/microtask)
            setTimeout(() => {

                try {
                    const key = unwrap?.(index)

                    let curr_value = value.value.value;
                    if(curr_value?.BYTES_PER_ELEMENT != undefined){
                        curr_value = Array.from(curr_value);
                    }

                    // console.log("Datachanged at the OPCUA level", { key, value: curr_value })

                    this.valueStore.updateValue(key, curr_value)
                    
                } catch (e: any) {
                    console.log("Error in monitors.changed", e.message)
                }
            })
        })

        return { unsubscribe };
    }


    onKeyChanged(changed_keys: {key: string, value: any}[]){
        changed_keys.map((changed) => {
            this.publish(changed.key, changed.value);

            // if (this.mqttPublisher) this.mqttPublisher?.publish(changed.key, 'Boolean', changed.value)
            this.emit('data-changed', { key: changed.key, value: changed.value })
        })
    }

    async browse(client: OPCUAClient, browsePath: string, recursive?: boolean, withTypes?: boolean) {
        // const endpointUrl = `opc.tcp://${host}:${port}`;
        console.log("Browse", browsePath)
        // const client = await this.connect(host);

        const browseResult = await client.browse(browsePath)

        let results: any[] = [];

        for (const reference of browseResult || []) {

            const name = reference?.browseName?.name?.toString();
            const nsIdx = reference?.browseName?.namespaceIndex?.toString();

            if (nsIdx == "0") continue;

            let bp = `${browsePath}/${nsIdx ? `${nsIdx}:` : ''}${name}`;

            if (recursive) {
                try {
                    let { type, isArray } = withTypes ? await client.getType(bp, true) : { type: null, isArray: false };

                    const innerResults = await this.browse(client, bp, recursive, withTypes);

                    results.push({
                        id: reference?.nodeId,
                        name: name,
                        path: bp,
                        type: type ? fromOPCType(type) : undefined,
                        isArray,
                        children: innerResults
                    })
                } catch (e) {
                    console.log({ e, name })
                }
            } else {
                results.push(name)
            }

            // console.log( "   -> ", reference.browseName.toString());
            // results.push(reference.browseName.toString());
        }

        return results;
    }

    private async onClientLost(endpointUrl: string) {
        console.log(`Connection to ${endpointUrl} lost. Retrying...`);
    }

    async connect(host: string, port?: number) {
        const endpointUrl = host.indexOf('opc.tcp://') > -1 ? host : `opc.tcp://${host}${port ? `:${port}` : ''}`;

        console.log(`Getting connection instance for ${endpointUrl}`);

        //Check for host match if not reset
        if (this.clientEndpoint !== endpointUrl) {
            console.debug(`Disconnecting client`);
            await this.client?.disconnect()
            this.clientEndpoint = undefined;
            this.client = undefined;
        }

        if (this.client) {
            console.debug("Returning client");
            return this.client;
        }

        this.client = new OPCUAClient();


        this.client.on('close', this.onClientLost.bind(this, endpointUrl))
        this.client.on('connection_lost', this.onClientLost.bind(this, endpointUrl))

        await this.client.connect(endpointUrl)

        this.clientEndpoint = endpointUrl

        console.log(`Connected to ${endpointUrl}`)

        return this.client;

    }

    async setup_data(host: string, user: string, pass: string, exchange: string) {

        if (this.mqttPublisher) return console.error("MQTT Publisher already existed");

        this.mqttPublisher = new MQTTClient({
            host: host,
            user: user,
            pass: pass,
            exchange: exchange || 'TestExchange',
            reconnectOptions: {
                maxDelay: 120 * 1000 //2 min max delay
            }
        })

        try {
            await this.mqttPublisher.connect(async (message) => {
                try {
                    const { routingKey: key, messageContent: {value} } = message;
    
                    if (!this.client) {
                        return console.error("No client currently connected");
                    }
    
                    console.log("SET TAG", key, value)

                    if(!key) return console.error("Set Tag Failed: " + value)

                    const setTags = await this.runner.setTag(this.valueStore.values, key.replace(/\//, '.'), value)
    
                    await Promise.all((setTags || []).map(async (tags) => {
                        await this.setData(tags.tag, tags.dataType, tags.value)
                    }))
    
    
                    // //Get OPCUA path from state
                    // let path = this.subscription?.paths.find((a) => a.tag === key)?.path
    
                    // if(!path) return console.error("Couldn't find ", key)
    
                    // //Get OPCUA Datatype
                    // const dataType = await this.getDataType(this.client, path)
    
                    // //Update current state
                    // this.setData(this.client, path, (DataType as any)[dataType.type as any], value)
    
                    //Send update to frontend
                } catch (e) {
                    console.error("Error receiving MQTT Publish", message)
                }
            })
        } catch (e) {
            console.log({ e })
        }

        console.log("MQTT Publisher started");
    }

    //
    publish(key: string, value: any){
        this.mqttPublisher?.publish(key, 'Boolean', value);
    }

    async publish_data(key: string, value: any) {
        this.mqttPublisher?.publish(key, 'Boolean', value)
    }

}
