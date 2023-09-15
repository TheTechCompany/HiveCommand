
import React, {useRef, useEffect, useState} from 'react';
import { NodeProps } from 'reactflow';
import { TextField, Typography, IconButton } from '@mui/material'
import { Done } from '@mui/icons-material'

export const TextNode = (props: NodeProps) => {

    const nodeRef = useRef<any>(null);

    return (
        <div 
        ref={nodeRef}
        style={{
            background: props.selected ? 'rgba(0, 89, 220, 0.08)' : undefined,
            border: props.selected ? '1px dotted rgba(0, 89, 220, 0.8)' : undefined,
        }}>
            
                <Typography sx={{fontSize: props.data?.fontSize}}>
                    {props.data?.text}
                </Typography>
        </div>
    )
}