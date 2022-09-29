import React from "react";
import { AbstractNodeFactory, InfiniteCanvasNode } from "@hexhive/ui";
import { HMINode } from "./HMINode";
import { HMIGroup } from "./HMIGroup";
import { EditorHandles } from "./EditorHandles";

export const HMINodeFactory : (building: boolean) => AbstractNodeFactory = (building: boolean = false) => (context) => {

    return {
        type: 'hmi-node',
        renderNodeContainer: (node: InfiniteCanvasNode, children: any) => {
            return building ? (
                <EditorHandles 
                    active={node.isSelected} 
                    rotation={node.rotation}
                    x={node.x} 
                    y={node.y} 
                    id={node.id}>
                    {children}
                </EditorHandles>
            ) : (<div style={{position: 'absolute', top: node.y, left: node.x, transform: `rotate(${node.rotation}deg)`}}>{children}</div>)
        },
        renderNode: (event: any) => {
            // console.log(event)
            return event.extras.nodes ? <HMIGroup {...event} building={building} /> : (<HMINode  {...event} building={building} />)
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