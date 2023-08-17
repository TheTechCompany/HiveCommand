import { DialogActions, Button, DialogContent, DialogTitle, Dialog, TextField } from "@mui/material";
import React, { useState } from "react";

export interface PageModalProps {
    open: boolean;
    onClose?: () => void;
    onSubmit?: (page: any) => void;
}

export const PageModal : React.FC<PageModalProps> = (props) => {

    const [ page, setPage ] = useState<{name?: string}>({name: ''})

    return (
        <Dialog onClose={props.onClose} open={props.open}>
            <DialogTitle>Create Page</DialogTitle>
            <DialogContent>
                <TextField value={page.name} onChange={e => setPage({...page, name: e.target.value})} label="Page name" size="small" fullWidth />
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onClose}>Cancel</Button>
                <Button onClick={() => props.onSubmit?.(page)} color="primary" variant="contained">Create</Button>
            </DialogActions>
        </Dialog>
    )
}