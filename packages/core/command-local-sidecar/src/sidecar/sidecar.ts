import { MQTTPublisher } from "@hive-command/opcua-mqtt";
import OPCUAClient from "@hive-command/opcua-client";
import { load_exports } from '../utils';
import { SidecarConf } from "./conf";
import { DataType } from "node-opcua";
import ts, { ModuleKind } from "typescript";
import { DataTypes, fromOPCType } from "@hive-command/scripting";
import { EventEmitter } from 'events';
import { merge, isEqual } from 'lodash'

export interface SidecarOptions {
    
    tags?: {name: string, type: string}[]
    types?: {name: string, fields: {name: string, type: string}[]}[]

    iot?: {
        host: string,
        user: string,
        pass: string
    }

    deviceMap?: {
        path: string,
        tag: string
    }[]

    subscriptionMap?: {
        path: string,
        tag: string
    }[] 
}

export class Sidecar {

    private client? : OPCUAClient;
    private clientEndpoint?: string;

    private subscription?: {events: EventEmitter, paths: {tag: string, path: string}[], unsubscribe: () => void};

    private mqttPublisher? : MQTTPublisher; 

    private options? : SidecarOptions;
    // private sessions : {[key: string]: ClientSession} = {};

    private conf : SidecarConf;
    

    private _values: any;

    private internalValues: any = {};
    private internalValueStore : any = {};

    constructor(config?: SidecarOptions){
        this.conf = new SidecarConf({ filename:  'hive-command.json', options: config });
    }

    get values(){
        return this._values;
    }

    async getDataType(client: OPCUAClient, path: string){;

        return await client.getType(path, true)
    }

    async setData(client: OPCUAClient, path: string, dataType: DataType, value: any){

        const statusCode = await client.setDetails(path, dataType, value)
        return statusCode?.value;
    }




    getTagPaths (object: any, parent?: string): any {
        // console.log("Get tag paths", object, parent)

        if(typeof(object) == 'object' && !Array.isArray(object)){
            return Object.keys(object).map((key) => this.getTagPaths(object[key], parent ? `${parent}.${key}` : key) ).reduce((prev, curr) => prev.concat((Array.isArray(curr) ? curr : [curr])), [])   
        }else{
            return {parent, tag: object};
        }
        
    }

    async setTag(tagPath: string, value: any){
        if(!this.client) return;

        const { deviceMap, subscriptionMap } = this.conf.getConf()

    // const setTag = (path: string, value: any, valueFn: (values: {path: string, value: any}[] ) => void ) => {
        let tag = deviceMap?.find((a) => a.path == tagPath)?.tag;

        if(tag?.indexOf('script://') == 0){

            const jsCode = ts.transpile(tag?.match(/script:\/\/([.\s\S]+)/)?.[1] || '', {module: ModuleKind.CommonJS})
            const { getter, setter } = load_exports(jsCode)
            
            return setter(value, this.values, async (values: any) => {
                
                let tags = this.getTagPaths(values) //.reduce((prev: any, curr: any) => [...prev, ...curr], []);

                let newValues = tags.map((t: any) => {
                 
                    let path = subscriptionMap?.find((a) => a.tag == t.parent)?.path
                    if(!path) return null;

                    return {
                        path,
                        value: t.tag
                    }

                })

                await Promise.all(newValues.map(async (value: any) => {

                    if(this.client){
                        const { type: dt, isArray } = await this.getDataType(this.client, value.path)

                        this.setData(this.client, value.path, (DataType as any)[dt as any], value.value)
                    }

                }))

            }) 
        }else{
            // let devicePath = deviceMap?.find((a) => a.path == path)?.tag
            // let valuePath = subscriptionMap?.find((a) => a.path == devicePath)?.tag;
            // console.log({valuePath, subscriptionMap, devicePath, deviceMap, path})
            if(!tag) return; //valueFn([]);

            const { type: dt, isArray } = await this.getDataType(this.client, tag)

            
            this.setData(this.client, tag, (DataType as any)[dt as any], value)

            // valueFn( [{path: tag, value}] ) 

            // console.log({tag})
            // tag?.split('.').reduce((prev, curr) => prev[curr], valueStore)
        }
    // }


    }


