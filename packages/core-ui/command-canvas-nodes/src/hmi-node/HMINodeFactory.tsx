import React from "react";
import { AbstractNodeFactory, InfiniteCanvasNode } from "@hexhive/ui";
import { HMINode } from "./HMINode";
import { EditorHandles } from "./EditorHandles";

export const HMINodeFactory : (building: boolean) => AbstractNodeFactory = (building: boolean = false) => (context) => {

    return {
        type: 'hmi-node',
        renderNodeContainer: (node: any, props: any, children: any) => {

            return building ? (
                <EditorHandles 
                    extraProps={props}
                    active={node.isSelected || false} 
                    rotation={(node as any).rotation}
                    x={node.x} 
                    y={node.y} 
                    scaleX={node.scaleX}
                    scaleY={node.scaleY}
                    id={node.id}>
                    {children}
                </EditorHandles>
            ) : (<div 
                    {...props}>{children}</div>)
        },
        renderNode: (event: any) => {
            // console.log(event)
            return (<HMINode  {...event} building={building} />)
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