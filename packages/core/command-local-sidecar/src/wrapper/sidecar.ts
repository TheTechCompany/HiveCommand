import { SidecarConf } from "./conf";
import { OPCMQTTClient, SidecarOptions } from '@hive-command/opcua-amqp-bridge';

export interface LocalOptions extends SidecarOptions {

    iot?: {
        host: string,
        user: string,
        pass: string,
        exchange: string
    }

}

export class Sidecar extends OPCMQTTClient {

    private conf?: SidecarConf;


    constructor(config?: LocalOptions) {
        super(config);

        this.conf = new SidecarConf({ filename: 'hive-command.json', options: config });

        this.getConfig = this.getConfig.bind(this);

    }

    getTagPaths(object: any, parent?: string): any {
        // console.log("Get tag paths", object, parent)

        if (typeof (object) == 'object' && !Array.isArray(object)) {
            return Object.keys(object).map((key) => this.getTagPaths(object[key], parent ? `${parent}.${key}` : key)).reduce((prev, curr) => prev.concat((Array.isArray(curr) ? curr : [curr])), [])
        } else {
            return { parent, tag: object };
        }

    }


    setConfig(options: LocalOptions) {
        // this.options = options;

        console.log("Options", {options});

        this.conf?.updateConf(options)
        this.emit('config-update', options);
    }

    getConfig() {
        return this.conf?.getConf();
    }


}
