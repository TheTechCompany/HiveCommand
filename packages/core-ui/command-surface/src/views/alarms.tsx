import { Box, List, ListItem } from '@mui/material'
import React, { useContext } from 'react'
import { DeviceControlContext } from '../context';

export const AlarmList = () => {

    const { alarms } = useContext(DeviceControlContext);
    
    return (
        <Box sx={{flex: 1}}>

            <List>
                {alarms?.map((alarm) => (
                    <ListItem>{alarm.cause}</ListItem>
                ))}
            </List>
        </Box>
    )
}