export * from './enip-plc';
export * from './opc';

export enum DataTypes {
    Boolean = 'Boolean',
    String = 'String',
    Number = 'Number',
    Date = 'Date'
    // Structure = 'Structure'
}

function assertUnreachable (type: never) : never;
function assertUnreachable (type: DataTypes) {
    throw new Error(`Datatype: ${type} not found`)
}

export const toJSType = (type: DataTypes) => {

    console.log("toJS", type)

    switch(type){
        case DataTypes.Boolean:
            return 'boolean';
        case DataTypes.String:
            return 'string';
        case DataTypes.Date:
            return 'Date';
        case DataTypes.Number:
            return 'number';
        default:
            return assertUnreachable(type)
            // return 'string';
    }
}

// export const 

export const lookupType = (type: keyof typeof DataTypes) => {
    return DataTypes[type]
}