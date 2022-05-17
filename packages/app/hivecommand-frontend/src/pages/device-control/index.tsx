import { IconNodeFactory } from '@hexhive/ui';
import { Box, Button, CheckBox, Text, TextInput } from 'grommet';
import { InfiniteCanvas } from '@hexhive/ui';
import React, { useState, useMemo, useEffect } from 'react';
import { HMINodeFactory } from '../../components/hmi-node/HMINodeFactory';
import { useQuery, gql, useApolloClient } from '@apollo/client';
import { matchPath, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';
// import program from 'shared/hexhive-types/src/models/program';
import * as HMINodes from '../../assets/hmi-elements'

import { DeviceHub as Services, Autorenew as Cycle, Analytics, Dashboard, Info, SettingsInputComposite as System } from '@mui/icons-material';
import Toolbar from './toolbar';
import { DeviceControlProvider } from './context';
import Controls from './views/control'
import { DeviceControlGraph } from './views/graph'
import { DeviceDevices } from '../device-devices';
import { DeviceSingle } from '../device-single';
import { useChangeDeviceMode, useChangeDeviceValue, useChangeMode, useChangeState, usePerformDeviceAction } from '@hive-command/api';
import { ControlVariable } from './views/variable';

export interface DeviceControlProps {

}

export const DeviceControl: React.FC<DeviceControlProps> = (props) => {

    const client = useApolloClient();

    const { id } = useParams()
    const navigate = useNavigate()


    const toolbar_menu = [
        { id: 'controls', icon: <Dashboard /> },
        { id: 'variables', icon: <System />},
        { id: 'graphs', icon: <Analytics /> },
        { id: 'info', icon: <Info /> },
        { id: 'devices', icon: <Services /> },
    ]

    const view = toolbar_menu.find((a) => {
        return matchPath(window.location.pathname, `${a.id}`) != null;
    })

   

    const { data } = useQuery(gql`
            query Q ($id: ID){
     
            commandDevices(where: {id: $id}){
                name
                operatingMode
                operatingState

                online
                calibrations {
                    device {
                        id
                        name
                    }

                    deviceKey {
                        key
                    }

                    min
                    max
                }

          

                peripherals {
                    id
                    name
                    type

                    
                }
               
                activeProgram {
                    id
                    name
                    
                    interface{
                        id
                        name

                        actions {
                            id
                            name
                            flow {
                                id
                                name
                            }
                        }

                        edges {
                            from {
                                id
                            }
                            fromHandle
                            to {
                               id
                            }
                            toHandle
                            points {
                                x
                                y
                            }

                        }
                        
                        nodes{
       
                                id
                                type {
                                    name
                                    
                                    width
                                    height
    
                                    ports {
                                        x
                                        y
                                        rotation
                                        key
                                    }
                                }   
                                x
                                y
                                rotation
                                scaleX
                                scaleY
    
                                devicePlaceholder {
                                    id
                                    name
                                    units {
                                        inputUnit
                                        displayUnit
                                        state {
                                            id
                                            key
                                        }
                                    }

                                    type {
                                        actions {
                                            key
                                        }
    
                                        state {
                                            units
                                            inputUnits
                                            key
                                            writable
                                        }
                                    }


                                    setpoints {
                                        id
                                        name
                                        key {
                                            id
                                            key
                                        }
                                        value
                                        type
                                    }
    
                                }
                            
                            children {
                                id
                                type {
                                    name
                                    width
                                    height
                                }
                                scaleX
                                scaleY
                                rotation
                                x
                                y

                                devicePlaceholder {
                                    id
                                    name
                                    units {
                                        inputUnit
                                        displayUnit
                                        state {
                                            id
                                            key
                                        }
                                    }

                                    type {
                                        actions {
                                            key
                                        }
    
                                        state {
                                            units
                                            inputUnits
                                            key
                                            writable
                                        }
                                    }


                                    setpoints {
                                        id
                                        name
                                        key {
                                            id
                                            key
                                        }
                                        value
                                        type
                                    }
    
                                }
                            }

                            ports {
                                id
                                x
                                y
                                length
                                rotation
                            }
                            
                        }
                            
                    }

                    variables {
                        id
                        name
                        type
                    }

                    devices {
                        id
                        name
                        units {
                            inputUnit
                            displayUnit
                            state {
                                id
                                key
                            }
                        }
                        type {
                            state {
                                id
                                inputUnits
                                units
                                key
                                type
                                id
                            }
                        }
                    }
                }

            }
        }
    `, {
        variables: {
            id: id,
        }
    })

    const changeMode = useChangeMode(id)
    const changeState = useChangeState(id)

    const changeDeviceMode = useChangeDeviceMode(id)
    const changeDeviceValue = useChangeDeviceValue(id)
    const performDeviceAction = usePerformDeviceAction(id)

    // const [performAction, performInfo] = useMutation((mutation, args: {
    //     deviceId: string,
    //     deviceName: string,
    //     action: string
    // }) => {

    //     // console.log({args})
    //     const item = mutation.performDeviceAction({ deviceId: args.deviceId, deviceName: args.deviceName, action: args.action })

    //     return {
    //         item: {
    //             ...item
    //         }
    //     }
    // })

    // const [changeDeviceMode, changeDeviceModeInfo] = useMutation((mutation, args: {
    //     deviceId: string,
    //     deviceName: string,
    //     mode: string
    // }) => {
    //     const item = mutation.changeDeviceMode({ deviceId: args.deviceId, deviceName: args.deviceName, mode: args.mode })

    //     return {
    //         item: {
    //             ...item
    //         }
    //     }
    // })


    // const [changeDeviceValue, changeDeviceInfo] = useMutation((mutation, args: {
    //     deviceName: string,
    //     key: string,
    //     value: any
    // }) => {

    //     const result = mutation.changeDeviceValue({
    //         deviceId: id,
    //         deviceName: args.deviceName,
    //         key: args.key,
    //         value: `${args.value}`
    //     })

    //     return {
    //         item: {
    //             ...result
    //         }
    //     }
    //     // mutation.
    // })

    //Translates id to bus-port value
    const rootDevice = data?.commandDevices?.[0];

    const reporting = rootDevice?.reports || [];

    const peripherals = data?.commandDevices?.[0]?.peripherals || []


    // const waitingForActions = values?.filter((a) => a.deviceId == 'PlantActions')?.map((action) => ({[action.valueKey]: action.value == 'true'})).reduce((prev, curr) => ({...prev, ...curr}), {}) // deviceValueData?.commandDevices?.[0]?.waitingForActions || [];

    const refetch = () => {
        client.refetchQueries({ include: ['Q'] })
    }

    const program = data?.commandDevices?.[0]?.activeProgram || {};

    const actions = program?.interface?.actions || [];

    const hmi = program?.interface?.nodes?.filter((a) => !a.children || a.children.length == 0) || [];
    const groups = program?.interface?.nodes?.filter((a) => a.children && a.children.length > 0) || [];


    // const getDeviceValue = (name?: string, units?: { key: string, units?: string }[]) => {
    //     //Find map between P&ID tag and bus-port

    //     if (!name) return;


    //     let v = values.filter((a) => a?.deviceId == name);
    //     let state = program?.devices?.find((a) => a.name == name).type?.state;

    //     return v.reduce((prev, curr) => {
    //         let unit = units?.find((a) => a.key == curr.valueKey);
    //         let stateItem = state.find((a) => a.key == curr.valueKey);
    //         let value = curr.value;

    //         if (!stateItem) return prev;

    //         if (stateItem?.type == "IntegerT" || stateItem?.type == "UIntegerT") {
    //             value = parseFloat(value).toFixed(2)
    //         }
    //         return {
    //             ...prev,
    //             [curr.valueKey]: value //`${value} ${unit && unit.units ? unit.units : ''}`
    //         }
    //     }, {})

    // }
   

        const refresh = () => {
            return client.refetchQueries({ include: ['Q'] })
        }

    const changeOperationMode = (mode: string) => {
        changeMode(mode).then(() => {
            refetch()
        })
    }

    const changeOperationState = (state: "on" | "off" | "standby") => {
        changeState(state).then(() => {
            refetch()
        })
    }

    // console.log({values, state: values?.find((a) => a.deviceId == "Plant" && a.valueKey == "Running")})

    return (
        <DeviceControlProvider value={{
            actions,
            // waitingForActions,
            changeOperationMode,
            changeOperationState,
            // operatingMode: rootDevice?.operatingMode,
            // operatingState: rootDevice?.operatingState,
            // operatingMode: values?.find((a) => a.deviceId == "Plant" && a.valueKey == "Mode")?.value.toLowerCase(),
            // operatingState: values?.find((a) => a.deviceId == "Plant" && a.valueKey == "Running")?.value == 'true' ? "on" : "off",
            controlId: id,
            program,
            // values,
            device: rootDevice,
            reporting,
            hmi,
            groups,
            changeDeviceMode,
            changeDeviceValue,
            performAction: performDeviceAction,
            refresh
        }}>
            <Box
                round="xsmall"
                overflow="hidden"
                flex>
                <Box
                    pad="xsmall"
                    align="center"
                    justify="between"
                    background="accent-2"
                    direction="row">
                    <Box direction="row" align="center">
                        <Box
                            margin={{ right: 'small' }}
                            width="7px"
                            height="7px"
                            round="small"
                            background={rootDevice?.online ? 'lime' : 'red'} />
                        <Text>{rootDevice?.name} - {program?.name}</Text>
                    </Box>
                    <Box direction="row">
                        {view?.id == 'controls' && (<Button
                            plain
                            hoverIndicator
                            style={{ padding: 6, borderRadius: 3 }}
                            icon={<Cycle />} />)}
                    </Box>
                </Box>
                <Box
                    flex
                    direction="row">
                    <Toolbar
                        active={toolbar_menu.find((a) => matchPath(window.location.pathname, `${a?.id}`) != null)?.id}
                        onItemClick={(item) => {
                            navigate(`${item.id}`)
                        }}
                        items={toolbar_menu} />
                    <Box flex>
                        <Routes>
                            <Route path={`variables`} element={<ControlVariable />} />
                            <Route path={`info`}  element={<DeviceSingle/>} />
                            <Route path={`controls`} element={<Controls/>} />
                            <Route path={`graphs`} element={<DeviceControlGraph/>} />
                            <Route path={`devices`} element={<DeviceDevices/>} />
                        </Routes>
                    </Box>

                    {/* <InfiniteCanvas 
                editable={false}
                factories={[
                    new IconNodeFactory(),
                    new HMINodeFactory()
                ]}
                onSelect={(key, id) => {
                    setSelected({key, id})
                }}
                nodes={nodes}
                paths={[]}
                   /> */}
                    {/* <Box 
                pad="xsmall"
                width="small"
                background="neutral-1">
                {renderActions()}
            </Box> */}
                </Box>
            </Box>
        </DeviceControlProvider>
    )
}