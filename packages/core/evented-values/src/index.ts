
import TypedEmitter from 'typed-emitter'
import { EventEmitter } from 'events';
import { debounce } from 'lodash';
import { diffKeys } from './utils';

export interface EventedValueField {
    name: string;
    type?: string;
    fields?: EventedValueField[];
}

export type ValueStoreEvents = {
    keysChanged: (changed: {key: string, value: any}[] ) => void;
}

export class EventedValueStore extends (EventEmitter as new () => TypedEmitter<ValueStoreEvents>) {

    values: any = {};

    private internalValues: any = {};

    private fields: EventedValueField[];

    constructor(options?: {
        fields?: EventedValueField[]
    }) {
        super();

        this.fields = options?.fields || [];

        this.slowNormaliser = debounce(this.slowNormaliser.bind(this), 500, {maxWait: 1000})
    }

    updateFields(fields: EventedValueField[]){
        this.fields = fields;
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
            this.internalValues[key] = this.cleanValue(value);

            console.log("updateValue", {key, value: this.internalValues[key], type: typeof(value)})
            
            this.slowNormaliser();
        })
    }

    private slowNormaliser(){
        let nv = this.normaliseValues()

        if (nv.length > 0) this.emit('keysChanged', nv);
    }

    //TODO Options
    //1) Make normalised values a standardised tick rate based update
    //2) Figure out dependencies and only run on segments of the values that will be updated by it
    private normaliseValues() {

        let old_values = Object.assign({}, this.values);

        if(this.fields.length > 0){
            this.values = this.fields.map((field) => {
                return (field?.fields || []).length > 0 ? 
                    (field.fields || []).map((subField) => this.internalValues[field.name][subField.name]).reduce((prev, curr) => ({...prev, ...curr}), {}) : 
                    this.internalValues[field.name]
            }).reduce((prev, curr) => ({
                ...prev,
                ...curr
            }), {})
        }else{
            this.values = Object.assign({}, this.internalValues)
        }
        return diffKeys(old_values, this.values)
    }

}