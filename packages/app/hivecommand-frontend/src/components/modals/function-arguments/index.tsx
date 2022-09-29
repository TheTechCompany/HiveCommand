import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';

export const FunctionArgumentsModal = (props: {
    open: boolean,
    onClose?: () => void,
    onSubmit?: (args: any) => void;
    interfaces?: any[];
    function?: any;
}) => {

    const [ args, setArgs ] = useState([]);

    useEffect(() => {
        setArgs(props.function?.args || [])
    }, [props.function])

    const submit = () => {

        const fnArgs = args.filter((a) => a.value).reduce((prev, curr) => ({...prev, [curr.key]: curr.value}), {})

        console.log({fnArgs})

        props.onSubmit?.(fnArgs)
    }

    const renderArgs = () => {
        return args?.map((arg) => {

            const value = arg.value || '';

            switch(arg.type){
                case 'View':
                    return (
                        <FormControl 
                            size='small'
                            fullWidth>
                            <InputLabel>View</InputLabel>
                            <Select
                                value={value}
                                onChange={(evt: any) => {
                                    let newArgs = args.slice();

                                    let ix = newArgs.map((x) => x.key).indexOf(arg.key)

                                    newArgs[ix].value = evt.target.value;

                                    setArgs(newArgs)
                                }}
                                label="View"
                                fullWidth>
                                {props.interfaces?.map((intf: any) => (
                                    <MenuItem value={intf?.id}>
                                        {intf?.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )
            }

            // return (
            //     <TextField 
            //         fullWidth
            //         size="small" 
            //         label={arg.key} />
            // )
        })
    }

    return (
        <Dialog
            fullWidth
            open={props.open}
            onClose={props.onClose}
            >
            <DialogTitle>Function arguments</DialogTitle>
            <DialogContent>
                <Typography>{props.function?.label} : Settings</Typography>
                <Box sx={{flex: 1, marginTop: '6px', display: 'flex', flexDirection: 'column'}}>
                    {renderArgs()}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onClose}>Cancel</Button>
                <Button onClick={submit} variant="contained">Save</Button>
            </DialogActions>
        </Dialog>
    )
}