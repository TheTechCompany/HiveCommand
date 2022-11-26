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

        PLC.scan_rate = 500;
        PLC.scan();

        const tagList = PLC.tagList;

        const { properties } = PLC;

        console.log(`Connected to ${properties.name} @ ${host}:${slot || 0}`);

        console.log(`Found ${tagList?.length} tags`);

        console.log(JSON.stringify({tagList}));

        // plc.newTag()

        tagList?.map(async (tag) => {
            plc.subscribe(tag);

            await plc.readTag(tag)
        });

        // PLC.forEach()

        await Promise.all((tagList || []).map(async (tag) => {

            tag.on('Changed', (newTag, oldValue) => {
                valueStore[tag.name] = newTag.value;
            });
            // tag.
            // tag.on('Changed', (newTag, oldValue) => {
            //     valueStore[tag.name] = newTag.value;
            // })

            const getter = () => {
                let value = valueStore[tag.name];

                switch(tag.typeName){
                    case 'STRING':
                        return 'Test';
                    case 'DINT':
                        return 0;
                    case 'BOOL':
                        return false;
                }
                return valueStore[tag.name];
            }

            switch(tag.typeName){
                case 'STRING':
                    await server.addVariable(tag.name, 'String', getter, (value) => {
                        // return "Test"
                        console.log({value})
                    })
                    break;
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