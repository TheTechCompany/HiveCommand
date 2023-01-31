import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { Autocomplete, Box } from '@mui/material'

import React, { useEffect, useState } from 'react';
import { useCommandEditor } from '../../context';

export const TemplateModal= (props) => {

    const { deviceTypes } = useCommandEditor();

    const [ io, setIO ] = useState<{name?: string, type?: string}>({});

    const dataTypes = [{name: 'Boolean'}, {name: 'String'}, {name: 'Number'}, {name: 'Function'}, {name: 'Device'}];

    const onSubmit = () => {
        props.onSubmit?.(io);
    }

    useEffect(() => {
        setIO({...props.selected})
    }, [props.selected])

    console.log({io})

    return (
        <Dialog 
            fullWidth
            onClose={props.onClose}
            open={props.open}>
            <DialogTitle>
                {props.selected?.id ? 'Update': 'Create'} Template {props.direction}
            </DialogTitle>
            <DialogContent>
                <Box sx={{paddingTop: '12px'}}>
                    <TextField 
                        sx={{marginBottom: '12px'}}
                        size="small"
                        value={io.name}
                        onChange={(e) => {
                            setIO({
                                ...io,
                                name: e.target.value
                            })
                        }}
                        fullWidth
                        label={`${props.direction} Name`}/>

                    <Autocomplete
                        value={dataTypes.find((a) => a.name === io.type?.split(':')?.[0]) || null}
                        options={dataTypes}
                        onChange={(e, newVal) => {
                            if(typeof(newVal) === 'string')return;
                            setIO({
                                ...io,
                                type: newVal?.name
                            })
                        }}
                        getOptionLabel={(option) => typeof(option) === 'string' ? option : option.name}
                        renderInput={(params) => <TextField {...params} label={`${props.direction} Type`} size="small" />}
                        />
                    
                    {io.type?.indexOf("Device") > -1 && (
                        <Autocomplete
                            sx={{marginTop: '12px'}}
                            onChange={(e, newVal) => {
                                if(typeof(newVal) === 'string') return;
                                setIO({
                                    ...io,
                                    type: newVal ? `Device:${newVal?.id}` : `Device`
                                })
                            }}
                            value={deviceTypes?.find((a) => a.id === io?.type?.split(':')?.[1]) || null}
                            getOptionLabel={(option) => typeof(option) === 'string' ? option : option.name}
                            renderInput={(params) => <TextField {...params} label="Device Type" size="small" />}
                            options={deviceTypes || []} />
                    )}
                </Box>
            </DialogContent>
            <DialogActions sx={{display: 'flex', justifyContent: props.selected?.id ? 'space-between' : 'flex-end'}}>
                {props.selected && <Button color="error" onClick={props.onDelete}>Delete</Button>}
                <Box>
                    <Button onClick={props.onClose}>Cancel</Button>
                    <Button onClick={onSubmit} color="primary" variant="contained">Save</Button>
                </Box>

            </DialogActions>
        </Dialog>
    )
}