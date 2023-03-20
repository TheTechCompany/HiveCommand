import { SidecarConf } from "./conf";
import { OPCMQTTClient } from '@hive-command/opcua-mqtt-client';

export interface SidecarOptions {

    tags?: { name: string, type: string }[]
    types?: { name: string, fields: { name: string, type: string }[] }[]

    iot?: {
        host: string,
        user: string,
        pass: string
    }

    opcuaServer?: string;

    deviceMap?: {
        path: string,
        tag: string
    }[]

    subscriptionMap?: {
        path: string,
        tag: string
    }[]
}

export class Sidecar extends OPCMQTTClient {

    private conf: SidecarConf;


    constructor(config?: SidecarOptions) {
        super(config);

        this.conf = new SidecarConf({ filename: 'hive-command.json', options: config });

    }

    getTagPaths(object: any, parent?: string): any {
        // console.log("Get tag paths", object, parent)

        if (typeof (object) == 'object' && !Array.isArray(object)) {
            return Object.keys(object).map((key) => this.getTagPaths(object[key], parent ? `${parent}.${key}` : key)).reduce((prev, curr) => prev.concat((Array.isArray(curr) ? curr : [curr])), [])
        } else {
            return { parent, tag: object };
        }

    }


    setConfig(options: SidecarOptions) {
        this.options = options;
        this.conf.updateConf(options)
    }

    getConfig() {
        return this.conf.getConf();
    }


}
