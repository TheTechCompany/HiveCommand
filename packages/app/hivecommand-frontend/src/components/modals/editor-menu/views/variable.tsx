import React, { useContext } from 'react';
import { Autocomplete, Box, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material'
import { useMenuContext } from '../context';

export const VariableView = () => {

    const { item, setItem } = useMenuContext()

    const variableTypes = [
        {
            id: 'boolean',
            name: 'Boolean'
        },
        {
            id: 'number',
            name: 'Number',
        },
        {
            id: 'string',
            name: 'String'
        },
        {
            id: 'enum',
            name: 'Enum'
        }
    ]
    return (
        <Box sx={{ display: 'flex', flex: 1, flexDirection: "column" }}>
            <TextField 
                value={item.name}
                onChange={(e) => setItem({...item, name: e.target.value})}
                sx={{marginBottom: '12px'}} 
                fullWidth 
                size="small" 
                label="Name" />

            <Autocomplete
                // disablePortal
                options={variableTypes}
                // assignableDevices?.slice()?.sort((a, b) => `${a.type?.tagPrefix ? a.type?.tagPrefix : ''}${a.tag}`.localeCompare(`${b.type?.tagPrefix ? b.type?.tagPrefix : ''}${b.tag}`))}
                value={variableTypes?.find((a) => a.id === item.type) || {id: '', name: ''}}

                onChange={(event, newValue) => {
                    setItem({...item, type: typeof(newValue) === 'string' ? newValue : newValue.id})
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
                        label={"Data Type"}
                    />
                }
                // value={value || ''}
                // onChange={(e) => {
                //     updateState(label, e.target.value)
                // }}
                size="small"
            // label={label} />
            />

        </Box>
    )
}