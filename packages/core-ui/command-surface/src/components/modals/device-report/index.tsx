import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import React, { useState } from 'react';

export const DeviceReportModal = (props: {open: boolean, onClose: () => void, onSubmit?: (report: {name: string}) => void}) => {

    const [ name, setName ] = useState('');


    const onSubmit = () => {
        props.onSubmit?.({name})
        setName('')
    }

    return (
        <Dialog 
            fullWidth
            open={props.open} 
            onClose={props.onClose}>
            <DialogTitle>Create Report</DialogTitle>
            <DialogContent>
                <TextField 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    sx={{marginTop: "9px"}} 
                    size="small" 
                    fullWidth
                    label="Report Name" />
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onClose}>Close</Button>
                <Button color="primary" onClick={onSubmit} variant="contained">Create</Button>
            </DialogActions>
        </Dialog>

    )
}