import { Box, TextField } from '@mui/material'
import React from 'react'
import { useMenuContext } from '../context';

export const HMIView = () => {

    const {item, setItem} = useMenuContext();

    return (
        <Box sx={{flex: 1}}>
            <TextField 
                fullWidth
                value={item?.name || ''}
                onChange={(e) => {
                    setItem({...item, name: e.target.value})
                }}
                size="small"
                label="HMI View Name" />
        </Box>
    )
}