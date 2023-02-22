import { MQTTPublisher } from "@hive-command/opcua-mqtt";
import OPCUAClient from "@hive-command/opcua-client";

import { DataType } from "node-opcua";
import { DataTypes, fromOPCType, parseValue } from "@hive-command/scripting";
import { EventEmitter } from 'events';
import { merge, isEqual } from 'lodash'
import { ValueStore } from "./valuestore";
import { Runner } from "./runner";

export interface SidecarOptions {

    tags?: { name: string, type: string }[]
    types?: { name: string, fields: { name: string, type: string }[] }[]

    iot?: {
        host?: string;
        user?: string;
        pass?: string

        exchange?: string;
    }

    opcuaServer?: string;

    deviceMap?: {
        path: string,
        tag: string
    }[]

    subscriptionMap?: {
        path: string,
        tag: string
    }[]
}

export class MQTTClient {

    private client?: OPCUAClient;
    private clientEndpoint?: string;

    private subscription?: { events: EventEmitter, paths: { tag: string, path: string }[], unsubscribe: () => void };

    private mqttPublisher?: MQTTPublisher;

    private options?: SidecarOptions;
    // private sessions : {[key: string]: ClientSession} = {};

    private valueStore: ValueStore;

    private runner : Runner;

    constructor(config?: SidecarOptions) {
        this.options = config;
        
        this.runner = new Runner(this, config);

        this.valueStore = new ValueStore({
            subscriptionMap: config?.subscriptionMap,
            tags: config?.tags,
            types: config?.types
        }, this.runner)

    }

    async start(){

        if(this.options?.opcuaServer){
            console.log("Connecting to opcua server: ", this.options.opcuaServer)
            this.client = await this.connect(this.options.opcuaServer)
        }

        if(this.options?.subscriptionMap && this.options.deviceMap && this.options.tags && this.options.types){
            console.log("Subscring to subscription-map...")

            await this.subscribe(this.options.subscriptionMap)
        }

        if(this.options?.iot && this.options.iot.host && this.options.iot.user && this.options.iot.pass && this.options.iot.exchange){
            console.log("Publishing data...")

            await this.setup_data(this.options.iot.host, this.options.iot.user, this.options.iot.pass, this.options.iot.exchange)
        }
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


    getTagPaths(object: any, parent?: string): any {
        // console.log("Get tag paths", object, parent)

        if (typeof (object) == 'object' && !Array.isArray(object)) {
            return Object.keys(object).map((key) => this.getTagPaths(object[key], parent ? `${parent}.${key}` : key)).reduce((prev, curr) => prev.concat((Array.isArray(curr) ? curr : [curr])), [])
        } else {
            return { parent, tag: object };
        }

    }


    async subscribe(paths: { tag: string, path: string }[]) {

        console.log("Subscribing to", paths);

        const { monitors, unsubscribe, unwrap } = await this.client?.subscribeMulti(paths, 200) || {}

        const emitter = new EventEmitter()

        monitors?.on('changed', async (item, value, index) => {
            try {
                const key = unwrap?.(index)

                let curr_value = value.value.value;
                if(curr_value.BYTES_PER_ELEMENT != undefined){
                    curr_value = Array.from(curr_value);
                }

                console.log("Datachanged at the OPCUA level", { key, value: curr_value })

                const changed_keys = this.valueStore.updateValue(key, curr_value)


                changed_keys.map((changed) => {
                    if (this.mqttPublisher) this.mqttPublisher?.publish(changed.key, 'Boolean', changed.value)
                    emitter.emit('data-changed', { key: changed.key, value: changed.value })
                })
            } catch (e: any) {
                console.log("Error in monitors.changed", e.message)
            }
        })

        return { emitter, unsubscribe };
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

        this.mqttPublisher = new MQTTPublisher({
            host: host,
            user: user,
            pass: pass,
            exchange: exchange || 'TestExchange'
        })

        try {
            await this.mqttPublisher.setup()
        } catch (e) {
            console.log({ e })
        }

        await this.mqttPublisher.subscribe(async (message) => {
            try {
                const { key, value } = message.messageContent;

                if (!this.client) {
                    return console.error("No client currently connected");
                }

                console.log("SET TAG", key, value)
                const setTags = await this.runner.setTag(this.valueStore.values, key, value)

                await Promise.all((setTags || []).map((tags) => {
                    this.setData(tags.tag, tags.dataType, tags.value)
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

        console.log("MQTT Publisher started");
    }

    async publish_data(key: string, value: any) {
        this.mqttPublisher?.publish(key, 'Boolean', value)
    }

}
