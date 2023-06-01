import { Box, TextField } from "@mui/material";
import React, { useContext } from "react";
import { SetupContext } from "../context";

export const DiscoveryServerStage = () => {

    const { state, setState } = useContext(SetupContext);

    return (
        <Box sx={{flex: 1, display: 'flex', paddingLeft: '6px', paddingRight: '6px', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
            <TextField 
                value={state.discoveryServer || ''}
                onChange={(e) => setState('discoveryServer', e.target.value)}
                size="small" 
                fullWidth 
                label="Discovery Server" 
                />

                
            <TextField 
                sx={{marginTop: '12px'}}
                value={state.provisionCode || ''}
                onChange={(e) => setState('provisionCode', e.target.value)}
                label="Provisioning code" 
                fullWidth 
                size="small" />

                
        </Box>
    )
}