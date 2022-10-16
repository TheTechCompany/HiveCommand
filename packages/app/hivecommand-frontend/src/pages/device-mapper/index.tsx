import { gql, useQuery } from "@apollo/client";
import { useMapPort } from "@hive-command/api";
import { ChevronLeft } from "@mui/icons-material";
import { Box, IconButton, Paper, Typography } from "@mui/material";
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DeviceMappingModal } from "../../components/modals/device-mapping";
import { OPCUATreeView } from "../../components/opcua-treeview";

export const DeviceMapper = () => {

    const { id } = useParams();

    const { data } = useQuery(gql`
        query GetDeviceLayout ($id: ID) {
            commandDevices(where: {id: $id}){
                name

                dataLayout

                deviceMapping {
                    id

                    device {
                        id
                    }

                    deviceState {
                        id
                    }

                    path
                }

                activeProgram {

                    devices {
                        id
                        tag

                        type {
                            tagPrefix

                            state {
                                id
                                key
                            }
                        }
                    }
                }

        
            }
        }
    `, {
        variables: {
            id
        }
    })


    console.log({data});

    const [ selectedElement, setSelectedElement ] = useState<any>(null);

    const devices = data?.commandDevices?.[0]?.activeProgram?.devices || [];

    const dataLayout = data?.commandDevices?.[0]?.dataLayout || [];

    const deviceMapping = data?.commandDevices?.[0]?.deviceMapping || [];

    const navigate = useNavigate();

    const connectDevice = useMapPort(id)

    return (
        <Paper sx={{flex: 1, display: 'flex', flexDirection: 'column'}}>

            <DeviceMappingModal 
                open={Boolean(selectedElement)}
                selected={selectedElement}
                dataLayout={dataLayout}
                onSubmit={(nodeId) => {
                    console.log({nodeId});
                    connectDevice(selectedElement.parent.id, selectedElement.id, nodeId).then(() => {
                        setSelectedElement(null)
                    })
                }}
                onClose={() => {
                    setSelectedElement(null)
                }} />
            <Box sx={{bgcolor: 'secondary.main', color: 'white', padding: '6px', display: 'flex', alignItems: 'center'}}>
                <IconButton onClick={() => navigate('../devices')} size="small" sx={{marginRight: '3px'}}>
                    <ChevronLeft fontSize="inherit" sx={{color: 'white'}} />
                </IconButton>
                <Typography>
                    Device Map : {data?.commandDevices?.[0]?.name}
                </Typography>
            </Box>
            <Box sx={{flex: 1}}>
                <OPCUATreeView 
                    onMap={(item) => {
                        console.log({item, devices});
                        let stateItems = devices.reduce((prev, curr) => [...prev, ...curr.type?.state?.map((x) => ({id: x.id, label: x.key, parent: {id: curr.id, label: `${curr?.type?.tagPrefix || ''}${curr?.tag}`}}))], [])
                        console.log({stateItems})
                        setSelectedElement(stateItems.find((a) => a.id == item))
                    }}
                    items={
                        devices.map((device) => ({
                            id: device.id,
                            label: `${device?.type?.tagPrefix || ''}${device.tag}`,
                            children: device?.type?.state?.map((stateItem) => ({
                                id: stateItem.id,
                                label: stateItem.key,
                                value: deviceMapping.find((a) => a.deviceState.id == stateItem.id && a.device.id == device.id)?.path
                            }))
                        }))
                    } />
            </Box>
        </Paper>
    )
}