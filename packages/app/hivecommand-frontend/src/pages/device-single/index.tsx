import { Logout as ExitToApp, Add } from 'grommet-icons';
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
import { mapPort } from '@hive-command/api';
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
    

    const { data } = useApollo(gql`
        query Q ($id: ID) {
            commandDevices(where: {id: $id}){
                id
                name
                peripherals {
                    id
                    name
                    type

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

    console.log(device)
    return (
        <Box 
            elevation="small"
            round="xsmall"
            overflow="hidden"
            background="neutral-2"
            style={{flex: 1, display: 'flex', flexDirection: 'column'}}>

            <DeviceBusConnectionModal
                connections={selected?.node?.connections.map((connection) => ({
                    ...connection,
                    subindex: connection.key.match(/(.+?)-(.+)/)?.[2] || 0
                }))}
                selected={selectedMap.map((x) => ({...x, ...x?.node}))}
                devices={device?.activeProgram?.devices}
                onClose={() => {
                    openModal(false);
                }}
                onSubmit={(connections) => {
                    mapPort( props.match.params.id,
                            selectedPort.bus,
                            selectedPort.port,
                            device,
                            connections
                        
                    ).then(() => {
                        refetch()
                    })
                    console.log(connections)
                }}
                open={modalOpen} />
           

            {/* <DeviceBusModal
                open={modalOpen}
                onClose={() => {
                    openModal(false)
                }}
                /> */}
            <Box 
                style={{position: 'relative'}}
                direction="row"
                background="#dfdfdf"
                flex>
                <Box flex>
                    <BusMap
                        add
                        onPortSelect={(bus, port) => {
                            setSelectedPort({bus, port})
                            let connected = device?.peripherals?.find((a) => a.id == bus)?.connectedDevicesConnection?.edges?.find((a) => a.port == port);
                            
                            let mapped = device?.peripherals?.find((a) => a.id == bus)?.mappedDevicesConnection?.edges?.filter((a) => a.port == port);
                            
                            setSelectedMap(mapped)

                            // connected.peripheral = bus
                            // connected.node.peripheral = bus;
                            setSelected(connected);
                            openModal(true)

                            console.log(connected.node.connections)
                        }}
                        onMapChanged={(bus, port, device) => {
                                // mapPort({
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
                            console.log(x.connectedDevicesConnection)
                            return {
                                id: x.id,
                                name: x.name,
                                connectedDevices: x.connectedDevicesConnection.edges.map((connection) => ({...connection.node, port: connection.port})),
                                mappedDevices: x.mappedDevices.map((dev, ix) => ({...dev, port: x.mappedDevicesConnection.edges[ix].port})),
                                ports: x.type == "IO-LINK" ? 8 : {inputs: 14, outputs: 14} 
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