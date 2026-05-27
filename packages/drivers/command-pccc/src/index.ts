import { BaseCommandDriver, DriverOptions } from "@hive-command/drivers-base";
import { Observable, Subject } from "observable-fns";

const NodePCCC = require('nodepccc');

export default class PCCCDriver extends BaseCommandDriver {

    private client: typeof NodePCCC;

    constructor(options: DriverOptions) {
        super(options);

        this.client = new NodePCCC;
    }

    start(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.client.initiateConnection({
                host: this.options.configuration?.host,
                port: this.options.configuration?.port
            }, (err: any) => {
                if (err) return reject(err);
                resolve();
            });
        })
    }


    subscribe(tags: { name: string; alias?: string; }[]): Promise<Observable<{ [key: string]: any; }>> {
        return new Promise(async (resolve) => {

            this.client.addItems(tags?.map((x) => x.name?.replace(/\./g, ':')));

            const subject = new Subject<{ [key: string]: any }>();

            setInterval(() => {
                this.client.readAllItems((err: any, values: any) => {
                    if (err) console.error(err);

                    //Change key in values object from : to .
                    Object.keys(values).forEach((key) => {
                        values[key.replace(/\:/g, '.')] = values[key];
                        delete values[key];
                    });
                    subject.next(values)
                });
            }, 5 * 1000)

            // let plcTags : any[] = [];

            // for(var i = 0; i < tags.length; i++){
            //    let tag = tags[i]
            // // let plcTags = await Promise.all(tags.map(async (tag) => { 
            //     const plcTag = await this.addTag(tag.name);

            //     plcTag.subscribe((data: any) => {
            //         subject.next({[tag.name]: data})
            //     })

            //     plcTags.push(plcTag)
            //     //return plcTag;
            // } //));

            resolve(Observable.from(subject))
        })
    }

    read(tag: { name: string; alias?: string; }): Promise<any> {
        throw new Error("Method not implemented.");
    }
    write(tag: string, value: any): Promise<void> {
        throw new Error("Method not implemented.");
    }

}
