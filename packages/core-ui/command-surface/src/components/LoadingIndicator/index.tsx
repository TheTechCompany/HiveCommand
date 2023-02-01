import { Box, Typography, CircularProgress } from '@mui/material'
import React from 'react'

export const LoadingIndicator = () => (
    <Box 
      sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0
      }}>
        <Box style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.6, background: "#dfdfdf"}} />
       
            <CircularProgress size='medium' />
            <Typography>Loading...</Typography>
    </Box>
)