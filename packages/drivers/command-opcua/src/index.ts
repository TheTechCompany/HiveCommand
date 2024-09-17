import { BaseCommandDriver, DriverOptions } from '@hive-command/drivers-base';
import OPCUAClient from '@hive-command/opcua-client'
import { DataType } from 'node-opcua';
import { Observable, Subject } from 'observable-fns';
import { SingleBar } from 'cli-progress'

export default class OPCUADriver extends BaseCommandDriver {

    private client: OPCUAClient;

    private basePath: string;
    private namespace: string;

    public ready: boolean = false;

    constructor(options: DriverOptions) {
        super(options);
        this.client = new OPCUAClient();

        this.namespace = options.configuration?.namespace;
        this.basePath = options.configuration?.basePath;
    }

    async start() {
        await this.client.connect(this.options.configuration?.endpoint)
    }

    async stop() {
        await this.client.disconnect()
    }

    async subscribe(tags: { name: string; alias?: string | undefined; }[]): Promise<Observable<{ [key: string]: any; }>> {


        return await new Promise(async (resolve) => {
            const subject = new Subject<{ [key: string]: any }>();

            //Map tags
            const subscribeTags = tags.map((tag) => {
                let parts = tag.name.split('.');

                if (parts.length > 1) {
                    return {
                        path: `${this.basePath}/${parts.map((x) => `${this.namespace}:${x}`).join('/')}`,
                        tag: tag.name
                    }
                } else {
                    return {
                        path: `${this.basePath}/${this.namespace}:${tag.name}`,
                        tag: tag.name
                    }
                }
            });

            const bar1 = new SingleBar({});

            bar1.start(subscribeTags.length, 0);

            const p = new Promise(async (resolve) => {

                //First read
                console.log(`Performing first read of ${subscribeTags.length} tags`);
                for (var i = 0; i < subscribeTags.length; i++) {
                    const tag = subscribeTags[i];
                    const dv = await this.client.getDetails(tag.path)

                    subject.next({ [tag.tag]: dv?.value.value })

                    bar1.update(i);
                }

                bar1.stop();

                console.log(`Performed first read of ${subscribeTags.length}`)

                this.ready = true;

                //Subscribe

                const { monitors, unsubscribe, unwrap } = await this.client.subscribeMulti(subscribeTags, 500)


                monitors?.on('changed', (monitoredItem, dv, index) => {
                    const key = unwrap(index);
                    const value = dv.value.value;

                    subject.next({ [key]: value });
                })

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
        if (tag_parts.length > 1) {
            path = `${this.basePath}/${tag_parts.map((x) => `${this.namespace}:${x}`).join('/')}`
        } else {
            path = `${this.basePath}/${this.namespace}:${tag}`
        }

        let dataType = DataType.Boolean;

        switch (typeof (value)) {
            case 'number':
            case 'bigint':
                //Maybe do check here for Double/Float/Int
                const typeInfo = await this.client.getType(path);
                dataType = (typeInfo.type as any) || DataType.Float
                break;
            case 'string':
                dataType = DataType.String;
                break;
        }

        await this.client.setDetails(path, dataType, value);
    }
}