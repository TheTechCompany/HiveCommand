import {Autocomplete, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import React from 'react';

export const ActionModal = (props) => {
    return (
        <Dialog
            fullWidth
            onClose={props.onClose}
            open={props.open}>
            <DialogTitle>
                Add action
            </DialogTitle>
            <DialogContent>
                <Box sx={{paddingTop: '12px'}}>
                    <Autocomplete
                        options={[]}
                        renderInput={(params) => <TextField {...params} label="Type" />}
                            />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onClose}>Cancel</Button>
                <Button variant="contained" color="primary">Save</Button>
            </DialogActions>
        </Dialog>
    )
}