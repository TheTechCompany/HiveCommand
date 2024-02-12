import { Box, TextField, Typography } from '@mui/material';
import React from 'react';
import { useMenuContext } from '../context';

export const AlarmView = () => {

    const {item, setItem} = useMenuContext();

    return (
        <Box sx={{flex: 1, display: 'flex', flexDirection: 'column'}}>
            <TextField 
                sx={{marginBottom: '12px'}}
                value={item.title}
                onChange={(e) => setItem?.({ ...item, title: e.target.value })}
                size="small"
                label="Title" />

            {/* <TextField 
                value={item.message}
                onChange={(e) => setItem?.({ ...item, message: e.target.value })}
                multiline
                size="small"
                minRows={2}
                label="Message" /> */}
        </Box>
    )
}