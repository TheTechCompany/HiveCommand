import OPCServer from '@hive-command/opcua-server'
import { browseAll, UAObject } from 'node-opcua';

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

export const addTag = async (
    server: OPCServer, 
    tagname: string, 
    type: string, 
    getter: (() => any | undefined),
    setter: (value: any, key?: string) => void,
    structure?: {[key: string]: string}, parent?: UAObject
) => {

    let dataType : 'Boolean'  | 'Structure' | 'String' | 'Number' = 'String';

    console.log(`Add tag ${tagname}:${type} struct:${structure && type !== 'STRING'}`);

    if(structure){
        console.log(`Tag structure`, JSON.stringify(structure, null, 2));
    }
    switch((structure && type !== 'STRING') ? 'STRUCT' : type){
        case 'STRUCT':
            dataType = 'Structure';

            const rootObject = await server.addObject(tagname, parent)

            await Promise.all(Object.keys(structure || {}).map(async (key) => {

                let defaultValue: any;

                if(structure?.[key]){
                    switch(getOPCType(structure?.[key])){
                        case 'Boolean':
                            defaultValue = false;
                            break;
                        case 'Number':
                            defaultValue = 0;
                            break;
                        case 'String':
                            defaultValue = '';
                            break;
                    }

                    await addTag(server, key, structure?.[key] || '', () => {
                        return getter()?.[key] || defaultValue
                    }, (value) => setter(value, key), undefined, rootObject);
                }

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
        default:
        case 'STRING':
            dataType = "String";
            break;
    }

    let defaultValue: any;

    switch(dataType){
        case 'Boolean':
            defaultValue = false;
            break;
        case 'Number':
            defaultValue = 0;
            break;
        case 'String':
            defaultValue = '';
            break;
    }

    const _getter = () => {
        return getter() || defaultValue
    }
    // const setter = () => {

    // }

    if(dataType != 'Structure'){
        await server.addVariable(tagname, dataType, _getter, setter, parent)
    }
}