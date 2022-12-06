import { TreeItem, TreeView } from '@mui/lab';
import { Box, Button, Checkbox, Collapse, Divider, InputAdornment, Paper, TextField, Typography } from '@mui/material'
import React, { useContext, useEffect, useState } from 'react'
import { SetupContext } from '../context';
import { ChevronRight, ExpandMore } from '@mui/icons-material';
import axios from 'axios';

export interface OPCUAServerItem {
    id: string;
    name: string;
    children: OPCUAServerItem[]
}
export const LocalPersistenceStage = () => {

    const [ persistenceOption, setPersistenceOption ] = useState<string>('');
    const { state, setState, globalState } = useContext(SetupContext);

    const controlLayout = globalState?.controlLayout;

    const persistenceOptions = [
        {
            name: 'SQL Server',
            options: {
                host: 'string',
                username: 'string',
                password: 'Password'
            }
        },
        {
            name: "SQLite DB",
            options: {
                path: 'Path'
            }  
        }
    ]

    return (
        <Box sx={{flex: 1, marginTop: '24px', display: 'flex', flexDirection: 'column',  paddingLeft: '6px', paddingRight: '6px'}}>
            {persistenceOptions.map((persistence) => (
                <Paper sx={{padding: '6px', display: 'flex', flexDirection: 'column', marginBottom: '6px', bgcolor: 'secondary.light'}}>
                    <Box onClick={() => setPersistenceOption(persistence.name)} sx={{ alignItems: 'center', display: 'flex'}}>
                        <Checkbox checked={persistence.name == persistenceOption} />
                        <Typography>{persistence.name}</Typography>
                    </Box>
         

                    <Collapse in={persistence.name == persistenceOption}>
                        <Box sx={{display: 'flex', flexDirection: 'column'}}>
                            {Object.keys(persistence.options).map((key) => (
                                <TextField sx={{marginBottom: '6px'}} size="small" label={key} />
                            ))}
                        </Box>
                    </Collapse>
                </Paper>
            ))}

        </Box>
    )
}