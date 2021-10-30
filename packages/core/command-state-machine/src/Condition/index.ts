import { TransitionCondition } from "../types/TransitionCondition";

export class Condition {
    private condition: TransitionCondition;

    constructor(condition: TransitionCondition){
        this.condition = condition
    }

    get input_id(){
        return this.condition.input
    }

    get input_key(){
        return this.condition.inputKey
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
            }
            // console.log(input)
        }catch(e){

        }

        try{
            let val = parseFloat(value)
            if(!isNaN(val)){
                value = val;
            }
            // console.log(value)
        }catch(e){

        }

        // console.log("Checked", this.condition.comparator, input, value)

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