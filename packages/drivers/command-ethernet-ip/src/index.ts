
import { BaseCommandDriver, DriverOptions, DriverSubscription } from '@hive-command/drivers-base';
import { ControllerManager, ManagedController, Structure, Tag } from '@hive-command/ethernet-ip'
import { Observable } from 'threads/observable';

export default class EthernetIPDriver extends BaseCommandDriver {

    private controllerManager: ControllerManager = new ControllerManager();

    private controller: ManagedController;

    private tags : {[key: string]: Tag | null} = {};

    constructor(options: DriverOptions){
        super(options);

        this.controller = this.controllerManager.addController(
            this.options.configuration?.host, 
            this.options.configuration?.slot, 
            this.options.configuration?.rpi, 
            this.options.configuration?.connected
        )

        this.controllerManager.on('Error', (e) => {
            console.error(e);
        })

        // this.controller.PLC.ta
        console.log(this.options)
    }

    async start() {
        try{
            await this.controller.connect()
        }catch(e){
            console.error("Error starting driver", e);
        }
    }

    subscribe(tags: { name: string; alias: string; }[]): Observable<{[key: string]: any}> {

        return new Observable((observer) => {
    
            Promise.all(tags.map(async (tag ) => {

                let discoveredTag = this.controller.PLC?.tagList?.find((a) => a.name == tag.name?.split('.')?.[0])

                const plcTag = this.controller.addTag(tag.name, discoveredTag?.program)

                this.tags[tag.name] = plcTag;

                plcTag?.on('Initialized', (data: {value: Structure | Tag}) => {
                    observer.next({[tag.name]: data.value});
                })
                plcTag?.on('Changed', (data: {value: Tag | Structure}) => {
                    observer.next({[tag.name]: data.value});
                })
                
            }))

        })
    }

    async read(tag: { name: string; alias: string; }){
        let plcTag : Tag | null = this.tags[tag.name];
        if(!plcTag){
            plcTag = this.controller.addTag(tag);
        }

        if(!plcTag) throw new Error(`Couldn't add tag ${tag.name}`)
        await this.controller.PLC?.readTag(plcTag);
        return plcTag?.value;
    }

    async write(tag: string, value: any) {
        let plcTag : Tag | null = this.tags[tag];
        if(!plcTag){
            plcTag = this.controller.addTag(tag);
        }
        // this.controller.PLC?.readTag()
        if(!plcTag) throw new Error(`Couldn't add tag ${tag}`)
        plcTag.value = value;
        console.log("Writing tag", tag, value);
        await this.controller.PLC?.writeTag(plcTag)
    }


}