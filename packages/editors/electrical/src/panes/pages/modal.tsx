import { DialogActions, Button, DialogContent, DialogTitle, Dialog, TextField, Box, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import React, { useEffect, useState } from "react";

export interface PageModalProps {
    open: boolean;
    selected?: any;
    view?: string;

    templates?: {id: string, name: string}[]

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

    const title = props.view == 'pages' ? 'Page' : 'Template';

    return (
        <Dialog fullWidth onClose={props.onClose} open={props.open}>
            <DialogTitle>{props.selected ? "Update" : "Create"} {title}</DialogTitle>
            <DialogContent>
                <Box sx={{padding: '6px'}}>
                    <TextField 
                        value={page.name} 
                        onChange={e => setPage({...page, name: e.target.value})} 
                        label={`${title} name`} 
                        size="small" 
                        fullWidth />
                    
                    {props.view == 'pages' && (
                        <FormControl size="small" fullWidth>
                            <InputLabel>Template</InputLabel>
                            <Select label="Template">
                                {props.templates?.map((template) => (
                                    <MenuItem value={template.id}>{template.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    
                    )}
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