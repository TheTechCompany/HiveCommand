import React, { useContext, useState } from 'react';
import { Box, IconButton, List, ListItem, Paper, Typography } from '@mui/material'
import { Add, MoreVert } from '@mui/icons-material';
import { ElementPackListModal } from '../../../../components/modals/element-pack-list';
import { gql, useQuery } from '@apollo/client';
import { useMutation } from '@apollo/client';
import { CommandEditorContext } from '../../context';
import { DataScopeModal } from '../../../../components/modals/data-scope';

export const Home = () => {

    const { refetch, program, plugins: {dataScope: dataScopePlugins} } = useContext(CommandEditorContext)

    const { data } = useQuery(gql`
        query Plugins {
            commandInterfaceDevicePacks(registered: true) {
                id
                name
            }
        }
    `)

    const [ updateProgramTemplatePacks ] = useMutation(gql`
        mutation M ($id: ID!, $templatePacks: [String]){
            updateCommandProgram(id: $id, input: {templatePacks: $templatePacks}) {
                id
            }
        }
    `)

    const [ createProgramDataScope ] = useMutation(gql`
        mutation M ($program: ID!, $input: CommandProgramDataScopeInput){
            createCommandProgramDataScope(program: $program, input: $input) {
                id
            }
        }
    `)

    const [ updateProgramDataScope ] = useMutation(gql`
        mutation M ($program: ID!, $id: ID!, $input: CommandProgramDataScopeInput){
            updateCommandProgramDataScope(program: $program, id: $id, input: $input) {
                id
            }
        }
    `)

    const [ deleteProgramDataScope ] = useMutation(gql`
    mutation M ($program: ID!, $id: ID!){
        deleteCommandProgramDataScope(program: $program, id: $id) {
            id
        }
    }
`)

    const elementPacks = data?.commandInterfaceDevicePacks || []

    const [ dataScopeModalOpen, openDataScopeModal ] = useState(false);
    const [ selectedDataScope, setSelectedDataScope ] = useState<any | null>(null);

    const [ packModalOpen, openPackModal ] = useState(false);

    return (
        <Box sx={{flex: 1, display: 'flex', padding: '12px'}}>
            <DataScopeModal
                open={dataScopeModalOpen}
                selected={selectedDataScope}
                plugins={dataScopePlugins}
                onClose={() => {
                    openDataScopeModal(false);
                    setSelectedDataScope(null);
                }}
                onDelete={() => {
                    deleteProgramDataScope({
                        variables: {
                            program: program.id,
                            id: selectedDataScope.id,
                        }
                    }).then(() => {
                        openDataScopeModal(false);
                        setSelectedDataScope(null);
                        refetch()
                    })
                }}
                onSubmit={(dataScope) => {
                    if(dataScope.id){
                        updateProgramDataScope({
                            variables: {
                                program: program.id,
                                id: dataScope.id,
                                input: {
                                    name: dataScope.name,
                                    description: dataScope.description,
                                    pluginId: dataScope.plugin,
                                    configuration: dataScope.configuration
                                }
                            }
                        }).then((() => {
                            refetch()
                            openDataScopeModal(false);
                            setSelectedDataScope(null);
                        }))
                    }else{
                        createProgramDataScope({
                            variables: {
                                program: program.id,
                                input: {
                                    name: dataScope.name,
                                    description: dataScope.description,
                                    pluginId: dataScope.plugin,
                                    configuration: dataScope.configuration
                                }
                            }
                        }).then(() => {
                            refetch()
                            openDataScopeModal( false )
                        })
                    }
                }}
                />

            <Box sx={{flex: 1, display: 'flex',}}>
                <Paper sx={{flex: 1, marginRight: '12px'}}>
                    <Box sx={{display: 'flex', padding: '3px', bgcolor: 'secondary.main', color: 'white',  alignItems: 'center', justifyContent: 'space-between'}}>
                        <Typography>Data scopes</Typography>
                        <IconButton 
                            onClick={() => {
                                openDataScopeModal(true);
                            }}
                            sx={{color: "white"}} size="small">
                            <Add fontSize="inherit"/>
                        </IconButton>
                    </Box>
                    <Box sx={{flex: 1}}>
                        <List>
                            {program.dataScopes?.map((dataScope) => (
                                <ListItem secondaryAction={(
                                    <IconButton onClick={() => {
                                        openDataScopeModal(true);
                                        setSelectedDataScope(dataScope)
                                    }}>
                                        <MoreVert />
                                    </IconButton>
                                )}>
                                    <Typography>{dataScope.name}</Typography>
                                    
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                </Paper>
            </Box>

            <ElementPackListModal 
                open={packModalOpen}
                onClose={() => {
                    openPackModal(false);
                }}
                packs={elementPacks}
                onSubmit={(packList) => {
                    console.log(packList)
                    updateProgramTemplatePacks({
                        variables: {
                            id: program.id,
                            templatePacks: packList
                        }
                    }).then(() => {
                        refetch()
                        openPackModal(false);
                    })

                }}
                />
            <Paper sx={{minWidth: '200px'}}>
                <Box sx={{display: 'flex', padding: '3px', bgcolor: 'secondary.main', color: 'white',  alignItems: 'center', justifyContent: 'space-between'}}>
                    <Typography>Element Packs</Typography>
                    <IconButton 
                        onClick={() => {
                            openPackModal(true);
                        }}
                        sx={{color: "white"}} size="small">
                        <Add fontSize="inherit"/>
                    </IconButton>
                </Box>
                <List>
                    {program?.templatePacks?.map((pack) => (
                        <ListItem>
                            {pack.name}
                        </ListItem>
                    ))}
                </List>
            </Paper>
        </Box>
    )
}