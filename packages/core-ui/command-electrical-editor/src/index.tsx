import React, { useEffect, useState } from 'react';
import { Box, Divider, List, ListItem, Paper, TextField } from '@mui/material';
import { Canvas } from './canvas';
import { useRemoteComponents } from '@hive-command/remote-components'

export const ECadEditor = () => {

    const [ items, setItems ] = useState<any[]>(['MCB', 'Motor', 'Fuse', 'Isolator', 'Box']);

    const { getPack } = useRemoteComponents()

    useEffect(() => {
        getPack('github-01', 'https://raw.githubusercontent.com/TheTechCompany/hive-command-electrical-symbols/main/dist/components/', 'index.js').then((pack) => {
            setItems((pack || []).map(x => x.name))
            console.log({pack})
        })

    }, [])

    return (
        <Paper sx={{flex: 1, display: 'flex'}}>
            <Paper sx={{minWidth: '200px', padding: '6px'}}>
               
            </Paper>
            <Canvas />
            <Paper sx={{minWidth: '200px', padding: '6px'}}>
                <TextField fullWidth size="small" label="Search" />
                <Divider sx={{margin: '6px'}} />
                <List>
                    {items.map((item) => (
                        <ListItem>{item}</ListItem>
                    ))}
                </List>
            </Paper>
        </Paper>
    )
}