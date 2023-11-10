import { Box, CircularProgress, Typography } from '@mui/material';
import React from 'react';

export const LoadingView = () => {
    return (
        <Box sx={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
            <CircularProgress />
            <Typography sx={{marginTop: '12px'}}>Loading Command...</Typography>
        </Box>
    )
}