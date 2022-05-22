import log from "loglevel";
import { CommandProcessEdge, EdgeCondition } from "@hive-command/data-types";

export class Condition {
    private condition: EdgeCondition;

    private getVariable?: (key: string) => any;

    constructor(condition: EdgeCondition, getVariable?: (key: string) => any){
        this.condition = condition
    }

    get input_id(){
        return this.condition.inputDevice
    }

    get input_key(){
        return this.condition.inputDeviceKey
    }

    get value_id(){
        console.log("Value ID", this.condition)
        if(this.condition.assertion.setpoint){
            //TODO map setpoints to variables
            return this.condition.assertion?.setpoint.value
        }else if(this.condition.assertion.variable){
            return this.getVariable?.(this.condition.assertion.variable.name)
        }else if(this.condition.assertion.value){
            return this.condition.assertion.value;
        }
    }

    check(input: any, value: any = this.value_id){
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

        console.log(this.condition)
        console.log("Checked", this.condition.comparator, "input", input, "value", value)
        
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