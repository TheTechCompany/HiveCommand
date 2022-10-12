import React from "react";
import { AbstractNodeFactory } from "@hexhive/ui";
import { IconNode } from "./IconNode";


export const IconNodeFactory : AbstractNodeFactory = (context) => {

    return {
        type: 'icon-node',
        renderNode: (event: any) => {
            return (<IconNode  {...event} />)
        },
        parseModel: (model: any)  => {
            
            return {
                ...model,
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