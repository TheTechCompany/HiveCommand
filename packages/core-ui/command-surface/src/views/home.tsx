import { Box, Button, Paper, Typography } from '@mui/material'
import React, { useContext } from 'react'
import { ArrowForward } from '@mui/icons-material'
import { DeviceControlContext } from '../context'
import { useLocation } from 'react-router-dom'

export const HomeView = () => {

    const loc = useLocation();
    console.log("Home lic", loc)

    const { setView } = useContext(DeviceControlContext);

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
                    <Button 
                        onClick={() => {
                            setView?.('controls')
                        }}
                        variant="contained" endIcon={<ArrowForward />}>Go to Controls</Button>
                </Paper>
                
            </Box>
        </Box>
    )
}