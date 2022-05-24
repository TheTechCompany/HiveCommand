import { Condition } from "../condition";
import { CommandProcessEdge, ConditionValueBank, EdgeCondition } from "@hive-command/data-types";

export class Transition {
    
    private link: CommandProcessEdge;

    private valueBank?: ConditionValueBank;

    constructor(link: CommandProcessEdge, valueBank?: ConditionValueBank){
        this.link = link
        this.valueBank = valueBank;
    }

    get id(){
        return this.link.id;
    }

    get source(){
        return this.link.source
    }

    get target(){
        return this.link.target
    }

    get conditions() : Condition[]{
        return (this.link.options?.conditions || []).map((x: EdgeCondition) => new Condition(x, this.valueBank));
    }
}