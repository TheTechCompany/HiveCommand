import { BaseCommandDriver, DriverOptions } from '@hive-command/drivers-base';
import OPCUAClient from '@hive-command/opcua-client'
import { DataType } from 'node-opcua';
import { Observable, Subject } from 'observable-fns';

export default class OPCUADriver extends BaseCommandDriver {
    
    private client : OPCUAClient;

    private basePath : string;
    private namespace: string;

    constructor(options: DriverOptions){
        super(options);
        this.client = new OPCUAClient();

        this.namespace = options.configuration?.namespace;
        this.basePath = options.configuration?.basePath;
    }

    async start() {
        await this.client.connect(this.options.configuration?.endpoint)
    }

    async stop(){
        await this.client.disconnect()
    }

    async subscribe(tags: { name: string; alias?: string | undefined; }[]): Promise<Observable<{ [key: string]: any; }>> {
        return await new Promise(async (resolve) => {

            const subscribeTags = tags.map((tag) => {
                let parts = tag.name.split('.');

                if(parts.length > 1){
                    return {
                        path: `${this.basePath}/${parts.map((x) => `${this.namespace}:${x}`).join('/')}`,
                        tag: tag.name
                    }
                }else{
                    return {
                        path: `${this.basePath}/${this.namespace}:${tag.name}`,
                        tag: tag.name
                    }
                }
            });

            const { monitors, unsubscribe, unwrap } = await this.client.subscribeMulti(subscribeTags, 500)

            const subject = new Subject<{[key: string]: any}>();

            monitors?.on('changed', (monitoredItem, dv, index) => {
                const key = unwrap(index);
                const value = dv.value.value;

                subject.next({[key]: value});
            })

            resolve(Observable.from(subject));
        })

    }

    async read(tag: { name: string; alias: string; }) {
        const path = `${this.basePath}/${this.namespace}:${tag.name}`;

        const dv = await this.client.getDetails(path)
        return dv?.value.value;
    }

    async write(tag: string, value: any) {
        const tag_parts = tag.split('.');
        
        let path = '';
        if(tag_parts.length > 1){
            path = `${this.basePath}/${tag_parts.map((x) => `${this.namespace}:${x}`).join('/')}`
        }else{
            path = `${this.basePath}/${this.namespace}:${tag}`
        }

        await this.client.setDetails(path, DataType.Boolean, value);
    }
}