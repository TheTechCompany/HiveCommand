import { Box, Select, TextField } from '@mui/material'
import React from 'react'
import { useMenuContext } from '../context';

export const DeviceView = () => {
    const {item, setItem} = useMenuContext();

    return (
        <Box sx={{flex: 1}}>
            <TextField 
                value={item?.name || ''}
                onChange={(e) => {
                    setItem({...item, name: e.target.value})
                }}
                fullWidth
                size="small"
                label="Device Tag Name" />
            <Select />

        </Box>
    )
}