import { DriverRegistry } from "../driver";
import { SidecarConf } from "./conf";
import { MQTTClient } from '@hive-command/amqp-client';
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

const appData = () => {
    return process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share")
}

export class Sidecar {

    private conf?: SidecarConf;

    private client?: MQTTClient;

    private driverRegistry?: DriverRegistry;

    private eventedValues: EventedValueStore;

    private cwd: string;

    constructor(config?: LocalOptions) {
        // super(config);

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

        if (this.options?.dataScopes) {
            let drivers = [...new Set(this.options.dataScopes.map((x) => x.plugin.module))].map((x) => ({ pkg: x }))
            await this.ensureDrivers(drivers)

            await Promise.all((this.options?.dataScopes || []).map(async (dataScope) => {
                const driver = await this.driverRegistry?.loadDriver(dataScope.plugin.module, dataScope.configuration)

                let subscriptionTags = this.options?.tags?.filter((a) => a.scope?.id == dataScope.id)

                const observable = await driver?.subscribe?.( (subscriptionTags || []).map((tag) => ({ name: tag.name })) )

                observable?.subscribe((dataPatch) => {
                    Object.keys(dataPatch).map((dataKey) => {
                        this.eventedValues.updateValue(dataKey, dataPatch[dataKey]);
                    })
                })
                
        
            }))

        }
    }

    async ensureDrivers(drivers: any[]) {
        await this.driverRegistry?.ensureDrivers(drivers)
    }

    private async onValueStoreChange(changed: { key: string, value: any }[]) {
        await Promise.all(changed.map(async (changed_item) => {
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
            const driver = await this.driverRegistry?.loadDriver(dataScope.plugin.module, dataScope.configuration)

            let subscriptionTags = this.options?.tags?.filter((a) => a.scope?.id == dataScope.id)

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
