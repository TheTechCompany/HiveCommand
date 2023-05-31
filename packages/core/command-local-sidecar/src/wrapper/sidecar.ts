import { SidecarConf } from "./conf";
import { MQTTClient } from '@hive-command/amqp-client';

export interface LocalOptions {

    iot?: {
        host: string,
        user: string,
        pass: string,
        exchange: string
    }

    tags?: {}[]
    types?: {}[]
    subscriptionMap?: {}[]

}

export class Sidecar {

    private conf?: SidecarConf;

    private client? : MQTTClient;


    constructor(config?: LocalOptions) {
        // super(config);

        this.conf = new SidecarConf({ filename: 'hive-command.json', options: config });

        this.getConfig = this.getConfig.bind(this);

        if(config?.iot?.host){
            this.client = new MQTTClient({
                host: config?.iot?.host,
                user: config?.iot?.user,
                pass: config?.iot?.pass,
                exchange: config?.iot?.exchange
            })
        }

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
        
        // this.updateConfig(options);

        this.conf?.updateConf(options)
    }

    getConfig() {
        return this.conf?.getConf();
    }


}
