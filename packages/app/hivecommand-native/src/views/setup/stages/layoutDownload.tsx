import { Box, Typography, CircularProgress } from '@mui/material';
import React, { useContext, useEffect } from 'react';
import { SetupContext } from '../context';
import { CheckCircle } from '@mui/icons-material'
import axios from 'axios';

export const LayoutDownload = () => {

    const { state, setState, globalState, setGlobalState } = useContext(SetupContext);


    useEffect(() => {

        axios.get(`${state.discoveryServer}/control-layout?token=${state.authToken}`).then(async (res) => {
            // console.log("controlLayout", {res})

            await setGlobalState('controlLayout', res.data.results)
        })

        axios.get(`${state.discoveryServer}/network-layout?token=${state.authToken}`).then(async (res) => {
            // console.log("networkLayout", {res})
            await setGlobalState('networkLayout', res.data.results)
        })

    }, [])

    console.log({globalState});

    return (
        <Box sx={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6px'}}>

            <Box sx={{display: 'flex', flexDirection: 'column',}}>
                <Box sx={{display: 'flex', alignItems: 'center'}}>
                    <Box sx={{marginRight: '6px'}}>
                        {(globalState.controlLayout == undefined || globalState.controlLayout == null) ? <CircularProgress size={18} /> : <CheckCircle />}
                    </Box>
                    <Typography>HMI Layout</Typography>

                </Box>
                <Box sx={{display: 'flex', alignItems: 'center'}}>
                    <Box sx={{marginRight: '6px'}}>
                        {(globalState.networkLayout == undefined || globalState.networkLayout == null) ? <CircularProgress  size={18} /> : <CheckCircle />}
                    </Box>
                    <Typography>Network layout</Typography>
                </Box>
            </Box>
            {/* <Typography>Download layouts</Typography> */}
        </Box>
    )
}