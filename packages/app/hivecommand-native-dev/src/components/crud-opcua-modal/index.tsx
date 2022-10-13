import { Button, DialogContent, DialogTitle, TextField } from '@mui/material'
import { InputAdornment } from '@mui/material';
import { DialogActions } from '@mui/material'
import { Dialog } from '@mui/material'
import React, { useEffect, useState } from 'react'

export interface OPCUAModalProps {
    open: boolean;
    selected?: any;
    onClose?: () => void;
    onSubmit?: (opcua: {host: string, port: number, name: string}) => void;
}

export const CRUDOPCUAModal : React.FC<OPCUAModalProps> = (props) => {


    const [ opcuaBlob, setOPCUABlob ] = useState<{
        name: string;
        host: string;
        port: number;
    }>({
        name: '',
        host: '',
        port: 4840
    })

    const isEditing = (opcuaBlob as any).id != null;

    useEffect(() => {
        setOPCUABlob({
            ...props.selected
        })
    }, [props.selected])

    useEffect(() => {
        if(!props.open){
            setOPCUABlob({
                name: '',
                host: '',
                port: 4840
            })
        }
    }, [props.open])

    const onClose = () => {
        props.onClose?.();
    }  

    const onSubmit = () => {
        props.onSubmit?.(opcuaBlob)
    }

    return (
        <Dialog 
            fullWidth
            onClose={onClose}
            open={props.open}>
            <DialogTitle>
                {isEditing ? "Update" : "Create"} OPCUA
            </DialogTitle>
            <DialogContent>
                <TextField 
                    size="small" 
                    fullWidth
                    sx={{marginTop: '12px'}}
                    value={opcuaBlob.name} 
                    onChange={(e) => setOPCUABlob({...opcuaBlob, name: e.target.value})} 
                    label="Name" />
                <TextField 
                    size="small" 
                    fullWidth
                    sx={{marginTop: '12px'}}
                    value={opcuaBlob.host} 
                    InputProps={{
                        startAdornment: <InputAdornment position='start'>opc.tcp://</InputAdornment>
                    }}
                    onChange={(e) => setOPCUABlob({...opcuaBlob, host: e.target.value})} 
                    label="Host" />
                <TextField 
                    type="number" 
                    fullWidth
                    sx={{marginTop: '12px'}}
                    value={opcuaBlob.port} 
                    onChange={(e) => setOPCUABlob({...opcuaBlob, port: parseInt(e.target.value || '4840')})} 
                    size="small" 
                    label="Port" />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={onSubmit} color="primary" variant="contained">{isEditing ? "Save" : "Create"}</Button>
            </DialogActions>
        </Dialog>
    )
}