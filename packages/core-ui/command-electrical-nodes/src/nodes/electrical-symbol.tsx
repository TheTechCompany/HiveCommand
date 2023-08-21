import React, { useMemo } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';
import { useElectricalNodeContext } from '../context';

export const ElectricalSymbol = (props: NodeProps) => {

    const { elements } = useElectricalNodeContext();
    
    console.log({elements, symbol: props.data.symbol});

    const { component } = useMemo(() => elements?.find((a: any) => a.name == props.data.symbol) || {}, [elements, props.data.symbol]);

    const ports = component?.metadata?.ports || [];

    console.log(component);

    return (
        <div style={{ 
            background: props.selected ? 'rgba(0, 89, 220, 0.08)' : undefined,
            border: props.selected ? '1px dotted rgba(0, 89, 220, 0.8)' : undefined,
            transform: `rotate(${props.data.rotation}deg)`, 
            width: props.data.width || '100px', 
            height: props.data.height || 'auto'
        }}>
            {props.data.symbol ? component?.() : "no icon found"}
            <Handle type={"target"} id={props.id} position={Position.Left} style={{position: "absolute"}} />
            <Handle type={"source"} id={props.id} position={Position.Left} style={{position: "absolute"}} />

            {ports.map((port: any) => (
                <Handle type={"target"} id={port.id} position={Position.Left} style={{position: "absolute", left: port.x, top: port.y}} />
            ))}
        </div>
    )
}