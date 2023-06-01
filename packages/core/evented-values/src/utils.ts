import { isEqual } from "lodash";

export const diffKeys = (old_state: any, new_state: any) : {key: string, value: any}[] => {
    let changed_keys : {key: string, value: any}[] = [];

    Object.keys(new_state).forEach((valueKey) => {

        if(new_state[valueKey] != undefined && new_state[valueKey] != null){

            if (typeof (new_state[valueKey]) === "object" && !Array.isArray(new_state[valueKey])) {

                Object.keys(new_state[valueKey]).map((subValueKey) => {
                    if(new_state[valueKey]?.[subValueKey] != undefined && new_state[valueKey]?.[subValueKey] != null){
                        if ((old_state[valueKey]?.[subValueKey] == null || old_state[valueKey]?.[subValueKey] == undefined) || !isEqual(old_state[valueKey]?.[subValueKey], new_state[valueKey]?.[subValueKey])) {
                            //TODO, go deeper
                            changed_keys.push({ key: valueKey, value: {[subValueKey]: new_state[valueKey]?.[subValueKey]} })
                        }
                    }
                })


            } else {
                if ((old_state[valueKey] == null || old_state[valueKey] == undefined) || !isEqual(old_state[valueKey], new_state[valueKey])) {
                    //TODO, go deeper
                    changed_keys.push({ key: valueKey, value: new_state[valueKey] })
                }
            }
            
        }

    })
    return changed_keys;
}