import { DataTypes } from './types';

export * from './generators'
export * from './types'


export const parseValue = (type: string, value: any ) => {

    let isArray = type.indexOf('[]') > -1;

    if (isArray && !Array.isArray(value)) value = []
    if (isArray) type = type?.replace('[]', '') as any

    // switch(type){
    //     case DataTypes.Boolean:
    //         if(!value || value == false || value == 'false' || value == 0 || value == '0'){
    //             return false;
    //         }else if(value == true || value == 'true' || value == 1 || value == '1'){
    //             return true;
    //         }
    //         return false;
    //     case DataTypes.Number:
    //         return parseInt(value || 0);
    //     default:
    //         console.log("PARSE VALUE WITH TYPE", type)
    //         return value;
    // }

    switch (type) {
        case DataTypes.Boolean:
            return isArray ? value.map((value: any) => (value == true || value == "true" || value == 1 || value == "1")) : (value == true || value == "true" || value == 1 || value == "1");
        case DataTypes.Number:

            return isArray ? value.map((value: any) => {
                let val = parseFloat(value || 0);
                if (Number.isNaN(val)) {
                    val = 0;
                }
                return val % 1 != 0 ? val.toFixed(2) : val;
            }) : (() => {
                let val = parseFloat(value || 0);

                if (Number.isNaN(val)) {
                    val = 0;
                }
                return val % 1 != 0 ? val.toFixed(2) : val;
            })()
        default:
            console.log({ type })
            break;
    }
}