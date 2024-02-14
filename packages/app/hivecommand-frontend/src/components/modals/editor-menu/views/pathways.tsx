import { Box, TextField, Typography, Autocomplete } from '@mui/material';
import React from 'react';
import { useMenuContext } from '../context';

export const PathwayView = () => {

    const { item, setItem } = useMenuContext();

    return (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <TextField
                sx={{ marginBottom: '12px' }}
                value={item.name}
                onChange={(e) => setItem?.({ ...item, name: e.target.value })}
                size="small"
                label="Name" />

            <Autocomplete
                sx={{ marginTop: '6px' }}
                options={["Local", "Remote"]}
                value={item.scope || null}
                onChange={(e, value) => {
                    setItem({ ...item, scope: value || undefined })
                }}
                renderInput={(params) => <TextField {...params} size="small" label="Scope" />} />


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