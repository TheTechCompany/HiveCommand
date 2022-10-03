import { Box, Paper, IconButton, Typography, List, ListItem, TextField } from "@mui/material";
import { Add } from '@mui/icons-material'
import React, { useState } from "react";
import { useQuery, gql } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { ElementPackModal } from "../../components/modals/element-pack";
import { useMutation } from "@apollo/client";
import { useApolloClient } from "@apollo/client";

export const ElementList = (props) => {

    const navigate = useNavigate();

    const [ modalOpen, openModal ] = useState(false);
    
    const client = useApolloClient()
    
    const { data } = useQuery(gql`
        query Elements {
            commandInterfaceDevices {
                id
                name
            }

            installed:commandInterfaceDevicePacks(registered: true){
                id
                name
            }

            registryList:commandInterfaceDevicePacks{
                id
                name
            }
        }
    `)

    const [ createPack ] = useMutation(gql`
        mutation CreatePack($input: CommandHMIDevicePackInput) {
            createCommandInterfacePack(input: $input){
                name
            }
        }
    `)

    const refetch = () => {
        client.refetchQueries({include: ['Elements']})
    }

    const elements = data?.installed || []

    const [view, setView]  = useState<any>("list")

    const registryList = data?.registryList || []

    return (
        <Paper sx={{flex: 1, display: 'flex', flexDirection: 'column'}}>
            <ElementPackModal
                open={modalOpen}
                onClose={() => {
                    openModal(false)
                }}
                onSubmit={(pack) => {
                    console.log({pack})
                    createPack({
                        variables: {
                            input: {
                                name: pack.name,
                                url: pack.url,
                                provider: pack.provider,
                                description: pack.description,
                                public: pack.public
                            }
                        }
                    }).then(() => {
                        openModal(false)
                        refetch()
                    })
                }}
                />
            <Box sx={{padding: '3px', display: 'flex', justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center', bgcolor: 'secondary.main'}}>
                <Box sx={{
                    display: 'flex',
                    paddingLeft: '3px',
                }}>
                    <div 
                        onClick={() => setView('list')}
                        style={{
                            cursor: 'pointer',
                            borderRadius: '3px',
                            marginRight: '3px',
                            boxShadow: view == 'list' ? '0px 0px 2px 1px rgba(0,0,0,0.2)' : undefined,
                            padding: '3px', background: view == 'list' ? '#dfdfdf' : undefined}}>
                        <Typography color={view != "list" ? "primary.light" : undefined}>Elements</Typography>
                    </div>
                    <div 
                        onClick={() => setView('registry')}
                        style={{
                            cursor: 'pointer',
                            borderRadius: '3px',    
                            boxShadow: view == 'registry' ? '0px 0px 2px 1px rgba(0,0,0,0.2)' : undefined,
                            padding: '3px', background: view == 'registry' ? '#dfdfdf' : undefined}}>
                        <Typography color={view != "registry" ? "primary.light" : undefined}>Registry</Typography>
                    </div>
                </Box>
                <IconButton 
                    onClick={() => openModal(true)}
                    sx={{color: 'primary.light'}}>
                    <Add  />
                </IconButton>
            </Box>
            <Box sx={{flex: 1}}>
                {view == 'list' && (
                <List>
                    {elements.map((elem) => (
                        <ListItem button onClick={() => navigate(elem.id)}>
                            {elem.name}
                        </ListItem>
                    ))}
                </List>)}
                {view == 'registry' && (
                    <Box sx={{flex: 1, padding: '3px', paddingTop: '6px', display: 'flex', flexDirection: 'column'}}>
                        <TextField 
                            size="small"
                            label="Search" />

                        <List>
                            {registryList.map((pack) => (
                                <ListItem button sx={{display: 'flex', padding: '6px'}}>
                                    <Typography>{pack.name}</Typography>

                                </ListItem>
                            ))}
                        </List>
                    </Box>
                )}
            </Box>
        </Paper>
    )
}