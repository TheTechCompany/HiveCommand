import React, { useMemo } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';
import { useEditorContext } from '../context';

export const ElectricalSymbol = (props: NodeProps) => {

    const { elements } = useEditorContext();
    
    const { component } = useMemo(() => elements?.find((a) => a.name == props.data.symbol), [props.data.symbol]);

    const ports = component?.metadata?.ports || [];

    return (
        <div style={{ transform: `rotate(${props.data.rotation}deg)`, width: props.data.width || '100px', height: props.data.height || 'auto'}}>
            {props.data.symbol ? component() : "no icon found"}
            {ports.map((port: any) => (
                <Handle type={"source"} id={port.id} position={Position.Left} style={{position: "absolute", left: port.x, top: port.y}} />
            ))}
        </div>
    )
}