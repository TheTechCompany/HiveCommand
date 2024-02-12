export const formatSnapshot = (tags: any[], types: any[], values: any) => {
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

        let hasFields = (type?.fields || []).length > 0;

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
        }else if(hasFields){

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