export * from './enip-plc';
export * from './opc';

export enum DataTypes {
    Boolean = 'boolean',
    String = 'string',
    Number = 'number',
    Date = 'Date'
    // Structure = 'Structure'
}

// export const 

export const lookupType = (type: keyof typeof DataTypes) => {
    return DataTypes[type]
}