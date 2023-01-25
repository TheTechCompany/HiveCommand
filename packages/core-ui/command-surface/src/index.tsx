import { AvatarList } from '@hexhive/ui';
import React, { useState, useMemo, useEffect, useRef } from 'react';
// import { useQuery, gql, useApolloClient } from '@apollo/client';

import { Route, Routes, matchPath, useNavigate } from 'react-router-dom'
// import { matchPath, Navigate, Outlet, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'

import { LocalizationProvider } from '@mui/x-date-pickers'
import { DeviceHub as Services, Autorenew as Cycle, Analytics, Dashboard, Info, SettingsInputComposite as System, ChevronLeft, KeyboardArrowLeft, Menu, Home, KeyboardArrowRight, AccessAlarm, Timelapse, Engineering } from '@mui/icons-material';
import Toolbar from './toolbar';
import { DeviceControlProvider } from './context';
import { ReportChart, ReportView } from './views/reports'

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
import { Header } from './components/Header';
import { merge } from 'lodash'
export * from './hooks/remote-components'


export interface CommandSurfaceClient {
    reports?: {
        id: string;
        name: string;
        charts: ReportChart[];
    }[]

    createReportPage?: (name: string) => Promise<any>;
    updateReportPage?: (id: string, name: string) => Promise<any>;
    removeReportPage?: (id: string) => Promise<any>;

    addChart?: (pageId: string, type: string, deviceId: string, keyId: string, x: number, y: number, w: number, h: number, totalize: boolean) => Promise<any>;
    updateChart?: (pageId: string, id: string, type: string, deviceId: string, keyId: string, x: number, y: number, w: number, h: number, totalize: boolean) => Promise<any>;
    updateChartGrid?: (pageId: string, layout: { id: string, x: number, y: number, w: number, h: number }[]) => Promise<any>;
    removeChart?: (pageId: string, id: string) => Promise<any>;

    changeMode?: (mode: string) => void;
    getValues?: (horizon: { start: Date, end: Date }) => ({ id: string, key: string, value: any }[] | { [key: string]: { [key: string]: any } })[];
    performDeviceAction?: (device: string, action: string) => void;
    changeDeviceValue?: (device: string, state: string, value: any) => void;

}

export interface HMITemplate {
    id: string;

    inputs?: {id: string, key: string}[]
    outputs?: {id: string, key: string}[]

    configuration?: {id: string, from: { id: string }, to: { id: string }, script: string }[]
}

export interface HMIView {
    id: string,
    nodes: HMINode[],
    edges: HMIEdge[],
    actions: {}[]
}

export interface HMINode {
    id: string;

    template?: HMITemplate;
    templateOptions?: {}[];

    options: {[key: string]: string | {fn: string}}
}

export interface HMIEdge {

}

export interface HMIDevice {

    id: string;
    tag: string;
    type: {
        tagPrefix: string;
        state: any[]
    }

}

export interface HMIProgram {
    id: string,
    variables: {}[],
    interface: HMIView[]
    devices: HMIDevice[]
    // {
    //     id: string;
    //     tag: string;
    //     type: {
    //         tagPrefix?: string;
    //         state: {
    //             key: string
    //         }[];
    //     }
    // }[],
    alarms: {}[]

    templatePacks: {}[]
}

export interface CommandSurfaceProps {
    defaultPage?: string;

    title?: string;

    program?: HMIProgram;

    client?: CommandSurfaceClient;



    mode?: string;

    menu?: {
        id: string;
        name: string,
        dontAdd?: boolean,
        dontEdit?: boolean,
        exanded?: boolean,
        children?: any[],
        component: JSX.Element
    }[]

    // seekValue?: (startDate: Date, endDate: Date) => any[];
    values: { [key: string]: any } //{ id: string, key: string, value: any }[] | { [key: string]: { [key: string]: any } }

    watching?: { id: string, name: string, color: string }[];

    cache?: RemoteComponentCache
}

