import { Controller } from '@hive-command/ethernet-ip';

import EventEmitter from 'events'

import OPCUAServer from '@hive-command/opcua-server'

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

export const EthernetIPBridge = (host: string, slot?: number) => {

    const server = new OPCUAServer({
        productName: 'Ethernet IP - OPCUA Bridge'
    });

    const PLC = new Controller();

    let valueStore : any = {};


    PLC.connect(host, slot || 0).then(async (plc) => {

        await server.start();

        // PLC.scan_rate = 500;
        // PLC.scan();

        const tagList = PLC.tagList;

        const { properties } = PLC;

        console.log(`Connected to ${properties.name} @ ${host}:${slot || 0}`);

        console.log(`Found ${tagList?.length} tags`);

        console.log(JSON.stringify({tagList}));

        // plc.newTag()

        // tagList?.map(async (tag) => {
        //     plc.subscribe(tag);

        //     await plc.readTag(tag)
        // });

        // PLC.forEach()

        await Promise.all((tagList || []).filter((a) => a.name.indexOf('__') !== 0).map(async (tag) => {

            const realTag = plc.newTag(tag.name);

            // realTag.subs
            // await plc.readTag(realTag)

            // valueStore[tag.name] = realTag.value;

            // realTag.on('Changed', (newTag, oldValue) => {
            //     valueStore[tag.name] = newTag.value;
            // });


            // tag.
            // tag.on('Changed', (newTag, oldValue) => {
            //     valueStore[tag.name] = newTag.value;
            // })

            if(tag.type.typeName !== 'STRING' && tag.type.typeName !== 'DINT' && tag.type.typeName !== 'BOOL'){
                console.log("Can't find " + tag.name + " " + tag.type.typeName)
            }

            const getter = () => {
                let value = valueStore[tag.name];

                console.log({value});

                if(tag.type.typeName !== 'STRING' && tag.type.typeName !== 'DINT' && tag.type.typeName !== 'BOOL'){
                    console.log("Can't find way to get value for " + tag.name + " " + tag.type.typeName)
                }else{
                    plc.readTag(realTag).then(() => {
                        valueStore[tag.name] = realTag.value;
                    })
                }

                if(!value){
                    switch(tag.type.typeName){
                        case 'STRING':
                            return 'Test';
                        case 'REAL':
                        case 'DINT':
                            return 0;
                        case 'BOOL':
                            return false;
                    }
                }else{
                    return value;
                }
            }

            switch(tag.type.typeName){
                case 'STRING':
                    await server.addVariable(tag.name, 'String', getter, (value) => {
                        // return "Test"
                        console.log({value})
                    })
                    break;
                case 'REAL':
                case 'DINT':
                    await server.addVariable(tag.name, 'Number', getter, (value) => {
                        // return 0;
                        console.log({value})
                    });
                    break;
                case 'BOOL':
                    await server.addVariable(tag.name, 'Boolean', getter, (value) => {
                        // return false;
                        console.log({value})
                    });
                    break;
            }
            // server.addVariable(tag.name, )
        }))


        console.log("OPCUA Server started");
    })
}