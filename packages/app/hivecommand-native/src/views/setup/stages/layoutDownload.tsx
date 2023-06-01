import { Box, Typography, CircularProgress } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import { SetupContext } from '../context';
import { CheckCircle } from '@mui/icons-material'
import axios from 'axios';

export const LayoutDownload = () => {

    const { state, setState, globalState, setGlobalState } = useContext(SetupContext);

    const [ logs, setLogs ] = useState<{id: string, loading: boolean, text: string}[]>([]);

    useEffect(() => {
        
        axios.get(`${state.discoveryServer}/control-layout?token=${state.authToken}`).then(async (res) => {
            // console.log("controlLayout", {res})
            await setGlobalState?.((state) => ({...state, ...res.data.results}))
            setLogs((logs) => {
                let l = logs.slice();
                let ix = l.findIndex((a) => a.id == 'hmi-download');

                l[ix].loading = false;
                return l;
            })
        })

        axios.get(`${state.discoveryServer}/network-layout?token=${state.authToken}`).then(async (res) => {
            // console.log("networkLayout", {res})
            await setGlobalState?.((state) => ({...state, ...res.data.results}))

        
            setLogs((logs) => {
                let l = logs.slice();
                let ix = l.findIndex((a) => a.id == 'network-download');

                l[ix].loading = false;

                l.push({
                    id: 'driver-download',
                    loading: true,
                    text: 'Drivers'
                })
                return l;
            })
            console.log({globalState})

            axios.post(`http://localhost:8484/setup/drivers`, { 
                drivers: [...new Set(globalState?.dataScopes?.map((x) => x.plugin.module) )].map((x) => ({pkg: x}) ) || [{pkg: '@hive-command/ethernet-ip'}] 
            }).then(() => {
                setLogs((logs) => {
                    let l = logs.slice();
                    let ix = l.findIndex((a) => a.id == 'driver-download');
    
                    l[ix].loading = false;
    
                  
                    return l;
                })
            })
        })

        setLogs([
            {
                id: 'hmi-download',
                loading: true,
                text: 'HMI Layout'
            },
            {
                id: 'network-download',
                loading: true,
                text: 'Network Layout'
            }
        ])

    }, [])

    console.log({globalState});




    return (
        <Box sx={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6px'}}>
            <Box sx={{display: 'flex', flexDirection: 'column'}}>
                {logs.map((log) => (
                    <Box sx={{display: 'flex', alignItems: 'center'}}>
                        <Box sx={{marginRight: '6px'}}>
                            {log.loading ? <CircularProgress size={18} /> : <CheckCircle />}
                        </Box>
                        <Typography>{log.text}</Typography>
                    </Box>
                ))}
            </Box>
            
            {/* <Typography>Download layouts</Typography> */}
        </Box>
    )
}