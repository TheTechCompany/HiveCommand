import { Add, Edit, MoreVert, Pending, SignalWifi4Bar, SignalWifiConnectedNoInternet4 } from '@mui/icons-material'
import { Typography } from '@mui/material'
import { List } from '@mui/material'
import { Paper } from '@mui/material'
import { IconButton } from '@mui/material'
import { ListItem } from '@mui/material'
import { Divider } from '@mui/material'
import { Box } from '@mui/material'
import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { ScreenProvisionModal } from '../../components/modals/screen-provision'
import { gql, useQuery } from '@apollo/client'
import { ListItemButton } from '@mui/material'
import { ListItemSecondaryAction } from '@mui/material'

export const DeviceSettings = () => {

    const [ provision, openProvisioner ] = useState(false);

    const [ selected, setSelected ] = useState<any>(null)

    const { id } = useParams();

    const { data } = useQuery(gql`
        query GetDeviceScreens ($device: ID) {
            commandDevices(where: {id: $device}){
                screens {
                    id
                    name
                    provisioned
                    provisionCode

                    createdAt
                }
            }
        }
    `)

    const screens = data?.commandDevices?.[0]?.screens || [];

    return (
        <Paper sx={{flex: 1}}>

            <ScreenProvisionModal 
                device={id}
                open={provision}
                selected={selected}
                onClose={() => {
                    openProvisioner(false);
                    setSelected(null)
                }} />
            <Box sx={{padding: '6px', bgcolor: 'secondary.main'}}>
                <Typography sx={{color: 'navigation.main'}}>Name</Typography>
            </Box>

            <Divider />

            <Box sx={{padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                <Typography>Screens</Typography>
                <IconButton onClick={() => openProvisioner(true)} size="small">
                    <Add fontSize="inherit"/>
                </IconButton>
            </Box>
            <Divider />
            <List>
                {screens.map((screen) => (
                    <ListItem>
                            {screen.provisioned ? <SignalWifi4Bar /> : <Pending />}
                            {screen.name}
                            <ListItemSecondaryAction>
                                <IconButton onClick={() => {
                                    setSelected(screen)
                                    openProvisioner(true)
                                }}>
                                    <MoreVert />
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                ))}
            </List>
{/* 
            <Divider />
            <Box sx={{padding: '6px'}}>
                <Typography>OPCUA Mapping</Typography>
            </Box>
            <Divider /> */}
        </Paper>
    )
}