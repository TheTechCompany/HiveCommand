import React, { useEffect, useState } from 'react';
import { BaseModal } from '../base';
import { nanoid } from 'nanoid';
import { Dialog, TextField, Box, Select, Typography, MenuItem, DialogTitle, DialogContent, DialogActions, InputLabel, Button, FormControl, InputAdornment} from '@mui/material';

export interface DeviceModalProps {
    open: boolean;
    
    onClose?: () => void;
    onSubmit?: (data: any) => void;
    selected?: any; // change to device interface

    programs?: any[]

}

export const DeviceModal : React.FC<DeviceModalProps> = (props) => {

    const [ device, setDevice ] = useState<any>({
        name: '',
        program: '',
        network_name: nanoid().substring(0, 8)
    })

    const onClose = () => {
        props.onClose?.()

        setDevice({
            name: '',
            program: {},
            network_name: nanoid().substring(0, 8)
        })
      
    }

    const onSubmit = () => {
        if(device.name) props.onSubmit?.(device) 
    }


    useEffect(() => {
        if(props.selected){
            setDevice({
                ...props.selected,
                // program: props.programs?.find((a) => a.id == props.selected.program)
            })
        
        }
    }, [props.selected])

    return (
        <Dialog
            open={props.open}
            onClose={onClose}
            >
            <DialogTitle>{`${props.selected?.id ? 'Edit' : 'Add'} Device`}</DialogTitle>
            <DialogContent sx={{display: 'flex', flexDirection: 'column', '& *': {marginBottom: '6px'}}}>
              <FormControl>
                <TextField 
                    fullWidth
                    size="small"
                    value={device?.name}
                    onChange={(e) => setDevice({...device, name: e.target.value})}
                    placeholder="Device Name"
                    />
                </FormControl>
  
                    <TextField 
                        InputProps={{
                            endAdornment: <InputAdornment position="end"><Typography>.hexhive.io</Typography></InputAdornment>
                        }}
                        size="small"
                        fullWidth 
                        value={device.network_name}
                        onChange={(e) => setDevice({...device, network_name: e.target.value})}
                        placeholder="Network name" />

                

               
               <FormControl size="small">
                   <InputLabel>Program</InputLabel>
                    <Select
                        value={device.activeProgram?.id || ''}
                        onChange={(event) => {
                            console.log({newValue:event.target.value, programs:  props.programs})
                            setDevice({...device, activeProgram: {id: event.target.value} })
                        }}
                        label="Program"
                        >
                        {(props.programs || []).map((program) => (
                            <MenuItem value={program.id}>{program.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onClose}>Close</Button>
                <Button onClick={onSubmit} variant="contained">{props?.selected?.id ? 'Save': 'Create'}</Button>
            </DialogActions>    
        </Dialog>
    )
}