import { Autocomplete, Box, TextField } from '@mui/material';
import React from 'react';
import { useMenuContext } from '../context';


export const SchematicsView = () => {

    const {item, setItem} = useMenuContext();


    return (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <TextField
                value={item?.name}
                onChange={ (e) => setItem({...item, name: e.target.value }) }
                sx={{marginBottom: '12px'}}
                fullWidth
                size="small" 
                label="Page name" />

            <Autocomplete
        // value={item?.name}
        // onChange={ (e) => setItem({...item, name: e.target.value }) }
                fullWidth
                size="small"
                options={[]}
                renderInput={(params) => <TextField {...params} label="Page type" />} />
        </Box>
    )
}