import React, { useMemo } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';
import { useEditorContext } from '../context';

export const ElectricalSymbol = (props: NodeProps) => {

    const { elements } = useEditorContext();
    
    const { component } = useMemo(() => elements?.find((a) => a.name == props.data.symbol), [props.data.symbol]);

    const ports = component?.metadata?.ports || [];

    return (
        <div style={{ 
            background: props.selected ? 'rgba(0, 89, 220, 0.08)' : undefined,
            border: props.selected ? '1px dotted rgba(0, 89, 220, 0.8)' : undefined,
            transform: `rotate(${props.data.rotation}deg)`, 
            width: props.data.width || '100px', 
            height: props.data.height || 'auto'
        }}>
            {props.data.symbol ? component() : "no icon found"}
            <Handle type={"target"} id={props.id} position={Position.Left} style={{position: "absolute"}} />
            <Handle type={"source"} id={props.id} position={Position.Left} style={{position: "absolute"}} />

            {ports.map((port: any) => (
                <Handle type={"target"} id={port.id} position={Position.Left} style={{position: "absolute", left: port.x, top: port.y}} />
            ))}
        </div>
    )
}

export const CanvasNode = (props: NodeProps) => {
    return (
        <div style={{width: 50, height: 50, opacity: 0}}>
            <Handle type="target" id={"canvas-target"} position={Position.Left}  />
            <Handle type="source" id={"canvas-source"} position={Position.Left}  />
        </div>
    )
}