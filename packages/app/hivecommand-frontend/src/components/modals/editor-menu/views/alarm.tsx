import { Box, TextField, Typography } from '@mui/material';
import React from 'react';
import { useMenuContext } from '../context';

export const AlarmView = () => {

    const {item, setItem} = useMenuContext();

    return (
        <Box sx={{flex: 1, display: 'flex', flexDirection: 'column'}}>
            <TextField 
                sx={{marginBottom: '12px'}}
                value={item.name}
                onChange={(e) => setItem?.({ ...item, name: e.target.value })}
                size="small"
                label="Name" />

            <TextField 
                value={item.description}
                onChange={(e) => setItem?.({ ...item, description: e.target.value })}
                multiline
                size="small"
                minRows={2}
                label="Description" />
        </Box>
    )
}