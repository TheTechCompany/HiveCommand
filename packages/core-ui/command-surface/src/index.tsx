import { AvatarList } from '@hexhive/ui';
import React, { useState, useMemo, useEffect } from 'react';
// import { useQuery, gql, useApolloClient } from '@apollo/client';

import { Route, Routes, matchPath, useNavigate } from 'react-router-dom'
// import { matchPath, Navigate, Outlet, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'

import { LocalizationProvider } from '@mui/x-date-pickers' 
import { DeviceHub as Services, Autorenew as Cycle, Analytics, Dashboard, Info, SettingsInputComposite as System, ChevronLeft, KeyboardArrowLeft, Menu, Home, KeyboardArrowRight, AccessAlarm, Timelapse, Engineering } from '@mui/icons-material';
import Toolbar from './toolbar';
import { DeviceControlProvider } from './context';
import { DeviceControlGraph } from './views/graph'

import { useChangeDeviceMode, useChangeDeviceValue, useChangeMode, useChangeState, useCreateDeviceMaintenanceWindow, useCreateReportPage, usePerformDeviceAction } from '@hive-command/api';

import { Paper, Box, Button, Typography, IconButton, Popover, Divider, List, ListItem } from '@mui/material';
// import { useSubscription } from '@apollo/client';
// import { stringToColor } from '@hexhive/utils';
import { TreeMenu, TreeMenuItem } from './components/tree-menu';
import { MaintenanceWindow } from './components/modals/maintenance';

import { DeviceReportModal } from './components/modals/device-report';
import Control from './views/control';
import { AlarmList } from './views/alarms';
import { HomeView } from './views/home';
import { RemoteComponentCache } from './hooks/remote-components';

export * from './hooks/remote-components'


export interface CommandSurfaceProps {
    defaultPage?: string;

    program: {interface: {id: string, nodes: any[], edges: any[]}} & any;
    onCommand?: (type: string, parameters: any) => void;

    seekValue?: (startDate: Date, endDate: Date) => any[];
    values: {id: string, key: string, value: any}[] | {[key: string]: {[key: string]: any}}

    watching?: {id: string, name: string, color: string}[];

    cache?: RemoteComponentCache
}   

