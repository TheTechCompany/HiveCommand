
import { BaseCommandDriver, DriverOptions } from '@hive-command/drivers-base';
import { CIP, ControllerManager, ManagedController, Tag, Types } from '@hive-command/ethernet-ip'
import { DataTypes } from '@hive-command/ethernet-ip/dist/enip/cip';
import { Observable, Subject  } from '@hive-command/threads/observable';

interface ENIPTag {
    name: string, 
    tag: Tag | null,
    children?: ENIPTag[]
    isArray?: boolean

    onChanged?: (value: any) => void,
    type?: any,
    getter?: () => any,
    setter?: (fn: (value: any) => void) => void
}
export default class EthernetIPDriver extends BaseCommandDriver {

    private controllerManager: ControllerManager = new ControllerManager();

    private controller: ManagedController;

    private tagList : any = {};

    private tags: {
        [key: string]: {
            name: string,
            subscribe: (fn: (value: any) => void) => void,
            value: () => any,
            write: (value: any) => void
        }
    } = {};

    private commandTags : ENIPTag[] = [];

    constructor(options: DriverOptions) {
        super(options);

        this.controller = this.controllerManager.addController(
            this.options.configuration?.host,
            this.options.configuration?.slot,
            this.options.configuration?.rpi,
            this.options.configuration?.connected
        )

        this.controller.on('Connected', () => {
            console.log("PLC connected...")
        })

        this.controller.on('Disconnected', () => {
            console.log("PLC disconnected...")
        })

        this.controller.on('Error', (e) => {
            console.error(e);
        })

        // this.controller.PLC.ta
    }

    async start() {
        try {
            await this.controller.connect()

            this.tagList = this.controller.PLC?.tagList.reduce((prev, curr) => {
                return {
                    ...prev,
                    [curr.name]: curr.type
                }
            }, {} as any)

        } catch (e) {
            console.error("Error starting driver", e);
        }
    }

    async subscribe(tags: { name: string; alias?: string; }[]): Promise<Observable<{ [key: string]: any }>> {
        return await new Promise(async (resolve) => {

            this.controller.PLC?.pauseScan();

            const subject = new Subject<{[key: string]: any}>();

            let plcTags : any[] = [];

            for(var i = 0; i < tags.length; i++){
               let tag = tags[i]
            // let plcTags = await Promise.all(tags.map(async (tag) => { 
                const plcTag = await this.addTag(tag.name);

                plcTag.subscribe((data: any) => {
                    subject.next({[tag.name]: data})
                })

                plcTags.push(plcTag)
                //return plcTag;
            } //));
            
            resolve(Observable.from(subject))
            
            this.controller.PLC?.scan();


        })
        
    }

    async read(tag: { name: string; alias?: string; }) {
        let plcTag = await this.addTag(tag.name)
        
        if (!plcTag) throw new Error(`Couldn't add tag ${tag.name}`)

        // if(plcTag.tag){
        //     await this.controller.PLC?.readTag(plcTag.tag);
        // }else if((plcTag.children || []).length > 0){
        //     await Promise.all((plcTag.children || []).map(async (x: any) => {
        //         await this.controller.PLC?.readTag(x.tag)
        //     }))
        // }

        // return plcTag?.getter?.() //tag.value;
    }

    private async writeTag(tag: Tag){
        try{
            await this.controller.PLC?.writeTag(tag);
        }catch(e){
            console.log(tag.name, tag.value, e)
        }
    }

    async write(tag: string, value: any) {
        let plcTag = await this.addTag(tag);
        
        // this.controller.PLC?.readTag()
        if (!plcTag) throw new Error(`Couldn't add tag ${tag}`)

        if(plcTag)
        // plcTag.tag.value = value;
        plcTag.write(value);

        console.log("Writing tag", tag, value);
        // await this.controller.PLC?.writeTag(plcTag)
    }


