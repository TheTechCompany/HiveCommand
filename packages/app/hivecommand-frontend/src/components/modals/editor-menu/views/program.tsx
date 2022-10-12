import { Box, TextField } from '@mui/material'
import React from 'react'
import { useMenuContext } from '../context'

export const ProgramView = () => {

    const {item, setItem} = useMenuContext();

    return (
        <Box sx={{flex: 1}}>
            <TextField 
                fullWidth
                size="small"
                value={item?.name || ''}
                onChange={(e) => {
                    setItem({...item, name: e.target.value})
                }}
                label="Program Name" />
        </Box>
    )
}