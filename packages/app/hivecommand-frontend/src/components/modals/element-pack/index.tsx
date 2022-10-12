import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';

export const ElementPackModal = (props) => {

    const [ pack, setPack ] = useState<{
        id?: string
        name: string,
        description: string,
        public?: boolean,
        provider: string,
        url: string,
    }>({
        name: '',
        description: '',
        public: false,
        provider: 'hexhive',
        url: ''
    });

    useEffect(( )=> {
        setPack({
            provider: 'hexhive',
            ...props.selected
        })
    }, [props.selected])

    const onSubmit = () => {
        props.onSubmit?.(pack)
    }

    return (
        <Dialog
            maxWidth={'sm'}
            fullWidth
            onClose={props.onClose}
            open={props.open}>
            <DialogTitle>Create Element Pack</DialogTitle>
            <DialogContent sx={{display: 'flex', padding: '6px', flexDirection: 'column'}}>
                <TextField 
                    value={pack.name}
                    onChange={(e) => setPack({...pack, name: e.target.value})}
                    sx={{marginTop: '6px'}}
                    size="small"
                    label="Name" />

                <FormControl
                    size="small"
                    sx={{marginTop: '6px'}}>
                    <InputLabel>Provider</InputLabel>
                    <Select
                        label="Provider"
                        value={pack.provider}
                        onChange={(e) => {
                            setPack({
                                ...pack,
                                provider: e.target.value
                            })
                        }}
                        >
                        <MenuItem value={'hexhive'}>HexHive</MenuItem>
                        <MenuItem value={'github'}>Github</MenuItem>
                        <MenuItem value={'npm'}>NPM</MenuItem>
                    </Select>
                </FormControl>
                

                {pack.provider != 'hexhive' && <TextField 
                    value={pack.url}
                    onChange={(e) => setPack({...pack, url: e.target.value})}
                    label="URL"
                    size="small"
                    sx={{marginTop: '6px'}} />}

                <FormControlLabel 
                    control={<Checkbox
                            checked={pack.public}
                            onChange={(e) => setPack({...pack, public: e.target.checked})}
                            />} 
                    label="Public" />

                <TextField
                    value={pack.description}
                    onChange={(e) => setPack({...pack, description: e.target.value})}

                    multiline
                    label="Description"
                    minRows={4}
                     />
                    
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onClose}>
                    Cancel
                </Button>
                <Button 
                    onClick={onSubmit}
                    color="primary" variant="contained">
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    )
}


export const ElementModal = (props) => {

    const [ element, setElement ] = useState<{
        name: string
    }>({
        name: ''
    });

    useEffect(() => {
        setElement({
            ...props.selected
        })
    }, [props.selected])

    const onSubmit = () => {
        props.onSubmit?.(element)
    }

    return (
        <Dialog
            onClose={props.onClose}
            open={props.open}>
            <DialogTitle>Create Element</DialogTitle>
            <DialogContent>
                <TextField 
                    sx={{marginTop: '6px'}}
                    value={element.name}
                    onChange={(e) => setElement({...element, name: e.target.value})}
                    size="small" label="Name" />
                
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onClose}>
                    Cancel
                </Button>
                <Button onClick={onSubmit} color="primary" variant="contained">
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    )
}