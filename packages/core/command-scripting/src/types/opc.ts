import { DataTypes } from ".";

export enum OPC_TYPE {
    Boolean,
    String,
    Number
    // Structure = 'Structure'
}

export const fromOPCType = (type: string) => {
    switch(type){
        case 'NodeId':
        case 'LocalizedText':
        case 'QualifiedName':
        case 'String':
            return DataTypes.String;
        case 'Boolean':
        case 'BooleanT':
            return DataTypes.Boolean;
        case 'Byte':
        case 'Float':
        case 'Double':
        case 'UInt16':
        case 'UInt32':
        case 'UInt64':
        case 'UIntegerT':
        case "IntegerT":
            return DataTypes.Number;
        case 'DateTime':
            return DataTypes.Date
        default:
            throw new Error(`${type} not found in fromOPC`)
            // return type || 'string';
    }
}