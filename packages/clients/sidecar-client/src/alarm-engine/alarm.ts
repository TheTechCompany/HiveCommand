export interface AlarmCondition {
    type: "Tag" | "Type";
    active: string; //Tag|Type active component
    field: string; //Field of Tag|Type
    comparator: string;
    value: any;
}

export class Alarm {

    conditions : AlarmCondition[] = [];

    code : string;

    constructor(conditions: AlarmCondition[], code: string){
        this.code = code;
        this.conditions = conditions;
    }

    check(state: any, stateStructure: {[key: string]: string}){

        // let type_checks = 

        let passes = this.conditions.map((condition) => {
            
            let stateValue;
            if(condition.type == 'Type'){
                let keys = Object.keys(stateStructure)
                let tags = Object.values(stateStructure).map( (x, ix) => ({key: keys[ix], value: x}) ).filter((a) => a.value == condition.active).map((x) => x.key);

                stateValue = tags.map((tag) => condition.field ? state[tag][condition.field] : state[tag])

                return stateValue.map((x) => x == condition.value)

            }else if(condition.type == 'Tag'){

                stateValue = condition.field ? state[condition.active][condition.field] : state[condition.active]

                return stateValue == condition.value
                
            }
            
            // let value = state[this.conditions[i].
        })
    }


}