    private async addTag(tagPath: string, tagType?: string){ 

        if(this.tags[tagPath]){
            return this.tags[tagPath]
        }

        let createdTags : any[] = [];

        // let tagList = this.controller.PLC?.tagList.reduce((prev, curr) => {
        //     return {
        //         ...prev,
        //         [curr.name]: curr.type
        //     }
        // }, {} as any)
   
        let tagObject : {typeName: string, arrayDims: number, structureObj?: { [key: string]: {typeName: string, arrayDims?: number} } } = tagPath.split('.').reduce((orig, index) => (orig.structureObj || orig)[index], this.tagList);

        // if(tagPath.indexOf('Count') > -1) return;

        let isArray = tagObject?.arrayDims > 0 && tagObject?.typeName !== "BIT_STRING"

        let subscribe;
        let write; 

        if(tagObject?.structureObj){
            createdTags = await this.addTagObject(tagPath, tagObject.structureObj)

            write = (value: any) => {
                Object.keys(value).map((valueKey) => {
                    createdTags.find((a) => a.name == valueKey).tag.write(value[valueKey])
                })
            }

            subscribe = (fn: any) => {
                createdTags.map((x) => {
                    x.tag.subscribe(() => {
                        fn(
                            createdTags.map((y) => ({name: y.name, value: y.tag.value()}) ).reduce((prev, curr) => ({...prev, [curr.name]: curr.value}), {})
                        )
                    }) 
                })
            }
        }else if(isArray){
            createdTags = (await this.addTagArray(tagPath, tagObject.typeName)).sort((a, b) => a.name.localeCompare(b.name))

            write = (value: any) => {
                for(var i = 0; i < createdTags.length; i++){
                    if(value[i] !== undefined && value.length > i){
                        createdTags[i].tag.write(value[i]);
                    }
                }

                // Object.keys(value).map((valueKey) => {
                //     createdTags.find((a) => a.name == valueKey).tag.write(value[valueKey])
                // })
            }

            subscribe = (fn: any) => {
                
                createdTags.map((x) => {
                    // console.log()

                    x.tag.subscribe(() => {
                        fn(createdTags.map((y) => y.tag.value()));
                    })
                    // return x.tag.value()

                    // x.tag((data) => {
                    //     // fn(createdTags.map(()))
                    // })) 
                })
                // fn(val);
            }
        }else{
            let tag = this.controller.addTag(tagPath, null, Types[tagType as any] as any)
            
            createdTags = [{ name: tagPath, tag: tag }];

            write = (value: any) => {
                if(tag){

                    try{
                        if(!Number.isNaN(parseFloat(value))){
                            value = parseFloat(value)
                        }
                    }catch(e){}

                    tag.value = value;
                    this.writeTag(tag);
                }
            }

            subscribe = (fn: any) => {
                createdTags[0].tag.on('Initialized', (data: any) => { 
                    // console.log("RAW", tagPath, data.value)
                    fn(data.value) 
                }) 
                createdTags[0].tag.on('Changed', (data: any) => { 
                    // console.log("RAW", tagPath, data.value)
                    fn(data.value)
                }) 
            }

            // await new Promise((resolve) => {
            //     createdTags[0].tag.on('Initialized', (data: any) => {
            //         resolve(true)
            //     })
            // })
            // this.tags[tagPath]?.on('Initialized', (d) => console.log(tagPath, d.value));
            // this.tags[tagPath]?.on('Changed', (d) => console.log(tagPath, d.value));
        }


        // console.log({createdTags})



        // const get = () => {
        //     return createdTags.length > 1 ? createdTags.sort((a, b) => a.name.localeCompare(b.name)).map((x) => x.tag.value) : createdTags[0].tag.value;
        // }

        // const set = () => {

        // }

        this.tags[tagPath] = {
            name: tagPath,
            subscribe,
            write,
            value: () => {
                if(tagObject?.structureObj){
                    return createdTags.map((x) => ({name: x.name, value: x.tag.value()}) ).reduce((prev, curr) => ({...prev, [curr.name]: curr.value}), {})
                }else if(isArray){
                    return createdTags.map((x) => x.tag.value())
                }else{
                    return createdTags[0].tag.value;
                }
            }
        };

        return this.tags[tagPath] //createdTags.length > 1 ? createdTags : createdTags[0]


    }

    /*
        Add tag with array
    */
    private async addTagArray (tagPath: string, type?: string, program?: string, arraySize?: number) {
        const tag = this.controller.addTag(tagPath, program)

        let size : number = arraySize || await this.controller.PLC?.getTagArraySize(tag)

        let tags :any[] = [];

        for(var i = 0; i < size; i++){
            tags.push({
                name: `${i}`, 
                tag: await this.addTag( `${tagPath}[${i}]` ) //, program, Types[tag?.type as any] as any ) 
            })
        }

        return tags;
    }   

    /*
        Add tag with structure
    */
    private async addTagObject (tagPath: string, tagStructure: any, program?: string){
        let tags : any[] = [];

        let tagKeys = Object.keys(tagStructure);
        
        for(var i = 0; i < tagKeys.length; i++){
            const key = tagKeys[i];
        //  await Promise.all(Object.keys(tagStructure).map(async (key) => {

            // let type: CIP.DataTypes.Types = CIP.DataTypes.Types[((tagStructure || {})[key].typeName || 'DINT') as keyof typeof CIP.DataTypes.Types];

            tags.push({ name: key, tag: await this.addTag(`${tagPath}.${key}`) }) //, program, tagStructure[key] ) }) //, null, false, type, 10) })
        }

        return tags;
    }

}