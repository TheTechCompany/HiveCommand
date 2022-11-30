import OPCServer from '@hive-command/opcua-server'
import { UAObject } from 'node-opcua';

export type TAG_TYPE = 'DINT' | 'INT' | 'REAL';

export const getOPCType = (type: string) => {
    switch(type){
        case 'BOOL':
            return 'Boolean';
        case 'INT':
        case 'DINT':
        case 'REAL':
            return "Number"
        default:
        case 'STRING':
            return "String";
    }
}

export const addTag = async (server: OPCServer, tagname: string, type: string, structure?: {[key: string]: string}, parent?: UAObject) => {

    let dataType : 'Boolean'  | 'Structure' | 'String' | 'Number' = 'String';

    switch(structure ? 'STRUCT' : type){
        case 'STRUCT':
            dataType = 'Structure';

            const rootObject = await server.addObject(tagname, parent)

            await Promise.all(Object.keys(structure || {}).map(async (key) => {

                await addTag(server, key, structure?.[key] || '', undefined, rootObject);

                // await server.addVariable(key, getOPCType(structure?.[key] || ''), )
            }));

            break;
        case 'BOOL':
            dataType = 'Boolean'
            break;
        case 'INT':
        case 'DINT':
        case 'REAL':
            dataType = "Number"
            break;
    }

    const getter = () => {
        switch(dataType){
            case 'Boolean':
                return false;
            case 'Number':
                return 0;
            case 'String':
                return "Test"
        }    
    }

    const setter = () => {

    }

    if(dataType != 'Structure'){
        await server.addVariable(tagname, dataType, getter, setter, parent)
    }
}