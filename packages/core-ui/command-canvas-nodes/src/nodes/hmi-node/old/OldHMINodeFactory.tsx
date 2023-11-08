import React, { cloneElement, useContext } from "react";
import { AbstractNodeFactory } from "@hexhive/ui";
import { OldHMINode } from "./OldHMINode";
import { EditorHandles } from "./EditorHandles";

export const OldHMINodeFactory : (building: boolean) => AbstractNodeFactory = (building: boolean = false) => {

    return (context) => {

        return {
            type: 'hmi-node',
            renderNodeContainer: (node: any, props: any, children: any) => {
                // children = cloneElement(children, {width: node.width, height: node.height});

                return building ? (
                    <EditorHandles 
                        extraProps={props}
                        active={node.isSelected || false} 
                        rotation={(node as any).rotation}
                        x={node.x} 
                        y={node.y} 
                        height={node.height}
                        width={node.width}
                        scaleX={node.scaleX}
                        scaleY={node.scaleY}
                        // onEditBounds={(id, updateFn) => {
                        //     const newData = updateFn({position: {x: node.x, y: node.y}, size: {width: node.width, height: node.height}, rotation: node.rotation})


                        //     console.log({newData, updateNodeBounds})
                        //     updateNodeBounds?.(id, {width: newData.size?.width || 0, height: newData.size?.height || 0, rotation: newData.rotation || 0})
                        // }}
                        id={node.id}>
                        {children}
                    </EditorHandles>
                ) : (<div 
                        {...props}>{children}</div>)
            },
            renderNode: (event: any) => {
                // console.log(event)
                return (<OldHMINode  {...event} building={building} />)
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
}