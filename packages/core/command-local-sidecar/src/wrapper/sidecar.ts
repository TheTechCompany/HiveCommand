import { DriverRegistry } from "../driver";
import { SidecarConf } from "./conf";
import { MQTTClient } from '@hive-command/amqp-client';
import { EventEmitter } from 'events'
import { EventedValueStore } from '@hive-command/evented-values'
import path from 'path';
import { mkdirSync, existsSync } from 'fs';

export interface LocalOptions {


    dataScopes?: {
        id: string,
        name: string,
        configuration: any,

        plugin: {
            id: string,
            module: string,
            configuration: any,
        }
    }[]

    iot?: {
        host: string,
        user: string,
        pass: string,
        exchange: string
    }

    interface?: any[];

    tags?: {
        name: string,
        type: string,
        scope?: {
            id: string,
            plugin: {
                module: string
            }
        }
    }[]
    types?: {
        name: string,
        fields: {
            name: string,
            type: string
        }[]
    }[]


    subscriptionMap?: {}[]

}

const formatValue = (value: any, type: string) => {
    switch(type){
        case 'String':
            return value.toString()
        case 'Number':
            return parseFloat(value);
        default:
            return value;
    }
}


const appData = () => {
    return process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share")
}

export class Sidecar extends EventEmitter {

    private conf?: SidecarConf;

    private client?: MQTTClient;

    private driverRegistry?: DriverRegistry;

    private eventedValues: EventedValueStore;

    private cwd: string;

    constructor(config?: LocalOptions) {
        super();

        this.cwd = path.join(appData(), 'hive-command');

        if (!existsSync(this.cwd)) {
            mkdirSync(this.cwd)
        }

        this.conf = new SidecarConf({
            path: path.join(this.cwd, 'hive-command.json'),
            options: config
        });

        this.eventedValues = new EventedValueStore();

        this.driverRegistry = new DriverRegistry({
            pluginDir: path.join(this.cwd, 'hivecommand-plugins'),
            valueStore: this.eventedValues
        })

        this.eventedValues.on('keysChanged', this.onValueStoreChange.bind(this))

        this.getConfig = this.getConfig.bind(this);

        if (this.options?.iot?.host) {
            this.client = new MQTTClient({
                host: this.options?.iot?.host,
                user: this.options?.iot?.user,
                pass: this.options?.iot?.pass,
                exchange: this.options?.iot?.exchange
            })
        }

    }

    get options() {
        return this.conf?.getConf()
    }

