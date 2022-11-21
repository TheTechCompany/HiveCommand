const { Controller } = require('st-ethernet-ip');

import OPCUAServer from '@hive-command/opcua-server'

export interface PLCTag {
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

    PLC.connect(host, slot || 0).then(async () => {

        const tagList : PLCTag[] = PLC.tagList;

        const { properties } = PLC;

        console.log(`Connected to ${properties.name} @ ${host}:${slot || 0}`);

        console.log(`Found ${tagList.length} tags`);

        tagList.forEach((tag) => {

            switch(tag.type.typeName){
                case 'STRING':
                    server.addVariable(tag.name, 'String', () => {}, () => {})
                    break;
                case 'DINT':
                    server.addVariable(tag.name, 'Number', () => {}, () => {});
                    break;
                case 'BOOL':
                    server.addVariable(tag.name, 'Boolean', () => {}, () => {});
                    break;
            }
            // server.addVariable(tag.name, )
        })

        server.start();

    })
}