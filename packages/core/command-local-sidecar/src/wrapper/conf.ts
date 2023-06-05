import { readFileSync, existsSync, writeFileSync } from 'fs';
import { LocalOptions } from '.';
import path from 'path';

export interface Configuration {
    deviceMap?: {
        path: string,
        tag: string
    }[]
    subscriptionMap?: {
        path: string,
        tag: string
    }[]
}

export class SidecarConf {

    private path?: string;

    private conf: LocalOptions = { tags: [], types: [], subscriptionMap: [] };

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