import { Box, Collapse, Divider, IconButton, List, ListItem, Typography } from '@mui/material'
import React, { useContext, useState } from 'react'
import { DeviceControlContext } from '../context';
import { Check, ChevronRight, KeyboardArrowDown } from '@mui/icons-material';
import moment from 'moment';

export const AlarmList = () => {

    const { alarms, client } = useContext(DeviceControlContext);
    
    const sortedAlarms = alarms?.slice()?.sort((a,b) => new Date(b.createdAt)?.getTime() - new Date(a.createdAt)?.getTime())

    const [ expanded, setExpanded ] = useState<string[]>([])

    const toggleExpansion = (id: string) => {
        if(expanded.includes(id)){
            let ex = expanded.slice()
            ex.splice(ex.indexOf(id), 1)

            setExpanded(ex)
        }else{
            setExpanded([...expanded, id])
        }
    }

    return (
        <Box sx={{flex: 1}}>
            <Box sx={{display: 'flex', alignItems: 'center', marginBottom: '12px', marginTop: '12px', justifyContent: 'center'}}>
                <Typography>Alarms</Typography>
            </Box>
            <List sx={{overflowY: 'auto', height: '100%'}}>  
                {sortedAlarms?.map((alarm) => (
                    <>
                    <ListItem>
                        <Box sx={{display: 'flex', alignItems: 'flex-start'}}>
                            {/* <IconButton onClick={() => toggleExpansion(alarm.id)}>
                                {expanded.includes(alarm.id) ? <KeyboardArrowDown /> : <ChevronRight />}
                            </IconButton> */}
                        </Box>
                        <Box sx={{display: 'flex', flex: 1, flexDirection: 'column'}}>
                            <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                                <Typography>{alarm.message}</Typography>
                                <Box sx={{display: 'flex'}}>
                                    {/* <Divider orientation='vertical'/> */}
                                    {/* <Typography>{alarm.cause?.title}</Typography> */}
                                    {!alarm?.ack ? (
                                        <IconButton onClick={() => {
                                            client?.acknowledgeAlarm?.(alarm?.id);
                                        }}>
                                            <Check />
                                        </IconButton>
                                    ) : null}
                                </Box>
                            </Box>
                            <Box>
                                <Typography>Raised at: {moment(alarm.createdAt).format("hh:mma - DD/MM/YYYY")}</Typography>
                                <Typography>Severity : {alarm.severity}</Typography>
                            </Box>
                            <Collapse in={expanded.includes(alarm.id)}>
                            </Collapse>
                        </Box>
                        
                        {/* {alarm.message} {alarm.severity} {alarm.createdAt} {alarm.cause?.title} */}
                    </ListItem>
                    <Divider />
                    </>
                ))}
            </List>
        </Box>
    )
}