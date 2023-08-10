import React from "react"
import { NodeProps } from 'reactflow';
import { Box } from '@mui/material';

export const OutlineNode = (props: NodeProps) => {
    return (
        <Box sx={{
            width: props.data.width,
            height: props.data.height,
            outline: '2px solid black'
        }}>

        </Box>
    )
}
