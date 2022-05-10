import { Condition } from "../condition";
import { CommandProcessEdge,TransitionCondition } from "@hive-command/data-types";

export class Transition {
    private link: CommandProcessEdge;

    constructor(link: CommandProcessEdge){
        this.link = link
    }

    get source(){
        return this.link.source
    }

    get target(){
        return this.link.target
    }

    get conditions() : Condition[]{
        return (this.link.options?.conditions || []).map((x: TransitionCondition) => new Condition(x));
    }
}