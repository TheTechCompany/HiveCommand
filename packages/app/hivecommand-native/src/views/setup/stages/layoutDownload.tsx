import { Box, Typography, CircularProgress } from '@mui/material';
import React, { useContext, useEffect } from 'react';
import { SetupContext } from '../context';
import axios from 'axios';

export const LayoutDownload = () => {

    const { state, setState } = useContext(SetupContext);


    useEffect(() => {

        axios.get(`${state.discoveryServer}/control-layout?token=${state.provisionResult}`).then((res) => {
            console.log("controlLayout", {res})

            setState((state: any) => ({
                ...state,
                controlLayout: res.data.results
            }))
        })

        axios.get(`${state.discoveryServer}/network-layout?token=${state.provisionResult}`).then((res) => {
            console.log("networkLayout", {res})
            setState((state: any) => ({
                ...state,
                networkLayout: res.data.results
            }))
        })

    }, [])
    
    return (
        <Box sx={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6px'}}>

            <Box sx={{display: 'flex', flexDirection: 'column',}}>
                <Box sx={{display: 'flex', alignItems: 'center'}}>
                    {(state.controlLayout == undefined || state.controlLayout == null) ? <CircularProgress sx={{marginRight: '6px'}} size={18} /> : "Done"}

                    <Typography>HMI Layout</Typography>
                </Box>
                <Box sx={{display: 'flex', alignItems: 'center'}}>
                    {(state.networkLayout == undefined || state.networklayout == null) ? <CircularProgress sx={{marginRight: '6px'}} size={18} /> : "Done"}
                    <Typography>Network layout</Typography>
                </Box>
            </Box>
            {/* <Typography>Download layouts</Typography> */}
        </Box>
    )
}