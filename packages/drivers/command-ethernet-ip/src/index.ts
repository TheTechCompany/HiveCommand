
import { BaseCommandDriver, DriverOptions, DriverSubscription } from '@hive-command/drivers-base';
import { ControllerManager, ManagedController } from '@hive-command/ethernet-ip'
import { Observable } from 'threads/observable';

export default class EthernetIPDriver extends BaseCommandDriver {

    private controllerManager: ControllerManager = new ControllerManager();

    private controller: ManagedController;

    constructor(options: DriverOptions){
        super(options);

        this.controller = this.controllerManager.addController(
            this.options.configuration?.host, 
            this.options.configuration?.slot, 
            this.options.configuration?.rpi, 
            this.options.configuration?.connected
        )

        console.log(this.options)
    }

    async start() {
        try{
            await this.controller.connect()
        }catch(e){
            console.error("Error starting driver", e);
        }
    }

    async subscribe(tags: { name: string; alias: string; }[]): Promise<Observable<{[key: string]: any}>> {

        return new Observable((observer) => {
    
            Promise.all(tags.map(async (tag) => {

                const plcTag = this.controller.addTag(tag.name)

                plcTag?.on('Changed', (data) => {
                    observer.next({[tag.name]: data.value});
                })
                
            }))

        })
    }

    async read(tag: { name: string; alias: string; }){
        const plcTag = this.controller.addTag(tag.name)
        if(!plcTag) throw new Error(`Couldn't add tag ${tag.name}`)
        await this.controller.PLC?.readTag(plcTag);
        return plcTag?.value;
    }

    async write(tag: string, value: any) {
        const plcTag = this.controller.addTag(tag);
        if(!plcTag) throw new Error(`Couldn't add tag ${tag}`)
        plcTag.value = value;
        await this.controller.PLC?.writeTag(tag)
    }


}