import { EdgeCondition } from "@hive-command/data-types";

export class Condition {
    private condition: EdgeCondition;

    constructor(condition: EdgeCondition){
        this.condition = condition
    }

    get input_id(){
        return this.condition.inputDevice?.id
    }

    get input_key(){
        return this.condition.inputDeviceKey?.key
    }

    get value_id(){
        return this.condition.value
    }

    check(input: any, value: any){
        //console.log(input, value)
        try{
            let val = parseFloat(input)
            if(!isNaN(val)){
                input = val;
            }else{
                input = `${input}`
            }
            // console.log(input)
        }catch(e){
            input = `${input}`
        }

        try{
            let val = parseFloat(value)
            if(!isNaN(val)){
                value = val;
            }else{
                value = `${value}`
            }
            // console.log(value)
        }catch(e){
            value = `${value}`
        }

        // console.log("Checked", this.condition.comparator, "input", input, "value", value)
        
        // console.log("Type", typeof(input), typeof(value))
        switch(this.condition.comparator){
            case '>':
                return input > value;
            case '>=':
                return input >= value;
            case '<':
                return input < value
            case '<=':
                return input <= value;
            case '==':
                return input == value;
            case '!=':
                return input != value;
            default:
                break;
        }        
    }
}