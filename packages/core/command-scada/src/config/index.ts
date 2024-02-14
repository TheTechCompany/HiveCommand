import { HMITag } from '@hive-command/interface-types';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import path from 'path';


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

    tags?: HMITag[]
    // {
    //     name: string,
    //     type: string,
    //     scope?: {
    //         id: string,
    //         plugin: {
    //             module: string
    //         }
    //     }
    // // }[]
    types?: {
        name: string,
        fields: {
            name: string,
            type: string
        }[]
    }[]
    
    alarms?: {
        id: string;
        title: string,
        script: string
    }[]

    alarmPathways?: {
        id: string;
        name: string;
        script: string;
    }[]


}


export class Configuration {

    private path?: string;

    private conf: LocalOptions = { tags: [], types: [] };

    constructor(opts: { options?: LocalOptions, path?: string }) {
        // if(opts.filename){
        //     this.path = path.join(this.appData, opts.filename);
        // }else if(opts.path){
        this.path = opts.path;
        // }

        if (opts.options) {
            this.conf = opts.options;
        } else {
            const existingData = this.rehydrate();
            console.log({ existingData })
            this.conf = existingData || {};
        }
    }

    get appData() {
        return process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share")
    }

    updateConf(conf: LocalOptions) {
        this.conf = conf;
        this.dehydrate()
    }

    getConf() {
        return this.conf
    }

    readFile() {
        if (!this.path) throw new Error("No path specified");
        return readFileSync(this.path, 'utf8')
    }

    writeFile(data: any) {
        if (!this.path) throw new Error("No path specified");
        writeFileSync(this.path, JSON.stringify(data), 'utf-8')
    }

    rehydrate() {
        if (this.confExists()) {
            try {
                const confJson = JSON.parse(this.readFile() || '{}')
                return confJson;
            } catch (e) {
                console.error("Rehydrate errror ", e)
            }
        }
        return null;
    }

    dehydrate() {
        this.writeFile(this.conf)
    }

    confExists() {
        if (!this.path) throw new Error("No path specified");
        return existsSync(this.path);
    }



}