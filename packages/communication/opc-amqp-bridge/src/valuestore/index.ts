import { isEqual, merge } from 'lodash';
import { OPCMQTTClient } from '..';
import { Runner } from '../runner';
import { diffKeys } from './utils';
import { EventEmitter } from 'events'
import crypto from 'crypto'

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

    updateValue(key: string, value: any) {
        console.time('updatedValue: ' + key);

        this.internalStore[key] = value;

        //  {
        //     ...this.internalStore,
        //     [key]: value
        // }

        // this.normaliseInternalValues();


        let nv = this.normaliseValues(this.tags, this.types)
        console.timeEnd('updatedValue: ' + key);

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

            //  return obj
        }).reduce((prev, curr) => merge(prev, curr), {})
    }

    private normaliseValues(tags: any[], types: any[]) {

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