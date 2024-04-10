import { HMITag, HMIType } from '@hive-command/interface-types'
import { merge } from 'lodash';

export const formatTagType = (type: {scalar: string | null, type: {name: string} | null}) => {
    if (type.type?.name) {
        // let res = await prisma.programType.findFirst({ where: { id: root.type.typeId, programId: root.programId } });
        return type.type?.name
    } else if (type?.scalar) {
        return type?.scalar
    }
}

export const structureSnapshot = (valueStore: any) => {
    return Object.keys(valueStore).map((valueKey) => {
        if (valueKey.indexOf('.') > -1) {
            return valueKey.split('.').reverse().reduce((prev, curr) => ({ [curr]: prev }), valueStore[valueKey])
        } else {
            return { [valueKey]: valueStore[valueKey] }
        }
    }).reduce((prev, curr) => merge(prev, curr), {})
}

export const invertSnapshot = (snapshot: any, tags: HMITag[]) => {

    const typedSnapshot = tags?.reduce((prev, tag) => {

        let typeName = tag.type //types?.find((a) => a.id == tag.type?.typeId)?.name;
        if(!typeName) return prev;

        return {
            ...prev,
            [typeName]: {
                ...(prev[typeName] || {}), 
                [tag.name]: snapshot[tag.name]
            }
        }
    }, {} as any)

    return typedSnapshot;
}

export const formatSnapshot = (tags: HMITag[], types: HMIType[], values: {
    deviceId:string,
	placeholder:string,
	key?: string,
	value: any
}[]) => {
    let valueObj = values.reduce((prev: any, curr: any) => {

        let key = curr.key;

        let update = {};

        if (key) {
            update = {
                ...prev[curr.placeholder],
                [key]: curr.value
            }
        } else {
            update = curr.value;
        }

        return {
            ...prev,
            [curr.placeholder]: update
        }
    }, {});

    return tags?.map((tag) => {

        let type = types?.find((a) => a.name === tag.type) || tag.type;

        let hasFields = (typeof type != 'string' && type?.fields || []).length > 0;

        let value = valueObj[tag.name];

        if (
            type &&
            typeof (type) === "string" &&
            type.indexOf('[]') > -1
        ){ 
            if( typeof (value) === "object" &&
                !Array.isArray(value) &&
                Object.keys(value).map((x: any) => x % 1 == 0).indexOf(false) < 0
            ) {
                value = Object.keys(value).map((x) => value[x]);
            }else if(typeof(value) === 'string'){
                value = value.split(',')
            }
        }else if(typeof type != 'string' && hasFields){

            type?.fields?.forEach((field: any) => {

                if (
                    field.type &&
                    value &&
                    value[field.name] && 
                    typeof (field.type) === "string" &&
                    field.type.indexOf('[]') > -1
                ){ 
                    if( typeof (value[field.name]) === "object" &&
                        !Array.isArray(value[field.name]) &&
                        Object.keys(value[field.name]).map((x: any) => x % 1 == 0).indexOf(false) < 0
                    ) {
                        value[field.name] = Object.keys(value[field.name]).map((x) => value[field.name][x]);
                    }else if(typeof(value[field.name]) === 'string'){
                        value[field.name] = value[field.name].split(',')
                    }
                }

            })

        }

        return {
            key: `${tag.name}`,
            value: value
        }

    }).reduce((prev, curr) => ({
        ...prev,
        [curr.key]: curr.value
    }), {})
}