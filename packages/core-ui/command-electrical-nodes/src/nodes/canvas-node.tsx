import React from 'react';
import { Handle, NodeProps, Position } from 'reactflow';

export const CanvasNode = (props: NodeProps) => {
    return (
        <div style={{width: 50, height: 50, opacity: 0}}>
            <Handle type="target" id={"canvas-target"} position={Position.Left}  />
            <Handle type="source" id={"canvas-source"} position={Position.Left}  />
        </div>
    )
}