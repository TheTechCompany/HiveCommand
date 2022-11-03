import React from 'react';
import { Box, TextField } from '@mui/material';
import { useContext } from 'react';
import { SetupContext } from '../context';

export const ProvisionCodeStage = () => {
    const { state, setState } = useContext(SetupContext);

    return (
        <Box sx={{flex: 1, display: 'flex', alignItems: 'center', paddingLeft: '6px', paddingRight: '6px'}}>
           
            <TextField 
                value={state.provisionCode}
                onChange={(e) => setState({...state, provisionCode: e.target.value})}
                label="Provisioning code" 
                fullWidth 
                size="small" />

        </Box>
    )
}