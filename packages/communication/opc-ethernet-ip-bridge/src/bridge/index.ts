
import { CIP, ControllerManager, ManagedController, Tag } from '@hive-command/ethernet-ip';
import OPCUAServer from '@hive-command/opcua-server'
import { configureServer } from './configure-server';
import { EventEmitter } from 'events'
import { readFileSync } from 'fs';
import { addTag, TAG_TYPE } from '../opc-server';

export interface BridgeOptions {
    host: string,
    slot?: number,
    listenTags?: string,
    configure?: boolean
}

export interface PLCTag extends EventEmitter {
    id: number,
    name: string,
    type: {
        code: number,
        sintPos: number | null,
        typeName: 'BIT_STRING' | 'DINT' | 'BOOL' | 'TIMER' | 'REAL' | 'STRING',
        structure: boolean,
        arrayDims: number,
        reserved: boolean
    }
}

export interface ListenTag {
    name: string,
    children?: ListenTag[]
}

export interface ListenTemplate {
    name: string,
    children?: ListenTemplate[]
}

export const EthernetIPBridge = async (options: BridgeOptions) => {

    const { host, slot, listenTags, configure } = options;

    const server = new OPCUAServer({
        productName: 'Ethernet IP - OPCUA Bridge'
    });

    const manager = new ControllerManager();

    const controller : ManagedController = manager.addController(host, slot, 500, false)

    controller.on('Error', (e) => {
        console.log("Controller level error: ", e)
    })

    await server.start();

  
    let tags : ListenTag[] = [];
    let templates : ListenTemplate[] = [];

    if(listenTags){
        let tagBundle = JSON.parse(readFileSync(listenTags, 'utf-8')) || {};
        tags = tagBundle?.tags || [];
        templates = tagBundle?.templates || [];
    }


    await controller.connect();

    if(configure && controller.PLC){
        configureServer(controller.PLC, listenTags)
    }  
    
    const tagList = controller.PLC?.tagList?.filter((a) => a.name.indexOf('__') !== 0) || []

        // PLC.scan_rate = 500;
        // PLC.scan();

        // controller.PLC?.newTag(tag, null, true, )

        const { properties } = controller.PLC || {};

        console.log(`Connected to ${properties?.name} @ ${host}:${slot || 0}`);

        console.log(`Found ${tagList?.length} tags`);

    //Get Array sizing for tagList
    // await Promise.all(tagList.map(async (tag) => {
    //     if(tag.type.arrayDims > 0){
    //         const t = new Tag(tag.name)
    //         const arraySize = await controller.PLC?.getTagArraySize(t)
    //         return {
    //             ...tag,
    //             type: {
    //                 ...tag.type,
    //                 arraySize
    //             }
    //         }
    //     }
    //     return tag;
    // }))
    
        if(listenTags){
            //Tags have been specified in a tag json file

            for(var i = 0; i < templates.length; i++){
                let template = templates[i];

                let templateKeys = template.children?.map((x) => x.name);

                console.log(`Adding ${controller.PLC?.tagList?.filter((a) => a.type.typeName == template.name).length} tags for ${template.name}`)

                tags = tags.concat( (tagList || []).filter((a) => a.type.typeName == template.name).map((tag) => {
                    return {
                        ...tag,
                        children: template.children?.filter((a) => (templateKeys || []).indexOf(a.name) > -1)
                    }
                }) );


            }
            
            for(var i = 0; i < tags.length; i++){

                let tag = tags[i];

                let fromTagList = tagList?.find((a) => a.name == tag.name);
                let fromTagListChildren = (tag.children || []).length > 0 ? 
                    tag.children?.map((x) => ({
                        type: (fromTagList?.type.structureObj as any)?.[x.name] || "STRING", 
                        name: x.name 
                    })).reduce((prev, curr) => ({
                            ...prev,
                            [curr.name]: curr.type
                    }), {}) :
                    undefined;

                if(!fromTagList?.type.typeName) continue;
                const typeKey = fromTagList.type.typeName as keyof typeof TAG_TYPE;
    
                let isArray = fromTagList.type.arrayDims > 0 && fromTagList.type.typeName !== "BIT_STRING";
                let arraySize = 0;
                

                let rootTag : Tag | null = null;
                let childTags: {key: string, tag: Tag | null}[];

                if(fromTagListChildren){

                    //Create child tag list from children object

                    childTags = [];
                    
                    if(fromTagListChildren){
                        Object.keys(fromTagListChildren).forEach((key) => {
    
                            let type : CIP.DataTypes.Types = CIP.DataTypes.Types[(((fromTagListChildren || {}) as any)[key] || 'DINT') as keyof typeof CIP.DataTypes.Types];
    
                            console.log(`Adding child tag ${tag.name}.${key}`, key, tag.name, type);
    
                            childTags.push({ key: key, tag: controller.addTag(`${tag.name}.${key}`, null, type ) }) //, null, false, type, 10) })
                        })
                    }
                }else{
                    //Create read value from rootTag if array get more specific
                   rootTag = controller.addTag(tag.name)

                   if(isArray){
                    console.log("isArray")
                    arraySize = await controller.PLC?.getTagArraySize(rootTag)

                    childTags = [];
                    for(var idx = 0; idx < arraySize; idx++){
                        childTags.push({key: `${idx}`, tag: controller.addTag(`${tag.name}[${idx}]`) })
                    }

                    rootTag = null;
                   }
                }

                // try{
                //     if(!enipTag) continue;
                //     await controller.PLC?.readTag(enipTag);
                // }catch(e){
                //     console.error({msg: (e as any).message})
                // }

                
               
                // PLC.subscribe(enipTag);

                addTag(server, fromTagList?.name || '', TAG_TYPE[typeKey], (key) => {
                    // console.log("Reading ENIP value @ ", Date.now(), enipTag?.value);
                    if(key){
                        return childTags.find((a) => a.key === key)?.tag?.value
                    }else if(!key && childTags){
                        return childTags.sort((a: any, b: any) => a.key - b.key).map((x) => x.tag?.value)
                    }
                    return rootTag?.value
                }, (value, key) => {
                    if(Array.isArray(value)){
                        value.map((idx_value, ix) => {
                            // let type = fromTagList?.type. ? Types[fromTagList?.type.typeName] : undefined
                            let t = new Tag(`${tag.name}[${ix}]`, null, fromTagList?.type.code)
                            t.value = idx_value;
                            controller.PLC?.writeTag(t).catch((err) => console.error({err, type: fromTagList?.type.typeName, value, idx_value}))
                        })
                    }else{
                        if(key){
                            // if(!enipTag?.value) enipTag.value = {};
                            let tag = childTags.find((a) => a.key === key)?.tag
                            if(!tag) return;
                            tag.value = value;

                            controller.PLC?.writeTag(tag).catch((err) => console.error({err}));

                            // (enipTag.value as any)[key] = value;
                        }else if(rootTag){
                            rootTag.value = value;
        
                            controller.PLC?.writeTag(rootTag).catch((err) => console.error({err}));

                        }
                    }

                    console.log("Set it")
                }, fromTagListChildren, undefined, isArray)
                
                // await new Promise((resolve) => setTimeout(() => resolve(true), 200))
            }

        }else{
            //Tags have not been explicitly set, show all

            for(var i = 0; i < (tagList || []).length; i++){
                let tag = (tagList || [])[i];
                let enipTag = controller.addTag(tag.name);
               
                if(!tag.type.typeName) continue;
                const typeKey = tag.type.typeName as keyof typeof TAG_TYPE;

                // try{
                //     await PLC.readTag(enipTag);
                // }catch(e){
                //     console.error({msg: (e as any).message})
                // }

                let childTags : {key: string, tag: Tag | null }[] = [];
                
                if(tag.type.structureObj){
                    Object.keys(tag.type.structureObj).forEach((key) => {

                        console.log(`Adding child tag 2: ${tag.name}.${key}`, key, tag.name);

                        childTags.push({ key: key, tag: controller.addTag(`${tag.name}.${key}`) })
                    })
                }

                addTag(server, tag.name, TAG_TYPE[typeKey], () => {
                    return enipTag?.value
                }, (value, key) => {
                    if(enipTag && key){
                        // if(!enipTag?.value) enipTag.value = {};
                        // (enipTag.value as any)[key] = value.value;

                        let tag = childTags.find((a) => a.key === key)?.tag
                        if(!tag) return;
                        tag.value = value;

                        controller.PLC?.writeTag(tag).catch((err) => console.error({err}));

                    }else if(enipTag){
                        enipTag.value = value.value;

                        controller.PLC?.writeTag(enipTag).catch((err) => console.error({err}));

                    }

                    console.log("Set it")
                    
                }, tag.type.structureObj);

                // await new Promise((resolve) => setTimeout(() => resolve(true), 200))

                // tags.push({tag: PLC.newTag(tag.name), type: tag.type, name: tag.name})
            }
        }
       
        // PLC.scan_rate = 500;
        // await PLC.scan();



        console.log("OPCUA Server started");
}