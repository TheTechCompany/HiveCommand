import { DialogActions, Button, DialogContent, DialogTitle, Dialog, TextField, Box } from "@mui/material";
import React, { useEffect, useState } from "react";

export interface PageModalProps {
    open: boolean;
    selected?: any;
    onClose?: () => void;
    onSubmit?: (page: any) => void;
    onDelete?: () => void;
}

export const PageModal : React.FC<PageModalProps> = (props) => {

    const [ page, setPage ] = useState<{name?: string}>({name: ''})

    useEffect(() => {
        setPage({
            ...props.selected
        })
    }, [props.selected])

    return (
        <Dialog fullWidth onClose={props.onClose} open={props.open}>
            <DialogTitle>{props.selected ? "Update" : "Create"} Page</DialogTitle>
            <DialogContent>
                <Box sx={{padding: '6px'}}>
                    <TextField value={page.name} onChange={e => setPage({...page, name: e.target.value})} label="Page name" size="small" fullWidth />

                </Box>
            </DialogContent>
            <DialogActions sx={{display: 'flex', justifyContent: props.selected ? 'space-between': 'flex-end'}}>
                {props.selected && <Button onClick={props.onDelete} color="error">Delete</Button>}
                <Box sx={{display: 'flex'}}>
                    <Button onClick={props.onClose}>Cancel</Button>
                    <Button onClick={() => props.onSubmit?.(page)} color="primary" variant="contained">{props.selected ? "Save" : "Create"}</Button>    
                </Box>
            </DialogActions>
        </Dialog>
    )
}