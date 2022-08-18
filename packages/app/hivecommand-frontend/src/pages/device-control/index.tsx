import { AvatarList, IconNodeFactory } from '@hexhive/ui';
import { InfiniteCanvas } from '@hexhive/ui';
import React, { useState, useMemo, useEffect } from 'react';
import { HMINodeFactory } from '../../components/hmi-node/HMINodeFactory';
import { useQuery, gql, useApolloClient } from '@apollo/client';
import { matchPath, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';
// import program from 'shared/hexhive-types/src/models/program';
import * as HMINodes from '../../assets/hmi-elements'

import { DeviceHub as Services, Autorenew as Cycle, Analytics, Dashboard, Info, SettingsInputComposite as System, ChevronLeft, KeyboardArrowLeft } from '@mui/icons-material';
import Toolbar from './toolbar';
import { DeviceControlProvider } from './context';
import Controls from './views/control'
import { DeviceControlGraph } from './views/graph'
import { DeviceDevices } from '../device-devices';
import { DeviceSingle } from '../device-single';
import { useChangeDeviceMode, useChangeDeviceValue, useChangeMode, useChangeState, usePerformDeviceAction } from '@hive-command/api';
import { ControlVariable } from './views/variable';
import { Paper, Box, Button, Typography, IconButton, Popover, Divider, List, ListItem } from '@mui/material';
import { useSubscription } from '@apollo/client';
import { stringToColor } from '@hexhive/utils';

export interface DeviceControlProps {

}

export const DeviceControl: React.FC<DeviceControlProps> = (props) => {

    const client = useApolloClient();

    const { id } = useParams()
    const navigate = useNavigate()


    const toolbar_menu = [
        { id: 'controls', label: "Controls", icon: <Dashboard /> },
        { id: 'variables', label: "Variables", icon: <System />},
        { id: 'graphs', label: "Graphs", icon: <Analytics /> },
        { id: 'info', label: "Info", icon: <Info /> },
        { id: 'devices', label: "Devices", icon: <Services /> },
    ]

    const view = toolbar_menu.find((a) => {
        return matchPath(window.location.pathname, `${a.id}`) != null;
    })

    const {data: subscriptionData} = useSubscription(gql`
        subscription($id: ID!) {
            watchingDevice(device: $id) {
                id
                name
            }
        }
    `, {
        variables: {
            id
        },
        onSubscriptionData: (data) => {
            console.log("Received data", {data})
        }
    })

    const [anchorEl, setAnchorEl ] = useState<any>();

    console.log({subscriptionData})

    // useEffect(() => {
    //     if(subscriptionData?.watchingDevice) alert(`${subscriptionData?.watchingDevice} is watching now too`);
    // }, [subscriptionData])

   const { data: deviceInfo } = useQuery(gql`
        query DeviceInfo($id: ID) {
            commandDevices(where: {id: $id}){
                setpoints {
                    id
                    setpoint {
                        id
                        name
                        key {
                            id
                            key
                        }
                        device {
                            id
                            name
                        }
                    }
                    value
                }
            }
        }
    `, {
       variables: {
           id
       }
    })

    const refetch = () => {
        client.refetchQueries({include: ['DeviceInfo']})
    }

    const { data } = useQuery(gql`
            query Q ($id: ID){
     
            commandDevices(where: {id: $id}){
                name
                operatingMode
                operatingState

                online
                

                calibrations {
                    placeholder {
                        id
                        name
                    }

                    stateItem {
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
                                            type
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


    useEffect(() => {
        // fetch("http://localhost:7000/graphql", {
        //     "credentials": "include",
        //     "headers": {
        //         "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:103.0) Gecko/20100101 Firefox/103.0",
        //         "Accept": "*/*",
        //         "Accept-Language": "en-US,en;q=0.5",
        //         "Content-Type": "application/json",
        //         "Sec-Fetch-Dest": "empty",
        //         "Sec-Fetch-Mode": "cors",
        //         "Sec-Fetch-Site": "same-site",
        //         "Sec-GPC": "1",
        //         "Pragma": "no-cache",
        //         "Cache-Control": "no-cache"
        //     },
        //     "referrer": "http://localhost:8000/",
        //     "body": "{\"query\":\"subscription { watchingDevice(device: \\\"101\\\") }\"}",
        //     "method": "POST",
        //     "mode": "cors"
        // }).then((r) => {
        //     return r.body
        // }).then(async (r) => {

        //     const reader = r.getReader();
        //     let done, value;
        //     while(!done){
        //         ({value, done} = await reader.read());
                
        //         console.log( new TextDecoder().decode(value) );
        //     }
        //     // for await (const chunk of r.getReader()){

        //     // }
        // });
    
    }, [])

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


    const activeProgram = data?.commandDevices?.[0]?.activeProgram || {};


    const actions = activeProgram?.interface?.actions || [];

    const hmi = activeProgram?.interface?.nodes?.filter((a) => !a.children || a.children.length == 0)?.map((node) => {
        const setpoints = (node?.devicePlaceholder?.setpoints || [])?.map((setpoint) => {
            let s = deviceInfo?.commandDevices?.[0]?.setpoints?.find((a) => a.setpoint?.id == setpoint.id);
            console.log({setpoint, s, deviceInfo})
            return {
                ...setpoint,
                value: s?.value || setpoint.value
            };
        });

        return {
            ...node,
            devicePlaceholder: {
                ...node.devicePlaceholder,
                setpoints: setpoints
            }
        }
    }) || [];
    
    const groups = activeProgram?.interface?.nodes?.filter((a) => a.children && a.children.length > 0)?.map((node) => {
        const children = node.children?.map((children) => {
            const setpoints = (children?.devicePlaceholder?.setpoints || [])?.map((setpoint) => {
                let s = deviceInfo?.commandDevices?.[0]?.setpoints?.find((a) => a.setpoint?.id == setpoint.id);
                console.log({setpoint, s, deviceInfo})
                return {
                    ...setpoint,
                    value: s?.value || setpoint.value
                };
            });

            return {
                ...children,
                devicePlaceholder: {
                    ...children.devicePlaceholder,
                    setpoints
                }
            }
        })

        return {
            ...node,
            children
        }
    }) || [];

    const program = {
        ...activeProgram,
        interface: {
            ...activeProgram.interface,
            nodes: [...hmi, ...groups]
        }
    };



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
            refresh()
        })
    }

    const changeOperationState = (state: "on" | "off" | "standby") => {
        changeState(state).then(() => {
            refresh()
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
            watching: subscriptionData?.watchingDevice || [],
            // values,
            device: rootDevice,
            reporting,
            hmi,
            groups,
            changeDeviceMode,
            changeDeviceValue,
            performAction: performDeviceAction,
            refresh,
            refetch
        }}>
            <Paper
                sx={{flex: 1, margin: '6px', display: 'flex', flexDirection: 'column'}}>
                <Paper
                    elevation={6}
                    sx={{
                        borderRadius: 0,
                        bgcolor: 'secondary.main',
                        padding: '3px',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexDirection: 'row',
                        display: 'flex'
                    }}>
                    <Box sx={{display: 'flex', alignItems: 'center'}}>
                        <IconButton
                            onClick={() => navigate("/devices")}
                            sx={{color: 'navigation.main'}}>
                            <KeyboardArrowLeft />
                        </IconButton>

                       
                    </Box>
                    <Box sx={{display: 'flex', flex: 1, flexDirection:"row", justifyContent: 'center', alignItems:"center"}}>
                            <Box    
                                sx={{
                                    width: 7,
                                    height: 7,
                                    borderRadius: 7,
                                    marginRight: '8px',
                                    marginLeft: '8px',
                                    background: rootDevice?.online ? '#42e239' : '#db001b'
                                }} />
                            <Typography color="#fff">{rootDevice?.name} - {program?.name}</Typography>
                        </Box>
                        <Box
                            onMouseEnter={(evt) => {
                                setAnchorEl(evt.currentTarget)
                            }}
                            onMouseLeave={(evt) => {
                                setAnchorEl(null)
                            }}>
                            <AvatarList
                                users={subscriptionData?.watchingDevice?.map((x) => ({
                                    ...x,
                                    color: stringToColor(x.name)
                                })) || []} />
                         
                            <Popover
                                open={Boolean(anchorEl)}
                                anchorEl={anchorEl}
                                transformOrigin={{
                                    horizontal: 'center',
                                    vertical: 'top'
                                }}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'center'
                                }}
                               
                                 sx={{
                                    pointerEvents: 'none',
                                  }}
                                >
                                    <Box sx={{padding: '6px', display: 'flex', flexDirection: 'column'}}>
                                        <Typography>Who's watching</Typography>
                                        <Divider />
                                        <List disablePadding>
                                            {subscriptionData?.watchingDevice?.map((x) => (
                                                <ListItem sx={{marginBottom: '3px'}} dense>{x.name}</ListItem>
                                            ))}
                                        </List>
                                    </Box>
                            </Popover>
                        </Box>

                    <Toolbar
                        active={toolbar_menu.find((a) => matchPath(window.location.pathname, `${a?.id}`) != null)?.id}
                        onItemClick={(item) => {
                            navigate(`${item}`)
                        }}
                        items={toolbar_menu} />
                    <Box sx={{display: 'flex', flexDirection:"row"}}>
                        {view?.id == 'controls' && (<IconButton><Cycle /></IconButton>)}
                    </Box>
                </Paper>
                <Box
                    sx={{flex: 1, display: 'flex', maxHeight: 'calc(100% - 46px)', flexDirection: 'row'}}>
       
                    <Box sx={{flex: 1, display: 'flex'}}>
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
            </Paper>
        </DeviceControlProvider>
    )
}