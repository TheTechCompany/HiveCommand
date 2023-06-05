import { Box, Checkbox, Collapse, Divider, Paper, TextField, Typography } from '@mui/material'
import React, { useContext, useState } from 'react'
import { SetupContext } from '../context';

export interface OPCUAServerItem {
    id: string;
    name: string;
    children: OPCUAServerItem[]
}
export const LocalPersistenceStage = () => {

    const [ persistenceOption, setPersistenceOption ] = useState<{id: string, options?: any}>({
        id: 'json',
        options: {
            path: '$APPDIR/conf.json'
        }
    });

    const { state, setState, globalState } = useContext(SetupContext);


    const persistenceOptions = [
        {
            id: 'json',
            name: 'JSON File',
            options: {
                path: 'Path'
            }
        },
        {
            id: 'timescale-db',
            name: 'Timescale DB',
            options: {
                host: 'string',
                username: 'string',
                password: 'Password'
            }
        },
        // {
        //     id: 'sql-db',
        //     name: 'SQL Server',
        //     options: {
        //         host: 'string',
        //         username: 'string',
        //         password: 'Password'
        //     }
        // },
        // {
        //     id: 'sqlite-db',
        //     name: "SQLite DB",
        //     options: {
        //         path: 'Path'
        //     }  
        // }
    ]

    return (
        <Box sx={{flex: 1, marginTop: '24px', display: 'flex', flexDirection: 'column',  paddingLeft: '6px', paddingRight: '6px'}}>
            <Typography>Select a storage method</Typography>
            {persistenceOptions.map((persistence) => (
                <Paper sx={{padding: '6px', display: 'flex', flexDirection: 'column', marginBottom: '6px', bgcolor: 'secondary.light'}}>
                    <Box 
                        onClick={() => setPersistenceOption({id: persistence.id})} 
                        sx={{ alignItems: 'center', cursor: 'pointer', display: 'flex'}}>
                        <Checkbox checked={persistence.id == persistenceOption.id} />
                        <Typography>{persistence.name}</Typography>
                    </Box>
         

                    <Collapse in={persistence.id == persistenceOption.id}>
                        <Divider />

                        <Box sx={{display: 'flex', paddingLeft: '10%', paddingRight: '10%', marginTop: '12px', flexDirection: 'column'}}>
                            {Object.keys(persistence.options).map((key) => (
                                <TextField 
                                    value={persistenceOption?.options?.[key] || ''}
                                    onChange={(e) => {
                                        setPersistenceOption({
                                            ...persistenceOption,
                                            options: {
                                                ...persistenceOption?.options,
                                                [key]: e.target.value
                                            }
                                        })
                                    }}
                                    sx={{marginBottom: '6px'}} 
                                    size="small" 
                                    label={key} />
                            ))}
                        </Box>
                    </Collapse>
                </Paper>
            ))}

        </Box>
    )
}