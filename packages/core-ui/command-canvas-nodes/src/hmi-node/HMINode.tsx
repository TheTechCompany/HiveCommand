import { Box } from '@mui/material';
import React from 'react';
import {NodeProps} from 'reactflow';

export const HMINode = (props: NodeProps) => {
    const Icon = props?.data?.extras?.icon || (() => <div>no component found</div>)

    console.log("HMI_NODE")

    return (
        <Box sx={{
            width: props.data?.width || '72px',
            height: props.data?.height || '72px',
        }}>
                <Icon
                    // editing={props.building}
              
                    options={props.data?.extras?.dataValue}
                    width={props?.data?.width}
                    height={props?.data?.height}
                    // {...props.options}
                    size="medium" />
        </Box>
    )
}