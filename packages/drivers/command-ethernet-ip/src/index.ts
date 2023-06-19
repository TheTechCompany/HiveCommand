
import { BaseCommandDriver, DriverOptions } from '@hive-command/drivers-base';
import { CIP, ControllerManager, ManagedController, Tag, Types } from '@hive-command/ethernet-ip'
import { Observable  } from '@hive-command/threads/observable';

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
        } catch (e) {
            console.error("Error starting driver", e);
        }
    }

    async subscribe(tags: { name: string; alias?: string; }[]): Promise<Observable<{ [key: string]: any }>> {
        return await new Promise(async (resolve) => {

            let plcTags: any[]  = [];

            for(var i = 0; i < tags.length; i++){
                let tag = tags[i]

                const plcTag = await this.addTag(tag.name) 

                plcTags.push(plcTag)
            }

            const observer = new Observable<{[key: string]: any}>((observer) => {

                plcTags.map((plcTag) => {
                    plcTag.subscribe((data: any) => {
                        observer.next({[plcTag.name]: data})
                    })
                })
                
    
            })

            resolve(observer)
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

        // if (Array.isArray(value)) {
        //     //Value is array, write to all subindexes
        //     await Promise.all(value.map(async (idx_value, ix) => {

        //         let t =  plcTag.children?.find((a) => a.name == `${ix}`)?.tag 

        //         if(t){
        //             t.value = idx_value;
        //             await this.writeTag(t);
        //         }

        //     }))
        // } else {
        //     if (typeof(value) == 'object') {
        //         //Write all keys of object as subkeys to tag
        //         await Promise.all(Object.keys(value).map(async (valueKey) => {
        //             let tag = plcTag.children?.find((a) => a.name == valueKey)?.tag
        //             if(!tag) return;
        //             tag.value = value[valueKey]
                    
        //             await this.writeTag(tag)
        //         }))
              

        //     } else if (plcTag.tag) {
        //         //Root tag exists just write to it
        //         plcTag.tag.value = value;
                
        //         await this.writeTag(plcTag.tag);


        //     }else{
        //         //Children tags might exist, check length of tag path
        //         let parts = tag.split('.');
        //         if(parts.length > 1){
        //             let t = plcTag.children?.find((a) => a.name == parts[1])?.tag;
        //             if(t){
        //                 t.value = value;
        //                 await this.writeTag(t);
        //             }
        //         }
        //     }
        // }

        // plcTag.tag.value = value;
        plcTag.write(value);

        console.log("Writing tag", tag, value);
        // await this.controller.PLC?.writeTag(plcTag)
    }


    /*
        Returns tag if already in system

        Creates tag and all subtags as keyed items on this.tags otherwise

        this.tags = {
            TAG1.SUBKEY
        }

        !Not
        this.tags = {
            TAG1: {
                SUBKEY: value
            }
        }

        addTag(AV101.Open) -> AV101.Open | (changed: (Open))
        addTag(AV101) -> Open, Closed, Extend, Retract | (changed: {Open, Closed, Extend})
    */
    private async addTag(tagPath: string, tagType?: string){ 

        if(this.tags[tagPath]){
            return this.tags[tagPath]
        }

        let createdTags : any[] = [];

        let tagList = this.controller.PLC?.tagList.reduce((prev, curr) => {
            return {
                ...prev,
                [curr.name]: curr.type
            }
        }, {} as any)
   
        let tagObject : {typeName: string, arrayDims: number, structureObj?: { [key: string]: {typeName: string, arrayDims?: number} } } = tagPath.split('.').reduce((orig, index) => (orig.structureObj || orig)[index], tagList);

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
        Construct tag from ENIP

        - TAG : BOOL | STRING | DINT[]
        - TAG : TYPE
        - TYPE: {key: BOOL, type: STRING, sub: TYPE, subArr: DINT[]}

        Unless scalar pass to addTag again to find next values

        tagName: {string} - path to tag dot sperated
    */  
    // private async addTag(tagName: string, program?: string, type?: TagType ) : Promise<ENIPTag> {
    //     console.log(tagName)

    //     const emitter = new EventEmitter()

    //     //Check for tag in internal store before recreating
    //     // let existingTag = this.commandTags.find((a) => a.name == tagName?.split('.')?.[0])
    //     // if(existingTag){
    //     //     return existingTag
    //     // }


    //     //Get tag from PLC
    //     let {arrayDims, typeName, structureObj} = this.controller.PLC?.tagList?.find((a) => a.name == tagName)?.type || type as any || {arrayDims: 0, structureObj: undefined};

    //     // if (!tag) throw new Error("Couldn't add tag" + tagName)


    //     //Get correct tag type from PLC
    //     const isArray = arrayDims > 0 && typeName !== "BIT_STRING";
    //     let arraySize = 0; //await this.controller.PLC?.getTagArraySize(tagName)
    //             // let arraySize = 0;

    //     let rootTag: Tag | null = null;

    //     let childTags : ENIPTag[] = [];

    //     if (structureObj) {
    //         console.log("Add", tagName, "OBJ", structureObj)
    //         //Tag is likely a struct
    //         childTags = await this.addTagObject(tagName, structureObj)

    //         // childTags = [];

    //         // Object.keys(tagKeys).forEach((key) => {

    //         //     let type: CIP.DataTypes.Types = CIP.DataTypes.Types[(((tagKeys || {}) as any)[key] || 'DINT') as keyof typeof CIP.DataTypes.Types];

    //         //     childTags.push({ name: key, tag: this.controller.addTag(`${tag?.name}.${key}`, tag?.program, type) }) //, null, false, type, 10) })
    //         // })
    //     } else {
    //         //Tag is either a scalar or array
    //         rootTag = this.controller.addTag(tagName, program)

    //         if (isArray) {
    //             console.log("Add", tagName, "ARR")

    //             //Tag is an array

    //             childTags = await this.addTagArray(tagName, program || program)

    //             childTags.map((childTag) => {
    //                 childTag.onChanged?.(() => {
    //                     emitter.emit('Data', childTags.map((x) => x.tag?.value))
    //                 })
    //             })
    //             // arraySize = await this.controller.PLC?.getTagArraySize(rootTag)

    //             // childTags = [];

    //             // for (var idx = 0; idx < arraySize; idx++) {
    //             //     childTags.push({ name: `${idx}`, type: rootTag?.type, tag: this.controller.addTag(`${tag.name}[${idx}]`, tag.program, Types[rootTag?.type as any] as any ) })
    //             // }

    //             rootTag = null;

    //         }

    //         if(rootTag){
    //             rootTag.on('Initialized', (d) => {
    //                 emitter.emit('Data', d.value);
    //             })

    //             rootTag.on('Changed', (d) => {
    //                 emitter.emit('Data', d.value);
    //             })
    //         }

    //     }

    //     let newTag = {
    //         name: tagName,
    //         isArray,
    //         tag: rootTag,
    //         children: childTags.length > 0 ? childTags : undefined,
    //         onChanged: (fn: any) => {
    //             emitter.on('Data', (value) => fn(value));
    //         },
    //         getter: () => {
    //             if(childTags.length > 0){
    //                 return isArray ? childTags.sort((a,b) => a.name.localeCompare(b.name)).map((x) => x.tag?.value) : childTags.reduce((prev, curr) => ({...prev, [curr.name]: curr.tag?.value}), {})
    //             }
    //             return rootTag?.value
    //         }
    //     };

    //     this.commandTags.push(newTag)

    //     return newTag
    //     // this.tags.push({ key: tag.name, isArray, tag: rootTag, children: childTags.length > 0 ? childTags : undefined })

    //     //Add tag to PLC

    // }

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