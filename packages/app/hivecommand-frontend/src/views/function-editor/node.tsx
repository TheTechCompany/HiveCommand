import { Divider } from '@mui/material';
import React from 'react';
import { Handle, NodeProps, Position } from 'reactflow';

export const FunctionBlock = (props: NodeProps) => {
    return (
        <div style={{
            backgroundColor: 'white',
            border: props.selected ? '2px solid black' : '1px solid black',
            borderRadius: '3px',
            padding: '6px'
        }}>
            {!props.data?.start && <Handle position={Position.Top} type='target' />}

            {props.data?.label}
            <Divider />
            {props.data?.name}

            {!props.data?.end && <Handle position={Position.Bottom} type='source' />}
        </div>
    )
}