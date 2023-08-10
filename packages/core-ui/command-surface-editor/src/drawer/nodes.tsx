import React, { useMemo } from "react";
import { Box } from '@mui/material'
import {useDraggable} from '@dnd-kit/core';

export interface NodeMenuProps {
    nodes?: any[];
}

export const NodeMenu : React.FC<NodeMenuProps> = (props) => {


    const items = useMemo(() => {
        return props.nodes?.reduce((prev, curr) => {
            return prev.concat((curr.elements || []).map((x: any) => ({...x, pack: curr})));
        }, []).map((node: any) => ({
            // extras: {
            //     icon: <></>,
            // },
            group: node.pack.name,
            extras: {
                id: node.id,
                name: node.name,
                pack: node.pack.id
            },
            icon: <></>,
            label: node.name,
            ...node,
            // icon: <></>,
            // icon: node.icon
        }))
    }, [props.nodes])

    return (
        <Box sx={{flex: 1, display: 'flex', flexDirection: 'column', padding: '6px'}}>
        
            {items?.map((block: any) => (
                <Node id={`${block.extras?.pack}:${block.extras?.name}`}>
                    <Box
                        sx={{
                            cursor: 'pointer',
                            borderRadius: '3px',
                            padding: '4px',
                            bgcolor: 'secondary.main',
                            color: 'white',
                            alignItems: 'center',
                            justifyContent: block.extras?.dimensions ? 'center' : 'start',
                            display: 'flex'
                        }}>

                        <div >
                            {React.cloneElement(block.icon, { style: { stroke: 'gray', width: `${block.extras.width}px`, height: `${block.extras.height}px` } })}
                        </div>
                        <Box
                            style={
                                block.extras?.dimensions ||
                                { marginLeft: 8 }
                            }>
                            {block.content || block?.label}
                        </Box>
                    </Box>
                </Node>
            ))}
        </Box>
    )
}

export interface NodeProps {
    id: string;

}

export const Node : React.FC<NodeProps> = (props) => {
  
const {attributes, listeners, setNodeRef, transform} = useDraggable({
    id: props.id,
    
  });

  const style = transform ? {
    // transform: `translate3d(${transform.x}px, ${transform.y}px, 50px)`
  } : undefined;

  
  return (
    <div ref={setNodeRef} style={{...style, marginBottom: '6px', zIndex: 100}} {...listeners} {...attributes}>
      {props.children}
    </div>
  );
}