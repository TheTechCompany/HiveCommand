import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { Autocomplete, Box } from '@mui/material'

import React, { useEffect, useState } from 'react';
import { useCommandEditor } from '../../context';
import { DataTypes } from '@hive-command/scripting';

export const TemplateModal= (props) => {

    const { program: {types} } = useCommandEditor();

    const [ io, setIO ] = useState<{name?: string, type?: string}>({});

    const dataTypes = Object.keys(DataTypes).map((x) => ({name: x})).concat([{name: 'Tag'}, {name: 'Function'}]) //[{name: 'Boolean'}, {name: 'String'}, {name: 'Number'}, {name: 'Function'}, {name: 'Device'}];

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
                    
                    {io.type?.indexOf("Tag") > -1 && (
                        <Autocomplete
                            sx={{marginTop: '12px'}}
                            onChange={(e, newVal) => {
                                if(typeof(newVal) === 'string') return;
                                setIO({
                                    ...io,
                                    type: newVal ? `Tag:${newVal?.id}` : `Tag`
                                })
                            }}
                            value={types?.find((a) => a.id === io?.type?.split(':')?.[1]) || null}
                            getOptionLabel={(option) => typeof(option) === 'string' ? option : option.name}
                            renderInput={(params) => <TextField {...params} label="Tag Type" size="small" />}
                            options={types || []} />
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