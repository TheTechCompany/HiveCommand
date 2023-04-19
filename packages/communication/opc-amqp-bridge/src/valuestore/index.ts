import { isEqual, merge } from 'lodash';
import { OPCMQTTClient } from '..';
import { Runner } from '../runner';

export interface ValueStoreOptions {
    subscriptionMap?: any[];

    tags?: any[];
    types?: any[];
}

export class ValueStore {
    private internalStore : any = {};

    private runner: Runner;

    values: any = {};

    private mqttClient: OPCMQTTClient;

    constructor(mqttClient: OPCMQTTClient, runner: Runner){
        this.runner = runner;
        this.mqttClient = mqttClient;        
    }

    get options(){
        return {
            tags: this.mqttClient.options?.tags,
            types: this.mqttClient.options?.types,
            subscriptionMap: this.mqttClient.options?.subscriptionMap
        }
    }

    get subscriptionMap(): {tag: string, path: string}[]{
        return this.options?.subscriptionMap || []
    }

    get types(){
        return this.options?.types || []
    }


    get tags(){
        return this.options?.tags || []
    }

    updateValue(key: string, value: any) {
        console.time('updateValue: '+ key);
        this.internalStore = {
            ...this.internalStore,
            [key]: value
        }

        // this.normaliseInternalValues();

        let nv = this.normaliseValues(this.tags, this.types)
        console.timeEnd('updateValue: '+ key);
        return nv;
    }

    get internalValues(){
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
        let changed_keys: { key: string, value: any }[] = [];
        let old_values = Object.assign({}, this.values);

        // const { tags, types } = this.getConfig() || {};

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

        Object.keys(this.values).forEach((valueKey) => {

            if(this.values[valueKey] != undefined && this.values[valueKey] != null){

                if (typeof (this.values[valueKey]) === "object" && !Array.isArray(this.values[valueKey])) {

                    Object.keys(this.values[valueKey]).map((subValueKey) => {
                        if(this.values[valueKey]?.[subValueKey] != undefined && this.values[valueKey]?.[subValueKey] != null){
                            if ((old_values[valueKey]?.[subValueKey] == null || old_values[valueKey]?.[subValueKey] == undefined) || !isEqual(old_values[valueKey]?.[subValueKey], this.values[valueKey]?.[subValueKey])) {
                                //TODO, go deeper
                                changed_keys.push({ key: valueKey, value: {[subValueKey]: this.values[valueKey]?.[subValueKey]} })
                            }
                        }
                    })


                } else {
                    if ((old_values[valueKey] == null || old_values[valueKey] == undefined) || !isEqual(old_values[valueKey], this.values[valueKey])) {
                        //TODO, go deeper
                        changed_keys.push({ key: valueKey, value: this.values[valueKey] })
                    }
                }
                
            }

        })
        return changed_keys
    }

}