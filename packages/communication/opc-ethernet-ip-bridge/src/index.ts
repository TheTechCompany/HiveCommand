import { Controller, Tag, TagList } from '@hive-command/ethernet-ip';

import EventEmitter from 'events'

import OPCUAServer from '@hive-command/opcua-server'
import { addTag } from './opc-server';


export interface PLCTag extends EventEmitter {
    id: number,
    name: string,
    type: {
        code: number,
        sintPos: number | null,
        typeName: 'DINT' | 'BOOL' | 'TIMER' | 'REAL' | 'STRING',
        structure: boolean,
        arrayDims: number,
        reserved: boolean
    }
}

const READ_BUFFER_TIME = 200;

export const EthernetIPBridge = (host: string, slot?: number) => {

    const server = new OPCUAServer({
        productName: 'Ethernet IP - OPCUA Bridge'
    });

    const PLC = new Controller();

    let valueStore : any = {};

    const tagList = new TagList()

    PLC.connect(host, slot || 0).then(async (plc) => {

        await server.start();

        PLC.scan_rate = 500;
        // PLC.scan();

        const { properties } = PLC;

        console.log(`Connected to ${properties.name} @ ${host}:${slot || 0}`);

        console.log(`Found ${PLC.tagList?.length} tags`);
      
        // await PLC.getControllerTagList(tagList);

        let tags : {tag: Tag, type: any, name: string}[] = [];

        PLC.tagList?.forEach((tag) => {
            addTag(server, tag.name, tag.type.typeName || '', tag.type.structureObj);

            // tags.push({tag: PLC.newTag(tag.name), type: tag.type, name: tag.name})
        })

        // for(const tag of tags){

        //     await PLC.readTag(tag.tag);

        //     // PLC.subscribe(tag.tag)

        //     valueStore[tag.name] = tag.tag.value

        //     tag.tag.on('Changed', (newTag) => {
        //         valueStore[tag.name] = newTag.value;
        //     })
            
        //     console.log("READ TAG", tag.name)

        //     await new Promise((resolve) => setTimeout(() => resolve(true), READ_BUFFER_TIME))
        // }

        // Object.keys(valueStore).map((key) => {
        //     let tag = tags.find((a) => a.name == key);
        //     let value = valueStore[key];

        //     if(tag?.type.structure){
        //         console.log("Struct type", tag.type)
        //         console.log("Struct value", value)
        //     }else{
        //         console.log({tag, value});
        //     }
        // })

        // console.log({valueStore})

        // await Promise.all((tagList || []).filter((a) => a.name.indexOf('__') !== 0).map(async (tag) => {

        //     const realTag = plc.newTag(tag.name);

        //     plc.subscribe(realTag)
  
        //     realTag.on('Changed', (newTag, oldValue) => {
        //         valueStore[tag.name] = newTag.value;
        //     });

        //     if(tag.type.typeName !== 'STRING' && tag.type.typeName !== 'DINT' && tag.type.typeName !== 'BOOL' && tag.type.typeName !== 'REAL'){
        //         console.log("Can't find " + tag.name + " " + tag.type.typeName)
        //     }

        //     const getter = () => {
        //         let value = valueStore[tag.name];

        //         console.log({value});

        //         // if(tag.type.typeName !== 'STRING' && tag.type.typeName !== 'DINT' && tag.type.typeName !== 'BOOL' && tag.type.typeName !== 'REAL'){
        //         //     console.log("Can't find way to get value for " + tag.name + " " + tag.type.typeName)
        //         // }else{
        //         //     // plc.readTag(realTag).then(() => {
        //         //     //     valueStore[tag.name] = realTag.value;
        //         //     // })
        //         // }

        //         if(!value){
        //             switch(tag.type.typeName){
        //                 case 'STRING':
        //                     return 'Test';
        //                 case 'REAL':
        //                 case 'DINT':
        //                     return 0;
        //                 case 'BOOL':
        //                     return false;
        //             }
        //         }else{
        //             return value;
        //         }
        //     }

        //     switch(tag.type.typeName){
        //         case 'STRING':
        //             await server.addVariable(tag.name, 'String', getter, (value) => {
        //                 // return "Test"
        //                 console.log({value})
        //             })
        //             break;
        //         case 'REAL':
        //         case 'DINT':
        //             await server.addVariable(tag.name, 'Number', getter, (value) => {
        //                 // return 0;
        //                 console.log({value})
        //             });
        //             break;
        //         case 'BOOL':
        //             await server.addVariable(tag.name, 'Boolean', getter, (value) => {
        //                 // return false;
        //                 console.log({value})
        //             });
        //             break;
        //     }
        //     // server.addVariable(tag.name, )
        // }))

        // await PLC.scan();


        console.log("OPCUA Server started");
    })
}