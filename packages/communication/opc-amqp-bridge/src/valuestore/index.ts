import { isEqual, merge, debounce, reject } from 'lodash';
import { OPCMQTTClient } from '..';
import { Runner } from '../runner';
import { diffKeys } from './utils';
import { EventEmitter } from 'events'
import crypto from 'crypto'
import { Worker } from 'worker_threads'

export interface ValueStoreOptions {
    subscriptionMap?: any[];

    tags?: any[];
    types?: any[];
}

export class ValueStore extends EventEmitter {
    private internalStore: any = {};

    private runner: Runner;

    values: any = {};

    private mqttClient: OPCMQTTClient;

    constructor(mqttClient: OPCMQTTClient, runner: Runner) {
        super();

        this.runner = runner;
        this.mqttClient = mqttClient;

        this.slowNormaliser = debounce(this.slowNormaliser.bind(this), 500, {maxWait: 1000})

    }

    get options() {
        return {
            tags: this.mqttClient.getConfig()?.tags,
            types: this.mqttClient.getConfig()?.types,
            subscriptionMap: this.mqttClient.getConfig()?.subscriptionMap
        }
    }

    get subscriptionMap(): { tag: string, path: string }[] {
        return this.options?.subscriptionMap || []
    }

    get types() {
        return this.options?.types || []
    }


    get tags() {
        return this.options?.tags || []
    }

    private cleanValue(value: any){
        switch(typeof(value)){
            case 'number':
                return value % 1 !== 0 ? value.toFixed(2) : value;
            case 'string':
                return value.replace(/\x00/g, '')
            default:
                return value;
        }
    }

    updateValue(key: string, value: any) {
        setTimeout(async () => {
            this.internalStore[key] = this.cleanValue(value);

            console.log("updateValue", {key, value: this.internalStore[key], type: typeof(value)})

            this.slowNormaliser();
        })
    }

    slowNormaliser(){
        let nv = this.normaliseValues(this.tags, this.types)

        if (nv.length > 0) this.emit('keys-changed', nv);
    }

    get internalValues() {
        return this.subscriptionMap?.map((subscription) => {
            // let value = props.values[devicePath];
            let value = this.internalStore[subscription.tag] //.split('.').reduce((prev, curr) => prev?.[curr] || undefined, valueStore)

            if (subscription.tag.indexOf('.') > -1) {
                return subscription.tag.split('.').reverse().reduce((prev, curr) => ({ [curr]: prev }), value)
            } else {
                return { [subscription.tag]: value };
            }

        }).reduce((prev, curr) => merge(prev, curr), {})
    }

    //TODO Options
    //1) Make normalised values a standardised tick rate based update
    //2) Figure out dependencies and only run on segments of the values that will be updated by it
    private normaliseValues(tags: any[], types: any[]) {

        // return new Promise<{workerData: any[]}>((resolve, reject) => {
        //     const worker = new Worker('./normalise.js', {
        //         workerData: {
        //             tags, 
        //             types, 
        //             values: this.values, 
        //             internalValues: this.internalValues, 
        //             runner: this.runner
        //         }
        //     })

        //     worker.on('message', resolve);
        //     worker.on('error', reject);
        //     worker.on('exit', (code) => {
        //     if (code !== 0)
        //         reject(new Error(`Worker stopped with exit code ${code}`));
        //     })
            
        // })

        let old_values = Object.assign({}, this.values);

        this.values = tags?.map((tag) => {

            let type = types?.find((a) => a.name === tag.type);

            let hasFields = (type?.fields || []).length > 0;

            let value;

            if (hasFields) {
                value = type?.fields.map((field: any) => {
                    let value;
                    try {
                        value = this.runner.getTag(`${tag.name}.${field.name}`, field.type, this.internalValues);
                    } catch (e) {
                        console.error(`Error getting tag value for ${tag.name}.${field.name}`)
                    }
                    return { key: `${field.name}`, value: value }

                }).reduce((prev: any, curr: any) => ({
                    ...prev,
                    [curr.key]: curr.value
                }), {})
            } else {
                try {
                    value = this.runner.getTag(tag.name, tag.type, this.internalValues)
                } catch (e) {
                    console.error(`Error getting tag value for ${tag.name}`)
                }
            }

            return {
                key: `${tag.name}`,
                value
            }
        }).reduce((prev, curr) => ({
            ...prev,
            [curr.key]: curr.value
        }), {})

        
        return diffKeys(old_values, this.values)
    }

}