    parseValue(type: string, value: any){

        let isArray = type.indexOf('[]') > -1;
        
        if(isArray && !Array.isArray(value)) value = []
        if(isArray) type = type?.replace('[]', '') as any
        
        // switch(type){
        //     case DataTypes.Boolean:
        //         if(!value || value == false || value == 'false' || value == 0 || value == '0'){
        //             return false;
        //         }else if(value == true || value == 'true' || value == 1 || value == '1'){
        //             return true;
        //         }
        //         return false;
        //     case DataTypes.Number:
        //         return parseInt(value || 0);
        //     default:
        //         console.log("PARSE VALUE WITH TYPE", type)
        //         return value;
        // }

        switch (type) {
            case DataTypes.Boolean:
                return isArray ? value.map((value: any) => (value == true || value == "true" || value == 1 || value == "1")) : (value == true || value == "true" || value == 1 || value == "1");
            case DataTypes.Number:

                return isArray ? value.map((value: any) => {
                    let val = parseFloat(value || 0);
                    if (Number.isNaN(val)) {
                        val = 0;
                    }
                    return val.toFixed(2);
                }) : (() => {
                    let val = parseFloat(value || 0);

                    if(Number.isNaN(val)) {
                        val = 0;
                    }
                    return val.toFixed(2);
                })()
            default:
                console.log({ type })
                break;
        }
    }

    getTag(tagPath: string, tagType: string, valueStructure: any){

        const { deviceMap, subscriptionMap } = this.getConfig() || {}
        let tagValue = deviceMap?.find((a) => a.path === tagPath)?.tag;

        if(tagValue?.indexOf('script://') == 0){
            const jsCode = ts.transpile(tagValue?.match(/script:\/\/([.\s\S]+)/)?.[1] || '', {module: ModuleKind.CommonJS})
            const { getter, setter } = load_exports(jsCode)

            return this.parseValue(tagType, getter(valueStructure));
        }else{
            let rawTag = subscriptionMap?.find((a) => a.path == tagValue)?.tag
                
            return this.parseValue(tagType, rawTag?.split('.').reduce((prev, curr) => prev[curr], valueStructure))
        }
        
    }

    private normaliseValueStore(){
        const { subscriptionMap } = this.getConfig() || {};

        this.internalValues = subscriptionMap?.map((subscription) => {
            // let value = props.values[devicePath];
            let value = this.internalValueStore[subscription.tag] //.split('.').reduce((prev, curr) => prev?.[curr] || undefined, valueStore)

            if(subscription.tag.indexOf('.') > -1){
               return subscription.tag.split('.').reverse().reduce((prev, curr) => ({[curr]: prev}), value)
            }else{
               return {[subscription.tag]: value};
            }

           //  return obj
        }).reduce((prev, curr) => merge(prev, curr), {})
    }

    private normaliseValues(){
        let changed_keys : {key: string, value: any}[] = [];
        let old_values = Object.assign({}, this._values);

        const { tags, types } = this.getConfig() || {};

        this._values = tags?.map((tag) => {

            let type = types?.find((a) => a.name === tag.type);

            let hasFields = (type?.fields || []).length > 0;

            return {
                key: `${tag.name}`,
                value: hasFields ? type?.fields.map((field: any) => {
                    return { key: `${field.name}`, value: this.getTag(`${tag.name}.${field.name}`, field.type, this.internalValues) }
                }).reduce((prev: any, curr: any) => ({
                    ...prev,
                    [curr.key]: curr.value
                }), {}) : this.getTag(tag.name, tag.type, this.internalValues)
            }
        }).reduce((prev, curr) => ({
            ...prev,
            [curr.key]: curr.value
        }), {})

        Object.keys(this._values).forEach((valueKey) => {

            if(typeof(this._values[valueKey]) === "object" && !Array.isArray(this._values[valueKey]) ){

                Object.keys(this._values[valueKey]).map((subValueKey) => {
                    if(!isEqual(old_values[valueKey]?.[subValueKey], this._values[valueKey]?.[subValueKey])){
                        //TODO, go deeper
                        changed_keys.push({ key: `${valueKey}.${subValueKey}`, value: this._values[valueKey]?.[subValueKey] })
                    }
                })

            }else{
                if(!isEqual(old_values[valueKey], this._values[valueKey])){
                    //TODO, go deeper
                    changed_keys.push({ key: valueKey, value: this._values[valueKey] })
                }
            }
            
        })
        return changed_keys
    }

