import { BaseCommandDriver, DriverOptions } from '@hive-command/drivers-base';
import OPCUAClient from '@hive-command/opcua-client'
import { DataType } from 'node-opcua';
import { Observable, Subject } from 'observable-fns';

export default class OPCUADriver extends BaseCommandDriver {
    
    private client : OPCUAClient;

    private basePath : string;

    constructor(options: DriverOptions){
        super(options);
        this.client = new OPCUAClient();

        this.basePath = options.configuration?.basePath;
    }

    async start() {
        await this.client.connect(this.options.configuration?.endpoint)
    }

    async subscribe(tags: { name: string; alias?: string | undefined; }[]): Promise<Observable<{ [key: string]: any; }>> {
        return await new Promise(async (resolve) => {

            const { monitors, unsubscribe, unwrap } = await this.client.subscribeMulti([], 500)

            const subject = new Subject<{[key: string]: any}>();


            resolve(Observable.from(subject));
    
        })

    }

    async read(tag: { name: string; alias: string; }) {
        const dv = await this.client.getDetails(tag.name)
        return dv?.value.value;
    }

    async write(tag: string, value: any) {
        await this.client.setDetails(tag, DataType.Boolean, value);
    }
}