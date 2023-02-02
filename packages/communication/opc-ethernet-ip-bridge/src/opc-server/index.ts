import OPCServer from '@hive-command/opcua-server'
import { browseAll, UAObject } from 'node-opcua';

export enum TAG_TYPE {
    BIT_STRING = 'BIT_STRING',
    STRING = 'STRING',
    BOOL = 'BOOL',
    DINT = 'DINT',
    INT = 'INT',
    REAL = 'REAL'
}

export enum OPC_TYPE {
    Boolean = 'Boolean',
    String = 'String',
    Number = 'Number',
    Structure = 'Structure'
}

function assertUnreachable (x: never): never;

function assertUnreachable (x: TAG_TYPE){
    throw new Error("Should not be able to reach here: " + x);
}

export const getOPCType = (type: TAG_TYPE) => {
    switch(type){

        case TAG_TYPE.BOOL:
            return 'Boolean';
        case TAG_TYPE.INT:
        case TAG_TYPE.DINT:
        case TAG_TYPE.REAL:
            return "Number"
        case TAG_TYPE.STRING:
            return "String";
        case TAG_TYPE.BIT_STRING:
            return '[Boolean]'
        default:
            return assertUnreachable(type);
    }
    
}

export const addTag = async (
    server: OPCServer, 
    tagname: string, 
    type: TAG_TYPE, 
    getter: (() => any | undefined),
    setter: (value: any, key?: string) => void,
    structure?: {[key: string]: TAG_TYPE}, parent?: UAObject
) => {

    let dataType : OPC_TYPE = OPC_TYPE.String;

    console.log(`Add tag ${tagname}:${type} struct:${structure && type !== 'STRING'}`);

    if(structure){
        console.log(`Tag structure`, JSON.stringify(structure, null, 2));
    }

    if(structure && type !== TAG_TYPE.STRING){
        dataType = OPC_TYPE.Structure;

        const rootObject = await server.addObject(tagname, parent)

        await Promise.all(Object.keys(structure || {}).map(async (key) => {

            let defaultValue: any;

            if(structure?.[key]){
                switch(getOPCType(structure?.[key] as TAG_TYPE)){
                    case '[Boolean]':
                        defaultValue = [];
                        break;
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

                await addTag(server, key, structure?.[key], () => {
                    return getter()?.[key] || defaultValue
                }, (value) => setter(value, key), undefined, rootObject);
            }

            // await server.addVariable(key, getOPCType(structure?.[key] || ''), )
        }));

    }else{
        switch(type){
           
            case TAG_TYPE.BIT_STRING:
            case TAG_TYPE.BOOL:
                dataType = OPC_TYPE.Boolean;
                break;
            case TAG_TYPE.INT:
            case TAG_TYPE.DINT:
            case TAG_TYPE.REAL:
                dataType = OPC_TYPE.Number;
                break;
            case TAG_TYPE.STRING:
                dataType = OPC_TYPE.String;
                break;
            default: 
                return assertUnreachable(type)
        }
    }

    let defaultValue: any;

    switch(dataType){
        case OPC_TYPE.Boolean:
            defaultValue = false;
            break;
        case OPC_TYPE.Number:
            defaultValue = 0;
            break;
        case OPC_TYPE.String:
            defaultValue = '';
            break;
        case OPC_TYPE.Structure:
            break;
        default:
            return assertUnreachable(dataType)
    }

    const _getter = () => {
        return getter() || defaultValue
    }
    // const setter = () => {

    // }

    if(dataType != OPC_TYPE.Structure){
        await server.addVariable(tagname, dataType, _getter, setter, parent)
    }
}