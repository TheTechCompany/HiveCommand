import { DateTimePicker } from '@mui/x-date-pickers'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@mui/material'
import React, { useState } from 'react'

export const DownloadWindow = (props: {open: boolean, onClose: () => void, onSubmit?: (window: {startTime: Date | null, endTime: Date | null}) => void}) => {

    const [ startTime, setStartTime ] = useState<Date | null>(new Date());
    const [ endTime, setEndTime ] = useState<Date | null>(new Date());

    const onSubmit = () => {
        props.onSubmit?.({startTime, endTime})
        
        setStartTime(new Date());
        setEndTime(new Date());
    }

    return (
        <Dialog open={props.open} onClose={props.onClose}>
            <DialogTitle>
                Download device data
            </DialogTitle>

            <DialogContent>
                <Typography>Select a time window to download data for</Typography>

                <DateTimePicker 
                    label="Start Time"
                    value={startTime}
                    onChange={(date: Date | null) => {
                        setStartTime(date)
                    }}
                    renderInput={(params: any) => (
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
                    onChange={(date: Date | null) => {
                        setEndTime(date)
                    }}
                    renderInput={(params: any) => (
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
                <Button color="primary" variant="contained" onClick={onSubmit}>Download</Button>
            </DialogActions>
        </Dialog>
    )
}