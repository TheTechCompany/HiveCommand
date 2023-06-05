import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog/Dialog";
import DialogActions from "@mui/material/DialogActions/DialogActions";
import DialogContent from "@mui/material/DialogContent/DialogContent";
import DialogTitle from "@mui/material/DialogTitle/DialogTitle";
import TextField from "@mui/material/TextField/TextField";
import React, { useState } from "react";

export const ComponentFileModal = (props: any) => {

    const [ file, setFile ] = useState<{path?: string}>({})

    const onSubmit = () => {
        props.onSubmit?.(file);
    }

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
            <DialogActions>
                <Button onClick={props.onClose}>Cancel</Button>
                <Button onClick={onSubmit} color="primary" variant="contained">Save</Button>
            </DialogActions>
        </Dialog>
    )
}