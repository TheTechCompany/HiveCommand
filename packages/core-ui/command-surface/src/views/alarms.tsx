import { Box, List, ListItem, Typography } from '@mui/material'
import React, { useContext } from 'react'
import { DeviceControlContext } from '../context';

export const AlarmList = () => {

    const { alarms } = useContext(DeviceControlContext);
    
    return (
        <Box sx={{flex: 1}}>
            <Box sx={{display: 'flex', alignItems: 'center', marginBottom: '12px', marginTop: '12px', justifyContent: 'center'}}>
                <Typography>Alarms</Typography>
            </Box>
            <List>  
                {alarms?.map((alarm) => (
                    <ListItem>{alarm.message} {alarm.severity} {alarm.createdAt} {alarm.cause?.title}</ListItem>
                ))}
            </List>
        </Box>
    )
}