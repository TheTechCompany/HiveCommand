import { FormControl, InputLabel, MenuItem } from '@mui/material';
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

    const {item, setItem} = useMenuContext();

    const { deviceTypes } = useContext(CommandEditorContext)

    const deviceType = deviceTypes?.find((a) => a.id == item?.type) || {tagPrefix: ''}

    return (
        <Box sx={{flex: 1}}>
            <TextField 
                value={item?.name || ''}
                onChange={(e) => {
                    setItem({...item, name: e.target.value})
                }}
                InputProps={{
                    startAdornment: <InputAdornment position="start">{deviceType?.tagPrefix}</InputAdornment>
                }}
                fullWidth
                size="small"
                label="Device Tag Name" />
            <FormControl
                sx={{marginTop: '12px'}} fullWidth size="small" >
                <InputLabel>Device Type</InputLabel>
                <Select 
                    value={item?.type}
                    onChange={(evt) => setItem({ ...item, type: evt.target.value })}
                    label="Device Type">
                    {deviceTypes.map((type) => (
                        <MenuItem value={type.id}>{type.name}</MenuItem>
                    ))}
                </Select>

            </FormControl>

        </Box>
    )
}