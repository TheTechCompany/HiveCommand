import React from 'react';
import { Paper } from '@mui/material'
import { Handle, NodeProps, Position } from 'reactflow';

export const PageNode = (props: NodeProps) => {

    const ratio = 210 / 297

    return (
        <Paper style={{
            width: props.data?.width || 1080, 
            height: props.data?.height || 1080*ratio,
            opacity: 0.4
        }}>
            {/* <Handle type="target" id={"canvas-target"} position={Position.Left}  />
            <Handle type="source" id={"canvas-source"} position={Position.Left}  /> */}
        </Paper>
    )
}