    async setup() {
        await this.driverRegistry?.setup()


        await this.client?.connect(async (message) => {
            try {
                const { routingKey: key, messageContent: {value} } = message;

                if (!this.client) {
                    return console.error("No client currently connected");
                }

                console.log("SET TAG", key, value)

                if(!key) return console.error("Set Tag Failed: " + value)

                await this.setTag(key.replace(/\//, '.'), value)

                // await Promise.all((setTags || []).map(async (tags) => {
                //     await this.setData(tags.tag, tags.dataType, tags.value)
                // }))


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

        if (this.options?.dataScopes) {
            let drivers = [...new Set(this.options.dataScopes.map((x) => x.plugin.module))].map((x) => ({ pkg: x }))
            await this.ensureDrivers(drivers)

            await Promise.all((this.options?.dataScopes || []).map(async (dataScope) => {
                const configuration = Object.keys(dataScope.plugin.configuration).map((x) => ({
                    [x]: formatValue(dataScope.configuration[x], dataScope.plugin.configuration[x])
                })).reduce((prev, curr) => ({...prev, ...curr}), {})
                
                const driver = await this.driverRegistry?.loadDriver(dataScope.plugin.module, configuration)

                let subscriptionTags = this.options?.tags?.filter((a) => a.scope?.id == dataScope.id).map((tag) => {
                    let type = this.options?.types?.find((a) => a.name === tag.type)
    
                    if(type){
                        return type.fields.map((x) => ({name: `${tag.name}.${x.name}`}) )
                    }else{
                        return [tag];
                    }
                }).reduce((prev, curr) => prev.concat(curr), []);

                // (driver as any).sub()
                const observable = driver?.subscribe?.( (subscriptionTags || []).map((tag) => ({ name: tag.name })) );

                (observable as any)?.subscribe((dataPatch: any) => {
                    Object.keys(dataPatch).map((dataKey) => {
                        this.eventedValues.updateValue(dataKey, dataPatch[dataKey]);
                    })
                });
                
        
            }))

        }
    }

    getSnapshot(){
        return this.eventedValues.values
    }

    async ensureDrivers(drivers: any[]) {
        await this.driverRegistry?.ensureDrivers(drivers)
    }

    async setTag(tagPath: string, value: any, retryCount?: number){
        let tagRoot = tagPath.split('.')?.[0];
        let tagSubkey = tagPath.split('.')?.[1];

        let tagOption = this.options?.tags?.find((a) => a.name == tagRoot);

        if(tagOption?.scope){
            const plugin = this.driverRegistry?.getDriver(tagOption.scope.plugin.module)
            try{
                await plugin?.write(tagPath, value);
                this.eventedValues.updateValue(tagPath, value)
            }catch(e){
                if(retryCount && retryCount < 3){
                    await new Promise((resolve) => setTimeout(() => { resolve(true) }, 1000));
                    await this.setTag(tagPath, value, (retryCount || 0) + 1)
                }else{
                    console.log("setTag Failed", e);
                }
            }
        }
    }

    private async onValueStoreChange(changed: { key: string, value: any }[]) {
        await Promise.all(changed.map(async (changed_item) => {
            this.emit('values-changed', changed_item)
            await this.client?.publish(changed_item.key, 'Boolean', changed_item.value, Date.now())
        }))
    }


    getTagPaths(object: any, parent?: string): any {
        if (typeof (object) == 'object' && !Array.isArray(object)) {
            return Object.keys(object).map((key) => this.getTagPaths(object[key], parent ? `${parent}.${key}` : key)).reduce((prev, curr) => prev.concat((Array.isArray(curr) ? curr : [curr])), [])
        } else {
            return { parent, tag: object };
        }
    }


    setConfig(options: LocalOptions) {
        this.conf?.updateConf(options)

        console.log("Options", { options });

        // this.updateConfig(options);
        this.eventedValues.updateFields(
            (options.tags || []).map((tag) => {
                let type = options.types?.find((a) => a.name == tag.type)
                return type ? {
                    name: tag.name,
                    fields: type.fields,
                } : {
                    name: tag.name,
                    type: tag.type
                }
            })
        )

        Promise.all((this.options?.dataScopes || []).map(async (dataScope) => {
            const configuration = Object.keys(dataScope.plugin.configuration).map((x) => ({
                [x]: formatValue(dataScope.configuration[x], dataScope.plugin.configuration[x])
            })).reduce((prev, curr) => ({...prev, ...curr}), {})

            const driver = await this.driverRegistry?.loadDriver(dataScope.plugin.module, configuration)

            let subscriptionTags = this.options?.tags?.filter((a) => a.scope?.id == dataScope.id).map((tag) => {
                let type = this.options?.types?.find((a) => a.name === tag.type)

                if(type){
                    return type.fields.map((x) => ({name: `${tag.name}.${x.name}`}) )
                }else{
                    return [tag];
                }
            }).reduce((prev, curr) => prev.concat(curr), []);

            const observable = await driver?.subscribe?.((subscriptionTags || []).map((tag) => ({ name: tag.name })))
            
            observable?.subscribe((dataPatch) => {
                Object.keys(dataPatch).map((dataKey) => {
                    this.eventedValues.updateValue(dataKey, dataPatch[dataKey]);
                })
            })

        }))

    }

    getConfig() {
        return this.conf?.getConf();
    }



}
