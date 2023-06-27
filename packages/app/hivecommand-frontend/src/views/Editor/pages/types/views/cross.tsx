import { Box, Paper, Typography } from '@mui/material';
import React from 'react';

export const CrossReference = (props: any) => {
    const { types, active } = props;

    const activeType = types?.find((a) => a.id === active);


    return (
        <Box sx={{padding: '6px', flexDirection: 'column'}}>  
            {activeType?.usedByTag?.map((tag) => (
                <Paper sx={{marginBottom: '6px', padding: '6px'}}>
                    <Typography>{tag.name}</Typography>
                </Paper>
            ))}
        </Box>
    )
}