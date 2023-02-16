import { DataTypes, toJSType } from './types';

export type TypeArg = TypeDeclaration | DataTypes | DataTypes[] | TypeDeclaration[];
export type TypeDeclaration = {[key: string]: TypeArg}

export const formatInterface = (interfaceName: string, typeDeclaration: TypeDeclaration) => {

    const keyedTypes = Object.keys(typeDeclaration).map((key) => getKeyedValue(key, typeDeclaration[key])).join('\n')

    return `interface ${interfaceName} {
        ${keyedTypes}
}`
}

export const isTypeDeclaration = (typeDeclaration: any) : typeDeclaration is TypeDeclaration => {
    return (typeDeclaration as TypeDeclaration) !== undefined
}

export const getKeyedValue = (key: string, type: TypeArg) : string => {

    const value = getValue(type);

    return `${key}: ${value};`;
}

export const getValue = (type: TypeArg) : string => {
    console.log("Get value", type);
    
    if(type && typeof(type) === 'object' && !Array.isArray(type)){
        return `{ ${Object.keys(type).map((key) => getKeyedValue(key, type[key])).join('\n')} }`;
    }else if(type && Array.isArray(type)){
        return `${getValue(type[0])}[]`
    }else{
        // console.log("toJS", toJSType(DataTypes[DataTypes[type as any] as any] as any))
        return toJSType(type)
    }
}