import React from 'react';
import { Handle, Position } from 'reactflow'
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { Add } from '@mui/icons-material'
import { Box } from '@mui/material';
import {CSS} from '@dnd-kit/utilities';

export const DropNode = (props: any) => {
    const {attributes, listeners, setNodeRef, transform} = useDraggable({
        id: props.id,
      });

      const style = {
        // Outputs `translate3d(x, y, 0)`
        cursor: 'pointer',
        transform: CSS.Translate.toString(transform),
        zIndex: 99
      };
      
    return (
        <div ref={setNodeRef} style={{...style, ...props.style}} {...attributes} {...listeners}>
            {props.children}
        </div>
    )
}
export const NodeDropzone = (props: any) => {

    const { isOver, setNodeRef } = useDroppable({
        id: props.id,
    });

    const style = {
        opacity: isOver ? 1 : 0.5,
    };

    return (
        <div ref={setNodeRef} style={style}>
            <Box sx={{ '& :hover': { background: '#dfdfdf' } }}>
                <Box sx={{ border: '1px dashed gray', width: '20px', height: '20px', padding: '12px', borderRadius: '6px', fontSize: '20px' }}>
                    <Handle type="target" position={Position.Top} />
                    <Add sx={{ width: '20px', height: '20px' }} />
                </Box>
            </Box>
        </div>
    )
}