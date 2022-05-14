import log from "loglevel";
import { EdgeCondition } from "@hive-command/data-types";

export class Condition {
    private condition: EdgeCondition;

    private getVariable?: (key: string) => any;

    constructor(condition: EdgeCondition, getVariable?: (key: string) => any){
        this.condition = condition
    }

    get input_id(){
        return this.condition.inputDevice.id
    }

    get input_key(){
        return this.condition.inputDeviceKey.key
    }

    get value_id(){
        if(this.condition.assertion.setpoint){
            //TODO map setpoints to variables
            return this.condition.assertion?.setpoint.value
        }else if(this.condition.assertion.variable){
            return this.getVariable?.(this.condition.assertion.variable.key)
            return this.condition.assertion.variable
        }else if(this.condition.assertion.value){
            return this.condition.assertion.value;
        }
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