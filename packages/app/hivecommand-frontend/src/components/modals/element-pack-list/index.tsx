import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, InputLabel, List, ListItem, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';

export const ElementPackListModal = (props) => {

    // const [ selected, setSelected ] = useState()
    const [ searchText, setSearchText ] = useState('');

    const [ packList, setPackList ] = useState<any[]>([]);

    const packs = props.packs || [];

    useEffect(( )=> {
        setPackList(props.selected ? props.selected : [])
    }, [props.selected])

    const onSubmit = () => {
        props.onSubmit?.(packList)
    }

    const filterPack = (pack) => {
        return searchText.length == 0 || pack.name.toLowerCase().includes(searchText.toLowerCase());
    }

    console.log({packList})

    return (
        <Dialog
            maxWidth={'sm'}
            fullWidth
            onClose={props.onClose}
            open={props.open}>
            <DialogTitle>Select Element Pack</DialogTitle>
            <DialogContent sx={{display: 'flex', padding: '6px', flexDirection: 'column'}}>
                <TextField 
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    sx={{marginTop: '6px'}}
                    size="small"
                    label="Name" />

                <List>
                    {packs.filter(filterPack).map((pack) => (
                        <ListItem button onClick={() => {
                            let ix = packList?.indexOf(pack.id);
                            let list = packList.slice();

                            if(ix > -1) {
                                list.splice(ix, 1)
                            }else{
                                list.push(pack.id)
                            }
                            setPackList(list)
                        }}>
                            <Checkbox checked={packList?.indexOf(pack.id) > -1} />
                            {pack.name}
                        </ListItem>
                    ))}
                </List>
                
                    
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