import { Condition } from "../Condition";
import { ProcessLink } from "@hive-command/data-types";

export class Transition {
    private link: ProcessLink;

    constructor(link: ProcessLink){
        this.link = link
    }

    get source(){
        return this.link.source
    }

    get target(){
        return this.link.target
    }

    get conditions() : Condition[]{
        return (this.link.extras?.conditions || []).map((x) => new Condition(x));
    }
}