import React, { useState } from "react";

import { 
    Autocomplete,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    TextField,
    Typography
} from '@mui/material';

export const DataScopeModal = (props) => {

    const pluginOptions = [
        {
            id: 'ethernet-ip',
            name: 'Ethernet/IP',
            module: '@hive-command/drivers-ethernet-ip',
            configuration: {
                host: 'String',
                slot: 'Number',
                rpi: 'Number'
            }
        },
        {
            id: 'opcua',
            name: 'OPCUA',
            module: '@hive-command/drivers-opcua',
            configuration: {
                host: 'String',
                port: 'Number'
            }
        }
    ]

    const [ item, setItem ] = useState<{
        name?: string,
        description?: string,
        plugin?: string,
        configuration?: any
    }>({

    })

    const renderConfiguration = () => {
        let conf = pluginOptions.find((a) => a.id === item.plugin)?.configuration || {}
        let conf_inputs = Object.keys(conf).map((confKey) => {
            switch(conf[confKey]){
                case 'String':
                    return (
                        <TextField 
                            fullWidth
                            size="small" 
                            label={confKey} 
                            value={item.configuration?.[confKey]}/>
                    );
                case 'Number':
                    return (
                        <TextField 
                            fullWidth
                            size="small" 
                            type="number" 
                            label={confKey} 
                            value={item.configuration?.[confKey]} />
                    );
                default:
                    return;
            }
        }).map((x) => <Box  sx={{marginBottom: '12px', display: 'flex'}}>{x}</Box>)

        return conf_inputs.length > 0 ? (
            <Box sx={{display: 'flex', flexDirection: 'column'}}>
                <Typography>Plugin configuration</Typography>
                <Divider sx={{margin: '12px'}}/>
                {conf_inputs}
            </Box>
        ) : null;
    }

    return (
        <Dialog fullWidth open={props.open}>
            <DialogTitle>Create data scope</DialogTitle>
            <DialogContent sx={{display: 'flex', flexDirection: 'column'}}>
                <TextField sx={{marginBottom: '12px', marginTop: '12px'}} size="small" label="Name" />
                <TextField sx={{marginBottom: '12px'}} size="small" label="Description" />

                <Autocomplete
                     sx={{marginBottom: '12px'}}
                    // disablePortal
                    options={pluginOptions}
                    // assignableDevices?.slice()?.sort((a, b) => `${a.type?.tagPrefix ? a.type?.tagPrefix : ''}${a.tag}`.localeCompare(`${b.type?.tagPrefix ? b.type?.tagPrefix : ''}${b.tag}`))}
                    value={pluginOptions?.find((a) => a.id === item.plugin) || {id: '', name: ''}}

                    onChange={(event, newValue) => {
                        setItem({...item, plugin: typeof(newValue) === 'string' ? newValue : newValue.id})
                        // updateState(label, newValue.id)
                        // if(!newValue){
                        //     updateState(label, null)
                        // }else{
                        //     setFunctionArgs(newValue);
                        //     setFunctionOpt(label)
                        // }
                    }}
                    getOptionLabel={(option) => typeof (option) == "string" ? option : `${option.name}`}
                    // isOptionEqualToValue={(option, value) => option.id == value.id}
                    renderInput={(params) =>
                        <TextField
                            {...params}
                            label={"Plugin"}
                        />
                    }
                    // value={value || ''}
                    // onChange={(e) => {
                    //     updateState(label, e.target.value)
                    // }}
                    size="small"
                // label={label} />
                />
                {renderConfiguration()}
            </DialogContent>
            <DialogActions>
                <Button>Cancel</Button>
                <Button variant="contained" color="primary">Save</Button>
            </DialogActions>
        </Dialog>
    )
}