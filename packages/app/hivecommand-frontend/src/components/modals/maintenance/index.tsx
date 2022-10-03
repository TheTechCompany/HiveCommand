import { DateTimePicker } from '@mui/x-date-pickers'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@mui/material'
import React, { useState } from 'react'

export const MaintenanceWindow = (props) => {

    const [ startTime, setStartTime ] = useState(new Date());
    const [ endTime, setEndTime ] = useState(new Date());

    const onSubmit = () => {
        props.onSubmit?.({startTime, endTime})
        
        setStartTime(new Date());
        setEndTime(new Date());
    }

    return (
        <Dialog open={props.open} onClose={props.onClose}>
            <DialogTitle>
                Maintenance Window
            </DialogTitle>

            <DialogContent>
                <Typography>Select a time window to lock-out for maintenance</Typography>

                <DateTimePicker 
                    label="Start Time"
                    value={startTime}
                    onChange={(date) => {
                        setStartTime(date)
                    }}
                    renderInput={(params) => (
                        <TextField 
                            sx={{
                                marginTop: '9px'
                            }}
                            fullWidth 
                            size="small" 
                            {...params} />
                    )} />

                <DateTimePicker
                    
                    label="End Time" 
                    value={endTime}
                    onChange={(date) => {
                        setEndTime(date)
                    }}
                    renderInput={(params) => (
                        <TextField 
                            sx={{
                                marginTop: '9px'
                            }}    
                            fullWidth 
                            size="small" 
                            {...params} />
                    )} />
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onClose}>Close</Button>
                <Button color="primary" variant="contained" onClick={onSubmit}>Submit</Button>
            </DialogActions>
        </Dialog>
    )
}