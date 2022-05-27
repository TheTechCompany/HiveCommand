import log from "loglevel";
import { CommandProcessEdge, ConditionValueBank, EdgeCondition } from "@hive-command/data-types";


export class Condition {
    private condition: EdgeCondition;

    private valueBank?: ConditionValueBank;

    constructor(condition: EdgeCondition, valueBank?: ConditionValueBank){
        this.condition = condition

        this.valueBank = valueBank;
    }

    get input_id(){
        return this.condition.inputDevice
    }

    get input_key(){
        return this.condition.inputDeviceKey
    }

    get value_id(){
        if(this.condition.assertion.setpoint){
            if(!this.valueBank?.getSetpoint) throw new Error("No setpoint getter specified in Condition setup");
            const value = this.valueBank.getSetpoint(this.condition.assertion?.setpoint.id)
            return value;
        }else if(this.condition.assertion.variable){
            if(!this.valueBank?.getVariable) throw new Error("No variable getter specified in Condition setup");
            return this.valueBank?.getVariable?.(this.condition.assertion.variable.name)
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

        console.log({input, value, cmp: this.condition.comparator})
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