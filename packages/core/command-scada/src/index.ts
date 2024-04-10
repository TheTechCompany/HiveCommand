import { EventedValueStore } from '@hive-command/evented-values';
import { DriverRegistry } from './drivers';
import { EventEmitter } from 'events';
import { Configuration, LocalOptions } from './config'
import { MQTTClient } from '@hive-command/amqp-client';
import { mkdirSync, existsSync } from 'fs';
import path from 'path';
import { appData, formatValue } from './utils';
import { AlarmCenter, AlarmRegister, invertSnapshot, structureSnapshot } from '@hive-command/alarm-engine'
import { LocalRegister } from './alarms/local-register';

export class ScadaCommand extends EventEmitter {

    private conf?: Configuration;

    private client?: MQTTClient;

    private driverRegistry?: DriverRegistry;

    private eventedValues: EventedValueStore;

    private workingDirectory: string;

    private alarmEngine : AlarmCenter;
    private alarmRegister : AlarmRegister;

    private lastState: any;

    constructor(config?: LocalOptions) {
        super();

        this.workingDirectory = path.join(appData(), 'hive-command');

        if (!existsSync(this.workingDirectory)) {
            mkdirSync(this.workingDirectory)
        }

        this.conf = new Configuration({
            path: path.join(this.workingDirectory, 'hive-command.json'),
            options: config
        });

        this.eventedValues = new EventedValueStore();

        this.alarmRegister = new LocalRegister();
        this.alarmEngine = new AlarmCenter(this.alarmRegister);

        this.driverRegistry = new DriverRegistry({
            pluginDir: path.join(this.workingDirectory, 'hivecommand-plugins'),
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
                let { routingKey: key, messageContent: {value} } = message;

                if (!this.client) {
                    return console.error("No client currently connected");
                }

                console.log("SET TAG", key, value)

                try{ value = JSON.parse(value) }catch(err){ };

                if(!key) return console.error("Set Tag Failed: " + value)

                await this.setTag(key.replace(/\//, '.'), value)

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

                observable?.subscribe((dataPatch: any) => {
                    Object.keys(dataPatch).map((dataKey) => {
                        this.eventedValues.updateValue(dataKey, dataPatch[dataKey]);
                    })
                });
                
        
            }))

        }
    }

    getSnapshot(){
        return Object.assign({}, this.eventedValues.values)
    }

    getAlarmRegister(){
        return this.alarmRegister;
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

            let { key, value } = changed_item;
            if(key.indexOf('.') > -1){
                value = {[key?.split('.')?.[1]]: value}
                key = key?.split('.')?.[0]
            }

            await this.client?.publish(key, 'Boolean', value, Date.now())
        }))

        const conf = this.getConfig();

        const snapshot = structureSnapshot(this.eventedValues.values)
        
        this.alarmEngine.hook(
            conf?.alarms || [], 
            conf?.alarmPathways || [], 
            this.lastState,
            snapshot, 
            invertSnapshot(snapshot, conf?.tags || [])
        );

        this.lastState = snapshot;
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

            const observable = driver?.subscribe?.((subscriptionTags || []).map((tag) => ({ name: tag.name })))
            
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
