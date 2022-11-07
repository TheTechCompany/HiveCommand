import { Box, Paper, Typography } from '@mui/material'
import React from 'react'

export const HomeView = () => {
    return (
        <Box sx={{flex: 1, padding: '6px'}}>
            <Typography>Home</Typography>

            <Box sx={{flex: 1}}>
                <Paper>
                    <Typography>Uptime : </Typography>
                </Paper>
            </Box>
        </Box>
    )
}