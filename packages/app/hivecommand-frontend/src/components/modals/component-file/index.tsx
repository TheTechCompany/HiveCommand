import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog/Dialog";
import DialogActions from "@mui/material/DialogActions/DialogActions";
import DialogContent from "@mui/material/DialogContent/DialogContent";
import DialogTitle from "@mui/material/DialogTitle/DialogTitle";
import TextField from "@mui/material/TextField/TextField";
import React, { useEffect, useState } from "react";

export const ComponentFileModal = (props: any) => {

    const [ file, setFile ] = useState<{id?: string, path?: string}>({})

    const onSubmit = () => {
        props.onSubmit?.(file);
    }

    useEffect(() => {
        setFile(props.selected?.path ? {
            path: props.selected?.path,
            id: props.selected?.id
        } : {})
    }, [props.selected])

    return (
        <Dialog fullWidth open={props.open} onClose={props.onClose}>
            <DialogTitle>Create File</DialogTitle>
            <DialogContent>
                <TextField 
                    fullWidth
                    size="small"
                    value={file.path}
                    sx={{marginTop: '12px'}}
                    onChange={(e) => setFile({...file, path: e.target.value}) }
                    label="Path" />
            </DialogContent>
            <DialogActions sx={{display: 'flex', justifyContent: props.selected ? 'space-between': undefined}}>
                {props.selected && (
                    <Button color="error" onClick={() => props.onDelete(props.selected)} >Delete</Button>
                )}

                <Box sx={{display: 'flex'}}>
                    <Button onClick={props.onClose}>Cancel</Button>
                    <Button onClick={onSubmit} color="primary" variant="contained">Save</Button>
                </Box>
            </DialogActions>
        </Dialog>
    )
}