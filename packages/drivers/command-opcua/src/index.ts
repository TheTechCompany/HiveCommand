import { BaseCommandDriver, DriverOptions } from '@hive-command/drivers-base';
import OPCUAClient from '@hive-command/opcua-client'
import { DataType } from 'node-opcua';

export default class OPCUADriver extends BaseCommandDriver {
    
    private client : OPCUAClient;

    constructor(options: DriverOptions){
        super(options);
        this.client = new OPCUAClient();
    }

    async start() {
        await this.client.connect(this.options.configuration?.endpoint)
    }

    async read(tag: { name: string; alias: string; }) {
        const dv = await this.client.getDetails(tag.name)
        return dv?.value.value;
    }

    async write(tag: string, value: any) {
        await this.client.setDetails(tag, DataType.Boolean, value);
    }
}