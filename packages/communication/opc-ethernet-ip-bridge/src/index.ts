const { Controller } = require('st-ethernet-ip');
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


    PLC.connect(host, slot || 0).then(async () => {

        PLC.scan_rate = 500;
        PLC.scan();

        const tagList : PLCTag[] = PLC.tagList;

        const { properties } = PLC;

        console.log(`Connected to ${properties.name} @ ${host}:${slot || 0}`);

        console.log(`Found ${tagList.length} tags`);

        tagList.forEach((tag) => {

            tag.on('Changed', (newTag, oldValue) => {
                valueStore[tag.name] = newTag.value;
            })

            const getter = () => {
                return valueStore[tag.name];
            }

            switch(tag.type.typeName){
                case 'STRING':
                    server.addVariable(tag.name, 'String', getter, () => {

                    })
                    break;
                case 'DINT':
                    server.addVariable(tag.name, 'Number', getter, () => {

                    });
                    break;
                case 'BOOL':
                    server.addVariable(tag.name, 'Boolean', getter, () => {

                    });
                    break;
            }
            // server.addVariable(tag.name, )
        })

        server.start();

        console.log("OPCUA Server started");
    })
}