export const CommandSurface: React.FC<CommandSurfaceProps> = (props) => {

    const { program: activeProgram, defaultPage, onCommand, watching } = props;


    /*
        Parse the values blob internally and represent it as a clean tag system
        {
            [TAG]: {
                [STATE]: VALUE
            }
        }
    */

    const deviceValues : {[key: string]: {[key: string]: any}} = useMemo(() => {
        if(Array.isArray(props.values)){
            return props.values.reduce((prev, curr) => ({
                ...prev,
                [curr.id]: {
                    ...prev[curr.id],
                    [curr.key]: curr.value
                }
            }), {})
        }else{
            return props.values;
        }
    }, [props.values])
    
    const id = '';

    const navigate = useNavigate()

    const [ activePage, setActivePage ] = useState<any>(null)

    const [ activeView, setView ] = useState('home')

    const [ historize, setHistorize ] = useState(false);

    const [ maintenanceWindow, setMaintenanceWindow ] = useState(false);

    const [ editReportPage, setEditReportPage ] = useState<any>(null)

    const functions = [
        {
            id: 'change-view',
            fn: (args: {view: string}) => {
                setActivePage(args.view);
            }
        }
    ]


    const toolbar_menu = [
        {id: 'maintain', label: "Maintain", icon: <Engineering />, active: maintenanceWindow},
        {id: 'time-machine', label: "History", icon: <Timelapse />, active: historize},
        {id: 'alarms', label: "Alarms", icon: <AccessAlarm />, active: window.location.href.indexOf('alarms') > -1}
        // { id: 'controls', label: "Controls", icon: <Dashboard /> },
        // { id: 'variables', label: "Variables", icon: <System />},
        // { id: 'graphs', label: "Graphs", icon: <Analytics /> },
        // { id: 'info', label: "Info", icon: <Info /> },
        // { id: 'devices', label: "Devices", icon: <Services /> },
    ]

    const view = toolbar_menu.find((a) => {
        return matchPath(window.location.pathname, `${a.id}`) != null;
    })


    const [anchorEl, setAnchorEl ] = useState<any>();


    const deviceInfo: any = {};

//    const { data: deviceInfo } = useQuery(gql`
//         query DeviceInfo($id: ID) {
//             commandDevices(where: {id: $id}){
//                 setpoints {
//                     id
//                     setpoint {
//                         id
//                         name
//                         key {
//                             id
//                             key
//                         }
//                         device {
//                             id
//                             name
//                         }
//                     }
//                     value
//                 }
//             }
//         }
//     `, {
//        variables: {
//            id
//        }
//     })

    // const refetch = () => {
    //     client.refetchQueries({include: ['DeviceInfo']})
    // }


    const changeMode = useChangeMode(id)
    const changeState = useChangeState(id)

    const changeDeviceMode = useChangeDeviceMode(id)

    const createMaintenanceWindow = useCreateDeviceMaintenanceWindow(id);

    const createReportPage = useCreateReportPage(id);

    const onTreeAdd = (nodeId?: string) => {
        switch(nodeId){
            case 'analytics-root':
                setEditReportPage(true);
                break;
        }
    }

    const onTreeSelect = (nodeId: string) => {

        switch(nodeId){
            case 'analytics-root':
                break;
            case 'controls-root':
                // console.log("Controls ", nodeId)
                // setActivePage(nodeId)

                break;
            default:
                let nodes = drawerMenu.reduce((prev, curr) => [...prev, ...(curr.children || []).map((x) => ({...x, parent: curr.id}))], [] as any[])
                let node = nodes.find((a) => a.id == nodeId)
                let page = node.parent.replace(/-root/g, '');

                setView(page);
                
                if(page == 'controls'){
                    setActivePage(nodeId)
                }
                break;
        }
    }


    //Translates id to bus-port value
    const rootDevice = {} //data?.commandDevices?.[0];

    const alarms = activeProgram?.alarms || [];
    
    const reports = activeProgram?.reports || [];


    const actions = activeProgram?.interface?.actions || [];

    const templatePacks = activeProgram?.templatePacks || [];

    console.log({activeProgram, templatePacks})
    // const defaultPage = activeProgram?.interface?.find((a) => a.id == remoteHomepage);

    const mapHMI = (iface: any ) => {
        let nodes = iface?.nodes?.map((node: any) => {
            return {
                ...node,
                extras: {
                    options: {a: 1}
                },
                devicePlaceholder: {
                    ...node?.devicePlaceholder,
                    tag: node?.devicePlaceholder?.tag ? `${node?.devicePlaceholder?.type?.tagPrefix || ''}${node?.devicePlaceholder?.tag}` : ''
                }
            }
        })

        return {
            ...iface,
            nodes
        }
    }

    const memoisedHmi = useMemo(() => {
        return activeProgram?.interface?.map(mapHMI);
    }, [activeProgram?.interface]) 

    console.log({memoisedHmi})

    const hmi = activeProgram?.interface?.find((a) => activePage ? a.id == activePage : a.id == defaultPage)?.nodes?.filter((a: any) => !a.children || a.children.length == 0)?.map((node: any) => {
        const setpoints = (node?.devicePlaceholder?.setpoints || [])?.map((setpoint: any) => {
            let s = deviceInfo?.commandDevices?.[0]?.setpoints?.find((a: any) => a.setpoint?.id == setpoint.id);

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

    
    const groups = activeProgram?.interface?.nodes?.filter((a: any) => a.children && a.children.length > 0)?.map((node: any) => {
        const children = node.children?.map((children: any) => {
            const setpoints = (children?.devicePlaceholder?.setpoints || [])?.map((setpoint: any) => {
                let s = deviceInfo?.commandDevices?.[0]?.setpoints?.find((a: any) => a.setpoint?.id == setpoint.id);

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

    const drawerMenu : TreeMenuItem[] = [
        {
            id: 'controls-root',
            name: 'Controls',
            dontAdd: true,
            dontEdit: true,
            expanded: true,
            children: (memoisedHmi || []).map((hmi: any) => ({id: hmi.id, dontAdd: true, dontEdit: true, name: hmi.name}))
        },
        {
            id: 'analytics-root',
            name: 'Analytics',
            dontEdit: true,
            children: reports?.map((x: any) => ({id: x.id, name: x.name, dontAdd: true}))
        },
        {
            id: 'devices-root',
            name: 'Devices',
            dontAdd: true,
            dontEdit: true,
            children: []
        }
    ];

    const renderActiveView = () => {
        switch(activeView){
            case 'home':
                return (<HomeView />)
            case 'analytics':
                return (<DeviceControlGraph />)
            case 'controls':
                return (<Control />)
        }
    }

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
   

        // const refresh = () => {
        //     return client.refetchQueries({ include: ['Q'] })
        // }

    // const changeOperationMode = (mode: string) => {
    //     changeMode(mode).then(() => {
    //         refresh()
    //     })
    // }

    // const changeOperationState = (state: "on" | "off" | "standby") => {
    //     changeState(state).then(() => {
    //         refresh()
    //     })
    // }

    // console.log({values, state: values?.find((a) => a.deviceId == "Plant" && a.valueKey == "Running")})

    return (
        <LocalizationProvider dateAdapter={AdapterMoment}>
        <DeviceControlProvider value={{
            actions,
            historize,
            alarms,
            sendAction: props.onCommand,
            setView,

            seekValue: props.seekValue,
            // waitingForActions,
            
            // changeOperationMode,
            // changeOperationState,

            // operatingMode: rootDevice?.operatingMode,
            // operatingState: rootDevice?.operatingState,
            // operatingMode: values?.find((a) => a.deviceId == "Plant" && a.valueKey == "Mode")?.value.toLowerCase(),
            // operatingState: values?.find((a) => a.deviceId == "Plant" && a.valueKey == "Running")?.value == 'true' ? "on" : "off",
            // controlId: id,
            values: deviceValues,
            program,
            watching: watching || [],
            // values,
            reporting: reports,
            hmis: memoisedHmi,
            defaultPage,
            activePage,
            functions,
            templatePacks,
            groups,
            changeDeviceMode,
            // changeDeviceValue,
            // performAction: performDeviceAction,
            // refresh,
            // refetch
        }}>
            <MaintenanceWindow
                open={maintenanceWindow}
                onSubmit={(period) => {
                    if(!period.startTime || !period.endTime) return;
                    createMaintenanceWindow(period.startTime, period.endTime).then(() => {
                        setMaintenanceWindow(false)
                        // refetch();
                    })
                }}
                onClose={() => {
                    setMaintenanceWindow(false)
                }} />
            <DeviceReportModal
                onSubmit={(page) => {
                    createReportPage(page.name).then(() => {
                        setEditReportPage(null);
                        // refetch();
                    })
                }}
                onClose={() => setEditReportPage(null)}
                open={Boolean(editReportPage)} />
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
                            size="small"
                            onClick={() => navigate("../../")}
                            sx={{color: 'navigation.main'}}>
                            <KeyboardArrowLeft
                                fontSize="inherit"
                                
                                />
                        </IconButton>
                        <IconButton 
                            size="small"
                            sx={{color: 'navigation.main'}}>
                            <Home 
                                fontSize="inherit"
                                
                                />
                        </IconButton>
                        <IconButton
                            size="small"
                            sx={{color: 'navigation.main'}}>
                            <KeyboardArrowRight
                                fontSize="inherit"
                                />
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
                                    // background: rootDevice?.online ? '#42e239' : '#db001b'
                                }} />
                            {/* <Typography color="#fff">{rootDevice?.name} - {program?.name}</Typography> */}
                    </Box>
                       
                    <Toolbar
                        // active={toolbar_menu.find((a) => matchPath(window.location.pathname, `${a?.id}`) != null)?.id}
                        onItemClick={(item) => {
                            switch(item){
                                case 'maintain':
                                    setMaintenanceWindow(true)
                                    break;
                                case 'time-machine':
                                    setHistorize(!historize);
                                    break;
                                case 'alarms':
                                    if( window.location.href.indexOf('alarms') > -1){
                                        navigate('.')
                                    }else{
                                        navigate('alarms');
                                    }

                                    break;
                            }
                            // navigate(`${item}`)
                        }}
                        items={toolbar_menu} />

                        <Box
                            sx={{marginLeft: '6px'}}
                            onMouseEnter={(evt) => {
                                setAnchorEl(evt.currentTarget)
                            }}
                            onMouseLeave={(evt) => {
                                setAnchorEl(null)
                            }}>
                            <AvatarList
                                users={(watching || []).map((x: any) => ({
                                    ...x,
                                    // color: stringToColor(x.name)
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
                                        <Typography>Observing</Typography>
                                        <Divider />
                                        <List disablePadding>
                                            {watching?.map((x: any) => (
                                                <ListItem sx={{marginBottom: '3px'}} dense>{x.name}</ListItem>
                                            ))}
                                        </List>
                                    </Box>
                            </Popover>
                        </Box>

                    <Box sx={{display: 'flex', flexDirection:"row"}}>
                        {view?.id == 'controls' && (<IconButton><Cycle /></IconButton>)}
                    </Box>
                </Paper>
                
                <Box
                    sx={{flex: 1, display: 'flex', maxHeight: 'calc(100% - 38px)', flexDirection: 'row'}}>
                    <Routes>
                        <Route path={`alarms`} element={<AlarmList />} />
                        <Route path={''} element={<React.Fragment>
                                <Paper sx={{
                                    width: '200px',
                                    borderRadius: 0
                                }}>
                                    <TreeMenu   
                                        items={drawerMenu}
                                        onAdd={onTreeAdd}
                                        onNodeSelect={onTreeSelect}
                                        />
                                </Paper>
                                <Box sx={{flex: 1, display: 'flex'}}>
                                    {renderActiveView()}
                                   
                                </Box>
                            </React.Fragment>}>
                           
                        </Route>
                    </Routes>
                </Box>

            </Paper>
        </DeviceControlProvider>
        </LocalizationProvider>
    )
}