export const CommandSurface: React.FC<CommandSurfaceProps> = (props) => {

    const surfaceRef = useRef<HTMLDivElement>(null);

    const { program: activeProgram, defaultPage, client, watching } = props;

    const { reports = [] } = client || {};

    const devices = activeProgram?.devices?.map((device) => ({
        ...device,
        tag: `${device?.type?.tagPrefix || ''}${device?.tag}`
    }))

    /*
        Parse the values blob internally and represent it as a clean tag system
        {
            [TAG]: {
                [STATE]: VALUE
            }
        }
    */

    const deviceValues = props.values;
    // : { [key: string]: { [key: string]: any } } = useMemo(() => {


    //     return Object.keys(props.values).map((devicePath) => {

    //         let value = props.values[devicePath];
    //         let obj = devicePath.split('.').reverse().reduce((prev, curr) => ({[curr]: prev}), value)

    //         return obj
    //     }).reduce((prev, curr) => merge(prev, curr), {})

    //     // if (Array.isArray(props.values)) {
    //     //     return props.values.reduce((prev, curr) => ({
    //     //         ...prev,
    //     //         [curr.id]: {
    //     //             ...prev[curr.id],
    //     //             [curr.key]: curr.value
    //     //         }
    //     //     }), {})
    //     // } else {
    //     //     return props.values;
    //     // }
    // }, [props.values])


    const [activePage, setActivePage] = useState<any>(null)

    const [activeView, setView] = useState('home')

    const [historize, setHistorize] = useState(false);

    const [maintenanceWindow, setMaintenanceWindow] = useState(false);

    const [editReportPage, setEditReportPage] = useState<any>(null)

    const functions = [
        {
            id: 'change-view',
            fn: (args: { view: string }) => {
                setActivePage(args.view);
            }
        }
    ]

    const toolbar_menu = [
        {
            id: 'maintain',
            label: "Maintain",
            icon: <Engineering />,
            active: maintenanceWindow,
            onClick: () => {
                setMaintenanceWindow(true)
            }
        },
        {
            id: 'time-machine',
            label: "History",
            icon: <Timelapse />,
            active: historize,
            onClick: () => {
                setHistorize(!historize);

            }
        },
        // {
        //     id: 'alarms',
        //     label: "Alarms",
        //     icon: <AccessAlarm />,
        //     active: window.location.href.indexOf('alarms') > -1,
        //     onClick: () => {
        //         if (window.location.href.indexOf('alarms') > -1) {
        //             navigate('.')
        //         } else {
        //             navigate('alarms');
        //         }
        //     }
        // }
    ]

    console.log({ activeView, activePage })

    const { view, toolbarMenu } = useMemo(() => {
        const view = toolbar_menu.find((a) => {
            return matchPath(window.location.pathname, `${a.id}`) != null;
        })

        let toolbarMenu = toolbar_menu.slice();

        if (activeView != 'controls') {
            toolbarMenu = toolbarMenu.filter((a) => a.id != 'time-machine')
        }

        return {
            toolbarMenu,
            view,
        }
    }, [window.location.href, activeView])


    const deviceInfo: any = {};

    // const createMaintenanceWindow = useCreateDeviceMaintenanceWindow(id);

    // const createReportPage = useCreateReportPage(id);

    const onTreeAdd = (nodeId?: string) => {
        console.log({ nodeId });

        switch (nodeId) {
            case 'analytics':
                setEditReportPage(true);
                break;
        }
    }

    const onTreeSelect = (nodeId: string) => {
        console.log({ nodeId });

        switch (nodeId) {
            // case 'analytics-root':
            //     setView('analytics')
            //     break;
            // case 'alarms-root':
            //     setView('alarms');
            //     break;
            // case 'controls-root':
            //     // console.log("Controls ", nodeId)
            //     // setActivePage(nodeId)

            //     break;
            default:
                let nodes = drawerMenu.reduce((prev, curr) => [...prev, curr, ...(curr.children || []).map((x) => ({ ...x, parent: curr.id }))], [] as any[])
                console.log({ nodes })
                let node = nodes.find((a) => a.id == nodeId)
                let page = node?.parent;

                console.log({ page, nodeId })

                if (!page) page = node.id;

                if (nodeId != 'controls' && nodeId != 'analytics') {
                    setView(page);
                }

                if (page == 'controls' || page == 'analytics') {
                    console.log("Control or analytics", nodeId)
                    setActivePage(nodeId)
                }
                break;
        }
    }


    //Translates id to bus-port value

    const alarms = activeProgram?.alarms || [];


    const templatePacks = activeProgram?.templatePacks || [];

    const mapHMI = (iface: any) => {
        let nodes = iface?.nodes?.map((node: any) => {
            return {
                ...node,
                extras: {
                    options: { a: 1 }
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



    const drawerMenu: (TreeMenuItem & { component?: JSX.Element })[] = [
        {
            id: 'controls',
            name: 'Controls',
            dontAdd: true,
            dontEdit: true,
            expanded: true,
            component: <Control />,
            children: (memoisedHmi || []).map((hmi: any) => ({ id: hmi.id, dontAdd: true, dontEdit: true, name: hmi.name }))
        },
        {
            id: 'alarms',
            name: 'Alarms',
            dontAdd: true,
            dontEdit: true,
            component: <AlarmList />
        },
        // ...(props.menu || []),
        {
            id: 'analytics',
            name: 'Analytics',
            dontEdit: true,
            children: reports?.map((x: any) => ({ id: x.id, name: x.name, dontAdd: true })),
            component: <ReportView />
        },
        {
            id: 'devices-root',
            name: 'Devices',
            dontAdd: true,
            dontEdit: true,
            children: []
        },
    ];

    const renderActiveView = () => {
        switch (activeView) {
            case 'home':
                return (<HomeView />)
            default:
                return drawerMenu?.find((a) => a.id == activeView)?.component;

            // case 'analytics':
            //     return (
            //         <ReportView
            //             charts={reports} />
            //     )
            // case 'controls':
            //     return (<Control />)
            // case 'alarms':
            //     return (<div>alarms</div>)
        }
    }

    const program = {
        ...activeProgram,
        interface: {
            ...activeProgram?.interface,
            nodes: hmi
        },
        devices: devices || []
    }


    return (
        <LocalizationProvider dateAdapter={AdapterMoment}>
            <DeviceControlProvider value={{
                historize,
                alarms,
                client,
                // sendAction: props.onCommand,
                setView,

                // seekValue: props.seekValue,
                // waitingForActions,

                changeOperationMode: (mode) => {
                    client?.changeMode?.(mode);
                    // props.onCommand?.('CHANGE-MODE', { mode })
                },
                values: deviceValues,
                program,
                watching: watching || [],
                // values,
                reports: reports,
                hmis: memoisedHmi,
                defaultPage,
                activePage,
                functions,
                templatePacks,
            }}>
                <MaintenanceWindow
                    open={maintenanceWindow}
                    onSubmit={(period) => {
                        if (!period.startTime || !period.endTime) return;
                        // createMaintenanceWindow(period.startTime, period.endTime).then(() => {
                        //     setMaintenanceWindow(false)
                        //     // refetch();
                        // })
                    }}
                    onClose={() => {
                        setMaintenanceWindow(false)
                    }} />
                <DeviceReportModal
                    onSubmit={(page) => {
                        client?.createReportPage?.(page.name).then(() => {
                            setEditReportPage(null);
                        });
                        // createReportPage(page.name).then(() => {
                        //     setEditReportPage(null);
                        //     // refetch();
                        // })
                    }}
                    onClose={() => setEditReportPage(null)}
                    open={Boolean(editReportPage)} />
                <Paper
                    ref={surfaceRef}
                    sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

                    <Header
                        title={props.title}
                        fullscreenHandler={() => {
                            if (document.fullscreenElement) {
                                document.exitFullscreen();
                            } else {
                                surfaceRef.current?.requestFullscreen();
                            }
                        }}
                        activeUsers={watching}
                        menuItems={toolbarMenu}
                    />

                    <Box
                        sx={{ flex: 1, display: 'flex', maxHeight: 'calc(100% - 38px)', flexDirection: 'row' }}>
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
                                <Box sx={{ flex: 1, display: 'flex' }}>
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