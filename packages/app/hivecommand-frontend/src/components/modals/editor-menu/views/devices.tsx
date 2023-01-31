import { Autocomplete, FormControl, InputLabel, MenuItem } from '@mui/material';
import { Box, Select, TextField } from '@mui/material'
import { CommandEditorContext } from '../../../../views/Editor/context';
import React, { useContext } from 'react'
import { useMenuContext } from '../context';
import { InputAdornment } from '@mui/material';

export const DeviceView = () => {

    // const deviceTypes = [
    //     {
    //         id: 'asdf',
    //         label: 'First option'
    //     }
    // ]

    const { item, setItem } = useMenuContext();

    const { deviceTypes } = useContext(CommandEditorContext)

    const deviceType = deviceTypes?.find((a) => a.id == item?.type) || { tagPrefix: '' }

    return (
        <Box sx={{ flex: 1 }}>
            <TextField
                value={item?.tag || ''}
                sx={{marginBottom: '12px'}}
                onChange={(e) => {
                    setItem({ ...item, tag: e.target.value })
                }}
                InputProps={{
                    startAdornment: <InputAdornment position="start">{deviceType?.tagPrefix}</InputAdornment>
                }}
                fullWidth
                size="small"
                label="Device Tag Name" />

            <Autocomplete
                // disablePortal
                options={deviceTypes}
                // assignableDevices?.slice()?.sort((a, b) => `${a.type?.tagPrefix ? a.type?.tagPrefix : ''}${a.tag}`.localeCompare(`${b.type?.tagPrefix ? b.type?.tagPrefix : ''}${b.tag}`))}
                value={deviceTypes?.find((a) => a.id == item.type)}

                onChange={(event, newValue) => {
                    setItem({...item, type: typeof(newValue) === 'string' ? newValue : newValue.id});
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
                        label={"Device Type"}
                    />
                }
                // value={value || ''}
                // onChange={(e) => {
                //     updateState(label, e.target.value)
                // }}
                size="small"
            // label={label} />
            />
            {/* <FormControl
                sx={{ marginTop: '12px' }} fullWidth size="small" >
                <InputLabel>Device Type</InputLabel>
                <Select
                    value={item?.type}
                    onChange={(evt) => setItem({ ...item, type: evt.target.value })}
                    label="Device Type">
                    {deviceTypes.map((type) => (
                        <MenuItem value={type.id}>{type.name}</MenuItem>
                    ))}
                </Select>

            </FormControl> */}

        </Box>
    )
}