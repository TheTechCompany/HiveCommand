import React from "react";
import { AbstractWidgetFactory } from "@hexhive/ui";
import { HMINode } from "./HMINode";
import { HMIGroup } from "./HMIGroup";

export class HMINodeFactory extends AbstractWidgetFactory {

    public static TAG : string = 'hmi-node';

    private building = false;

    constructor(building?: boolean){
        super('hmi-node')
        this.building = building;
    }

    public generateWidget(event: any): JSX.Element {
        return event.extras.nodes ? <HMIGroup {...event} /> : (<HMINode  {...event} />)
    }
    public parseModel(model: any) {
        return {
            ...model,
            building: this.building,
            ports: model.ports ? model.ports : [
                {
                    name: "in",
                    type: "base"
                    
                },
                {
                    name: 'out',
                    type: 'base'
                }
            ]
        }
    }

}