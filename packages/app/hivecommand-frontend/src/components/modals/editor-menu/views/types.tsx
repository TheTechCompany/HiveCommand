import React, { useContext } from 'react';
import { Autocomplete, Box, TextField } from '@mui/material'
import { CommandEditorContext } from '../../../../views/Editor/context';
import { useMenuContext } from '../context';
import { string } from 'mathjs';

export const TypeView = () => {

    const { item, setItem } = useMenuContext();

    console.log({item})
    // const deviceType = deviceTypes //?.find((a) => a.id == item?.type) || { tagPrefix: '' }

    return (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <TextField
                sx={{marginBottom: '12px'}}
                value={item.name}
                onChange={(e) => setItem({...item, name: e.target.value})}
                size="small"
                label="Name" />

           
        </Box>
    )
}