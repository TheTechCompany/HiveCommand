import {Autocomplete, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, TextField, Typography } from '@mui/material';
import React, { useMemo } from 'react';

export const ActionModal = (props) => {

    const optionFields = useMemo(() => {
        return Object.keys(props.options || {}).map((key) => {
            switch(props.options[key]){
                case 'string[]':
                    return (
                        <Box sx={{flexDirection: 'column', display: 'flex',}}>
                            <Typography>{key}</Typography>
                            <TextField fullWidth size="small" />
                            <Button>Add</Button>
                        </Box>
                    );
                case 'string':
                    return (<TextField fullWidth label={key} size="small" />)
            }
        }).map((x) => (<Box sx={{marginBottom: '6px'}}>{x}<Divider /></Box>))
    }, [props.options]);

    return (
        <Dialog
            fullWidth
            onClose={props.onClose}
            open={props.open}>
            <DialogTitle>
                Add action
            </DialogTitle>
            <DialogContent sx={{display: 'flex', flexDirection: 'column'}}>
            {optionFields}
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onClose}>Cancel</Button>
                <Button variant="contained" color="primary">Save</Button>
            </DialogActions>
        </Dialog>
    )
}