import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';

export const DeviceAnalyticModal = (props: {
    open: boolean, 
    selected?: any,
    onClose: () => void, 
    onDelete?: () => void,
    onSubmit?: (report: {id?: string, name: string}) => void
}) => {

    const [ report, setReport ] = useState<{id?: string, name: string}>({name: ''})

    useEffect(() => {
        setReport({...props.selected})
    }, [props.selected])

    const onSubmit = () => {
        props.onSubmit?.(report)
        setReport({name: ''})
    }

    return (
        <Dialog 
            fullWidth
            open={props.open} 
            onClose={props.onClose}>
            <DialogTitle>{props.selected ? "Update": "Create"} Report</DialogTitle>
            <DialogContent>
                <TextField 
                    value={report.name}
                    onChange={(e) => setReport({...report, name: e.target.value}) }
                    sx={{marginTop: "9px"}} 
                    size="small" 
                    fullWidth
                    label="Report Name" />
            </DialogContent>
            <DialogActions sx={{display: 'flex', justifyContent: props.selected ? 'space-between' : 'flex-end'}}>
                {props.selected && props.onDelete && <Button onClick={props.onDelete} color="error">Delete</Button>}
                <Box sx={{display: 'flex'}}>
                    <Button onClick={props.onClose}>Close</Button>
                    <Button color="primary" onClick={onSubmit} variant="contained">{props.selected ? "Save" : "Create"}</Button>
                </Box>
            </DialogActions>
        </Dialog>

    )
}