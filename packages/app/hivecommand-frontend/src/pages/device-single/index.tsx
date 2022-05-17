import React, { useContext, useEffect, useState } from 'react';
import { Box, List, Text, Button, Select, Collapsible } from 'grommet';
//import { Map } from '@thetechcompany/live-ui'
import { Graph } from '../../components/ui/graph';

import MarkerIcon from 'leaflet/dist/images/marker-icon.png';
import { useQuery as useApollo, gql, useApolloClient } from '@apollo/client'
import { BusMap } from '../../components/bus-map/BusMap';
import { DeviceBusModal } from '../../components/modals/device-bus/DeviceBusModal';
import { DeviceBusConnectionModal } from '../../components/modals/device-bus-connections';
import { DeviceControlContext } from '../device-control/context';
import { useMapPort, useSetDevicePeripherals } from '@hive-command/api';
import { IconButton } from '@mui/material';
import { Add } from '@mui/icons-material';
export interface DeviceSingleProps {
    match?: any;
    history?: any;
}

export const DeviceSingle : React.FC<DeviceSingleProps> = (props) => {
    
    const { controlId } = useContext(DeviceControlContext)

    const client = useApolloClient()

    const [ selected, setSelected ] = useState<any>()
    const [ selectedPort, setSelectedPort ] = useState<{bus?: string, port?:string}>({})
    const [ selectedMap, setSelectedMap ] = useState<any[]>([])
    // const [ selectedBus, setSelectedBus ] = useState<{id?: string, name: string}>({})
    const [ modalOpen, openModal ] = useState<boolean>(false);
    const [busOpen, openBus ] = useState(false);

    const { data } = useApollo(gql`
        query Q ($id: ID) {
            commandDevices(where: {id: $id}){
                id
                name
                peripherals {
                    id
                    name
                    type

                    connectedDevices {
                        id
                        deviceId
                        vendorId
                        name
                        port
                    }

                    mappedDevices {
                        id
                        device {
                            id
                            name
                            type {
                                name
                            }
                        }
                        key {
                            key
                        }
                        value{
                            key
                        }
                    }
                    
                }

                activeProgram {
                    devices {
                        id
                        name
                        type {
                            id
                            name

                            state {
                                key
                                type
                            }
                        }

                    }
                }

            }
        }
    `, {
        variables: {
            id: controlId
        }
    })

    /*
mappedDevicesConnection {
                        edges{
                            port

                            node {
                                id

                                key {
                                    
                                    key
                                }

                                device {
                                    id
                                    name
                                }

                                value {
                                    id
                                    key
                                }
                            }
                        }
                    }

                    connectedDevicesConnection {
                        edges {
                            port
                            
                            node {
                                id
                                name

                                connections {
                                    key
                                    type
                                }
                            }
                        }
                    }
    */
    const setDevicePeripherals = useSetDevicePeripherals(controlId)
    const mapPort = useMapPort(controlId)

    const refetch = () => {
        client.refetchQueries({
            include: ["Q"]
        })
    }

    const device = data?.commandDevices?.[0] || {}
    // const programs = query.ProgramMany();

    const goToControls = () => {
        props.history.push(`${props.match.url}/controls`)
    }

    console.log({device})
    return (
        <Box 
            flex
            elevation="small"
            round="xsmall"
            overflow="hidden"
            background="neutral-1"
            style={{flex: 1, display: 'flex', flexDirection: 'column'}}>

            
            <DeviceBusConnectionModal
                connections={selected?.connections.map((connection) => ({
                    ...connection,
                    subindex: connection.key.match(/(.+?)-(.+)/)?.[2] || 0
                }))}
                selected={selectedMap.map((x) => ({...x, ...x?.node}))}
                devices={device?.activeProgram?.devices}
                onClose={() => {
                    openModal(false);
                }}
                onSubmit={(connections) => {
                    mapPort(
                        selectedPort.bus,
                        selectedPort.port,
                        connections
                    ).then(() => {
                        refetch()
                    })
                    console.log({connections})
                }}
                open={modalOpen} />
           

            <DeviceBusModal
                open={busOpen}
                onSubmit={(bus) => {
                    setDevicePeripherals([...(device.peripherals || []), bus])
                }}
                onClose={() => {
                    openBus(false)
                }}
                />
             <Box justify='end' direction='row'>
                    <IconButton onClick={() => openBus(true)}>
                        <Add />
                    </IconButton>
                </Box>
            <Box 
                style={{position: 'relative'}}
                direction="row"
                background="#dfdfdf"
                flex>
               
                <Box flex>
                    <BusMap
                        add
                        onPortSelect={(bus, port) => {
                            console.log(bus, port)

                            setSelectedPort({bus, port})

                            let connected = device?.peripherals?.find((a) => a.id == bus)?.connectedDevices?.find((a) => a.port == port);
                            
                            let mapped = device?.peripherals?.find((a) => a.id == bus)?.mappedDevices?.filter((a) => a.port == port);
                            
                            setSelectedMap(mapped || [])

                            // connected.peripheral = bus
                            // connected.node.peripheral = bus;
                            setSelected(connected);

                            console.log({connected, mapped, bus, port})
                            openModal(true)

                            console.log(connected.node.connections)
                        }}
                        onMapChanged={(bus, port, device) => {
                                // mapPort(
                                //     bus,
                                //     port,
                                //     device
                                // )
                                    
                                //     {
                                //     args: {
                                //         id: props.match.params.id,
                                //         peripheralId: bus,
                                //         port: port,
                                //         deviceId: device
                                //     }
                                // }).then(() => {
                                //     refetch()
                                // })
                            
    
                            console.log(bus, port, device)
                        }}
                        devices={device?.activeProgram?.devices}
                        buses={(device?.peripherals || []).map((x) => {
                            // console.log(x.connectedDevicesConnection)
                            return {
                                id: x.id,
                                name: x.name,
                                connectedDevices: x.connectedDevices.map((connection) => ({...connection, port: connection.port})),
                                mappedDevices: x.mappedDevices.map((dev, ix) => ({...dev, port: x.mappedDevices[ix].port})) || [],
                                ports: (x.type == "IO-LINK" ? 8 : (x.type == "BLESSED") ? x.connectedDevices : {inputs: 14, outputs: 14})
                            }
                        })}/>
                </Box>
               
{/* 
                <Box 
                    background="neutral-1"
                    round={{corner: 'top', size: 'small'}}
                    elevation="medium"
                    align="center"
                    justify="center"
                    flex>
                        <Text size="small">Select a Bus to configure...</Text>
                </Box> */}
            </Box>
        
                {/* <Box className="detail-col">
                    <Box>
                        <Select 
                            options={programs}
                            labelKey="name"
                            valueKey="_id" />
                      
                      <Text style={{marginTop: 8}}>Uptime: 3months 2days 24hrs</Text>
                    </Box>
                </Box> */}
               {/*<Map 
                    markerIcon={MarkerIcon}
                    center={[-36.87732912268097,174.85584289406773]}
                    markers={{
                        text: device?.name || '',
                        position: [-36.87732912268097,174.85584289406773]
                    }}
                    className="location-col" /> */}
            {/* <div className="bottom-row">
                <Graph
                    data={[{
                        recycled: 1,
                        time: 2
                    }, {
                        recycled: 2,
                        time: 1
                    }]}
                    xKey={"time"}
                    yKey={"recycled"}
                    className="graph-col" />

           
            </div> */}
        </Box>
    )
}