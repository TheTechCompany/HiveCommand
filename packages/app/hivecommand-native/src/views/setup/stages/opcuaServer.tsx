import { Box, InputAdornment, TextField } from '@mui/material'
import React, { useContext } from 'react'
import { SetupContext } from '../context';

export const OPCUAServerStage = () => {

    const { state, setState } = useContext(SetupContext);

    return (
        <Box sx={{flex: 1, display: 'flex', alignItems: 'center', paddingLeft: '6px', paddingRight: '6px'}}>
            <TextField 

                value={state.opcuaServer}
                onChange={(e) => setState({...state, opcuaServer: e.target.value})}
                InputProps={{
                    startAdornment: <InputAdornment position="start">opc.tcp://</InputAdornment>
                }}
                label="OPCUA Server Endpoint"  
                fullWidth 
                size="small"/>
        </Box>
    )
}