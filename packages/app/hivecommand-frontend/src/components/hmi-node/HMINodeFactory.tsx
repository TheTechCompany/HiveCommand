import React from "react";
import { AbstractNodeFactory } from "@hexhive/ui";
import { HMINode } from "./HMINode";
import { HMIGroup } from "./HMIGroup";

export const HMINodeFactory : (building: boolean) => AbstractNodeFactory = (building: boolean = false) => (context) => {

    return {
        type: 'hmi-node',
        renderNode: (event: any) => {
            return event.extras.nodes ? <HMIGroup {...event} /> : (<HMINode  {...event} />)
        },
        parseModel: (model: any) => {
            return {
                ...model,
                building: building,
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
}