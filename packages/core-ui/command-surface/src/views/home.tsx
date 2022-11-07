import { Box, Button, Paper, Typography } from '@mui/material'
import React from 'react'
import { ArrowForward } from '@mui/icons-material'
export const HomeView = () => {
    return (
        <Box sx={{flex: 1, padding: '6px'}}>
            <Typography>Home</Typography>

            <Box sx={{flex: 1, display: 'flex'}}>
                <Box sx={{display: 'flex', flex: 1, flexDirection: 'column'}}>
                    <Paper sx={{bgcolor: 'secondary.light', margin: '6px', padding: '12px'}}>
                        <Typography>Uptime : </Typography>
                    </Paper>
                    <Paper sx={{bgcolor: 'secondary.light', margin: '6px',padding: '12px'}}>
                        <Typography>Alarms</Typography>
                    </Paper>
                </Box>
                <Paper sx={{bgcolor: 'secondary.light', margin: '6px',padding: '12px'}}>
                    <Typography>Control</Typography>
                    <Button variant="contained" endIcon={<ArrowForward />}>Go to Controls</Button>
                </Paper>
                
            </Box>
        </Box>
    )
}