    async subscribe(client: OPCUAClient, paths: {tag: string, path: string}[]){

        console.log("Subscribing to", paths);

        const { monitors, unsubscribe, unwrap } = await client.subscribeMulti(paths, 200)

        const emitter = new EventEmitter()

        monitors?.on('changed', async (item, value, index) => {
            try{
                const key = unwrap(index)

                console.log("Datachanged at the OPCUA level", {key, value: value.value})

                this.internalValueStore = {
                    ...this.internalValueStore,
                    [key]: value.value
                }

                this.normaliseValueStore();

                const changed_keys = this.normaliseValues();

                changed_keys.map((changed) => {
                    emitter.emit('data-changed', { key: changed.key, value: changed.value })
                })
            }catch(e: any){
                console.log("Error in monitors.changed", e.message)
            }
        })
        
        return {emitter, unsubscribe};
    }

    async browse(client: OPCUAClient, browsePath: string, recursive?: boolean, withTypes?: boolean){
        // const endpointUrl = `opc.tcp://${host}:${port}`;
        console.log("Browse", browsePath)
        // const client = await this.connect(host);

        const browseResult = await client.browse(browsePath)

        let results : any[] = [];

        for(const reference of browseResult || []) {

            const name = reference?.browseName?.name?.toString();
            const nsIdx = reference?.browseName?.namespaceIndex?.toString();

            if(nsIdx == "0") continue;

            let bp = `${browsePath}/${nsIdx ? `${nsIdx}:` : ''}${name}`;

            if(recursive){
                try{
                    let {type, isArray} = withTypes ? await client.getType(bp, true) : {type: null, isArray: false};

                    const innerResults = await this.browse(client, bp, recursive, withTypes);

                    results.push({
                        id: reference?.nodeId, 
                        name: name, 
                        path: bp,
                        type: type ? fromOPCType(type) : undefined,
                        isArray,
                        children: innerResults
                    })
                }catch(e){
                    console.log({e, name})
                }
            }else{
                results.push(name)
            }

            // console.log( "   -> ", reference.browseName.toString());
            // results.push(reference.browseName.toString());
        }

        return results;
    }

    private async onClientLost(endpointUrl: string){
        console.log(`Connection to ${endpointUrl} lost. Retrying...`);
        //Reconnect client
        // try{
        //     await this.clients[endpointUrl].connect(endpointUrl);
        //     console.log(`Reconnected to ${endpointUrl}`);
        // }catch(e: any){
        //     //Backoff
        //     console.error(e.message)
        //     console.log("Retrying in 10 seconds...");
        //     setTimeout(() => {
        //         this.onClientLost(endpointUrl)
        //     }, 10 * 1000);
        // }

        //Resubscribe

        //Failover and message

    }

    async connect(host: string, port?: number){
        const endpointUrl = `opc.tcp://${host}${port ? `:${port}` : ''}`;

        console.log(`Getting connection instance for ${endpointUrl}`);

        //Check for host match if not reset
        if(this.clientEndpoint !== endpointUrl) {
            await this.client?.disconnect()
            this.clientEndpoint = undefined;
            this.client = undefined;
        } 

        if(this.client) return this.client;

        this.client = new OPCUAClient();


		this.client.on('close', this.onClientLost.bind(this, endpointUrl))
		this.client.on('connection_lost', this.onClientLost.bind(this, endpointUrl))

        await this.client.connect(endpointUrl)
        console.log(`Connected to ${endpointUrl}`)
      
        return this.client;

    }

    async setup_data(host: string, user: string, pass: string, exchange: string){

        if(this.mqttPublisher) return console.error("MQTT Publisher already existed");
        
        this.mqttPublisher = new MQTTPublisher({
            host: host,
            user: user,
            pass: pass,
            exchange: exchange || 'TestExchange'
        })

        try{
            await this.mqttPublisher.setup()
        }catch(e){
            console.log({e})
        }

        await this.mqttPublisher.subscribe(async (message) => {
            try{
                const { key, value } = message.messageContent;

                if(!this.client) {
                    return console.error("No client currently connected");
                }

                await this.setTag(key, value)

                // //Get OPCUA path from state
                // let path = this.subscription?.paths.find((a) => a.tag === key)?.path

                // if(!path) return console.error("Couldn't find ", key)

                // //Get OPCUA Datatype
                // const dataType = await this.getDataType(this.client, path)

                // //Update current state
                // this.setData(this.client, path, (DataType as any)[dataType.type as any], value)

                //Send update to frontend
            }catch(e){
                console.error("Error receiving MQTT Publish", message)
            }
        })

        console.log("MQTT Publisher started");
    }

    async publish_data(key: string, value: any){
        this.mqttPublisher?.publish(key, 'Boolean', value)
    }

    setConfig(options: SidecarOptions){
        this.conf.updateConf(options)
    }  

    getConfig(){
        return this.conf.getConf();
    }


}
