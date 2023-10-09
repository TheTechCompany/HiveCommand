import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";

export interface NodePropsModalProps {
    open: boolean;
    onClose?: () => void;
    onSubmit?: (data: any) => void;

    options?: { key: string, value: any }[];
}

export const NodePropsModal = (props: NodePropsModalProps) => {

    const [ options, setOptions ] = useState<any[] | null>(null);

    useEffect(() => {
        setOptions(props.options || [])
    }, [props.options])

    const onSubmit = () => {
        props.onSubmit?.(options);
    }

    return (
        <Dialog onKeyDown={(e) => e.stopPropagation()} fullWidth open={props.open} onClose={props.onClose}>
            <DialogTitle>
                Node Properties
            </DialogTitle>
            <DialogContent sx={{flexDirection: 'column', display: 'flex'}}>
                <Box sx={{padding: '6px', flexDirection: 'column', display: 'flex'}}>
                    {options?.map((option, ix) => (
                        <TextField 
                            sx={{marginBottom: '6px'}}
                            size="small" 
                            type={option.type === 'Number' ? 'number' : undefined}
                            value={option.value}
                            onChange={(e) => {
                                setOptions((options) => {
                                    let o = (options || []).slice();

                                    let value: any = e.target.value;

                                    switch(o[ix].type){
                                        case 'Number':
                                            value = parseFloat(value);
                                            break;
                                    }
                                    
                                    o[ix].value = value;

                                    return o;
                                })
                            }} 
                            label={option.key} />
                    ))}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onClose}>Cancel</Button>
                <Button onClick={onSubmit} variant="contained" color="primary">Save</Button>
            </DialogActions>
        </Dialog>
    )
}