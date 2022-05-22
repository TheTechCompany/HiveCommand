import { Condition } from "../condition";
import { CommandProcessEdge, EdgeCondition } from "@hive-command/data-types";

export class Transition {
    
    private link: CommandProcessEdge;

    private getVariable?: (key: string) => any;

    constructor(link: CommandProcessEdge, getVariable?: (key: string) => any){
        this.link = link
        this.getVariable = getVariable;
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
        return (this.link.options?.conditions || []).map((x: EdgeCondition) => new Condition(x, this.getVariable));
    }
}