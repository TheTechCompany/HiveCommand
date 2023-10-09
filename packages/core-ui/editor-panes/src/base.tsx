import React from 'react';
import { Box } from '@mui/material';

export interface BasePaneProps {

}

export const BasePane : React.FC<BasePaneProps> = (props) => {
    return (
        <Box sx={{
            width: '240px',
            display: 'flex',
            flexDirection: 'column'
            // bgcolor: 'secondary.main'
        }}>
            {props.children}
        </Box>
    )
}