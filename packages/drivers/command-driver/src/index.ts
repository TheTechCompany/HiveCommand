/*
    Interface describing sidecar-driver

    - ENIP Bridge
        - Subscribes, Reads, Writes, GetInfo
    - 
*/
import { EventEmitter } from 'events'
import TypedEmitter from 'typed-emitter'
import { Observable } from 'observable-fns'

export interface DriverSubscription {
    success: boolean,
    unsubscribe?: () => void;
}

export type DriverEvents = {
    dataChanged: (data: any) => void
}

export interface DriverOptions {
    configuration?: any;
}


export abstract class BaseCommandDriver { 
    
    options : DriverOptions;

    constructor(options: DriverOptions){

        this.options = options;
    }

    updateConfiguration(options: DriverOptions){
        this.options = options;
    }

    abstract start(): Promise<void>;
    stop?(): Promise<void>;

    describe?(): any;

    subscribe?(
        tags: {name: string, alias?: string}[],
    ) : Promise<Observable<{[key: string]: any}>>;

    abstract read(tag: {name: string, alias?: string}): Promise<any>;
    readMany?(tags: {name: string, alias?: string}[]): Promise<any>;
   
    abstract write(
        tag: string,
        value: any
    ): Promise<void>;
    
    writeMany?(tags: { name: string, value: any }[] ): Promise<void>;
    
    
}

export class AbstractDriver extends BaseCommandDriver {

    // constructor(options: DriverOptions){
    //     super(options)
    // }

    async start(){

    }

    describe(){
        throw new Error("Describe not implemented yet")
    };

    subscribe(
        tags: {name: string, alias: string}[]
    ): Promise<Observable<{[key: string]: any}>> {
        throw new Error("Subscribe not implemented yet")
    }

    async read(
        tag: {name: string, alias: string}
    ){
        throw new Error("Read not implemented yet")
    };

    async readMany(
        tags: {name: string, alias: string}[]
    ){
        throw new Error("ReadMany not implemented yet")
    };

    async write(
        tag: string,
        value: any
    ){
        throw new Error("Write not implemented yet")
    }

    async writeMany(
        tags: {name: string, value: any}[]
    ){
        throw new Error("WriteMany not implemented yet")

    };

}