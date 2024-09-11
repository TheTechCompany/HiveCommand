import React, { useState, useMemo, useEffect, useRef } from 'react';
// import { useQuery, gql, useApolloClient } from '@apollo/client';

import { Outlet, Route, Routes, matchPath, useLocation, useMatches, useNavigate } from 'react-router-dom'
// import { matchPath, Navigate, Outlet, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'

import { LocalizationProvider } from '@mui/x-date-pickers'
import { KeyboardArrowLeft, Timelapse, Engineering, Settings } from '@mui/icons-material';
import Toolbar from './toolbar';
import { DeviceControlProvider } from './context';
import { ReportChart, AnalyticView } from './views/analytics'

import { Paper, Box, Button, Typography, IconButton, Divider, Switch, FormControlLabel } from '@mui/material';
// import { useSubscription } from '@apollo/client';
// import { stringToColor } from '@hexhive/utils';
import { TreeMenu, TreeMenuItem } from './components/tree-menu';
import { MaintenanceWindow } from './components/modals/maintenance';

import { DeviceAnalyticModal } from './components/modals/device-analytic';
import { ControlView } from './views/control';
import { AlarmList } from './views/alarms';
import { HomeView } from './views/home';
import { RemoteComponentCache, useRemoteComponents } from '@hive-command/remote-components';
import { Header } from './components/Header';
import { getDeviceFunction } from './components/action-menu';
import { FieldValue } from './components/field-value';
import { HMIType, HMITag, HMITemplate } from "@hive-command/interface-types"

import { useMatch, useResolvedPath } from 'react-router-dom'
import { ReportView } from './views/reports';
import { DeviceReport, DeviceReportModal } from './components/modals/device-report';

export interface CommandSurfaceClient {
    analytics?: {
        id: string;
        name: string;
        createdAt?: Date,
        charts: ReportChart[];
    }[]

    reports?: {
        id: string,
        name: string,
        startDate: Date,
        endDate?: Date,
        reportLength?: string,
        recurring?: boolean,
        createdAt?: Date,
        fields?: {
            id: string,
            device: any,
            key: any,
            bucket: string,
            createdAt: Date,
        }[]
    }[]

    createAnalyticPage?: (name: string) => Promise<any>;
    updateAnalyticPage?: (id: string, name: string) => Promise<any>;
    removeAnalyticPage?: (id: string) => Promise<any>;

    createReport?: (report: DeviceReport) => Promise<any>;
    updateReport?: (id: string, report: DeviceReport) => Promise<any>;
    deleteReport?: (id: string) => Promise<any>;

    createReportField?: (report: string, field?: {device: string, key: string, bucket: string}) => Promise<any>,
    updateReportField?: (report: string, id: string, field?: {device: string, key: string, bucket: string}) => Promise<any>,
    deleteReportField?: (report: string, id: string) => Promise<any>,

    downloadReport?: (report: string, startDate: Date, endDate: Date) => Promise<any>;

    downloadAnalytic?: (page: string, id: string, startDate: Date, endDate: Date, bucket: string) => Promise<any>

    useAnalyticValues?: (report: string, horizon: { start: Date, end: Date }) => ({ results: any, loading: boolean });

    addChart?: (pageId: string, type: string, deviceId: string, keyId: string, units: string, timeBucket: string, x: number, y: number, w: number, h: number, totalize: boolean) => Promise<any>;
    updateChart?: (pageId: string, id: string, type: string, deviceId: string, keyId: string, units: string, timeBucket: string, x: number, y: number, w: number, h: number, totalize: boolean) => Promise<any>;
    updateChartGrid?: (pageId: string, layout: { id: string, x: number, y: number, w: number, h: number }[]) => Promise<any>;
    removeChart?: (pageId: string, id: string) => Promise<any>;

    changeMode?: (mode: string) => void;

    useValues?: (program: { tags: HMITag[], types: HMIType[] }) => ({
        values: any
    });

    useAlarms?: () => ({ results: any });
    acknowledgeAlarm?: (alarm: string) => void;

    useConnectivity?: () => ({ online: boolean, lastSeen: Date });
    // getValues?: (horizon: { start: Date, end: Date }) => ({ id: string, key: string, value: any }[] | { [key: string]: { [key: string]: any } })[];

    performDeviceAction?: (device: string, action: string) => void;
    writeTagValue?: (tag: string, value: any, subkey?: string) => void;

}

// export interface HMITemplate {
//     id: string;

//     inputs?: { id: string, name: string, type: string }[]
//     outputs?: { id: string, name: string, type: string }[]

//     edges?: { id: string, from: { id: string }, to: { id: string }, script: string }[]
// }

export interface HMIView {
    id: string,
    nodes: HMINode[],
    edges?: HMIEdge[],
    actions?: {}[]
}

export interface HMINode {
    id: string;

    type: string;

    x: number;
    y: number;

    width?: number;
    height?: number;

    zIndex?: number;

    rotation?: number;

    scaleX?: number;
    scaleY?: number;

    dataTransformer?: {
        template: HMITemplate

        configuration: {
            id: string
            field: {
                id: string
            }
            value: any
        }[]
        options?: {
            [id: string]: any
        }
    };

    // template?: HMITemplate;
    // templateOptions?: {}[];

    options: { [key: string]: string | { fn: string } }
}

export interface HMIEdge {

}

export interface HMIDevice {

    id: string;
    tag: string;
    type: {
        tagPrefix: string;
        state: any[]
        actions: { key: string, func: string }[];
    }

}


// export interface HMITag {
//     id: string;
//     name: string;
//     type: string;
// }

// export interface HMIType {
//     id: string;
//     name: string;
//     fields: {
//         id: string;
//         name: string
//         type: string;
//     }[]
// }

export interface HMITemplatePack {
    id: string
    url: string;
}

export interface HMIProgram {
    id: string,

    tags: HMITag[],
    types: HMIType[],

    dataScopes?: { id: string, name: string, plugin: { id: string, name: string, module: string } }[]
    components?: { id: string, name: string, main?: { id: string, path: string, content: string }, files: { path: string, content: string }[] }[]

    interface: HMIView[]
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

    templatePacks: HMITemplatePack[]
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
    // values: { [key: string]: any } //{[key: deviceName]: deviceValues} //{ id: string, key: string, value: any }[] | { [key: string]: { [key: string]: any } }

    watching?: { id: string, name: string, color: string }[];

    cache?: RemoteComponentCache

    onHome?: () => void;
}

export const CommandSurface: React.FC<CommandSurfaceProps> = (props) => {

    const surfaceRef = useRef<HTMLDivElement>(null);

    const { program: activeProgram, defaultPage, client, watching } = props;

    const { analytics = [], reports = [] } = client || {};

    const { tags, types } = activeProgram || {};

    const navigate = useNavigate()

    const { online, lastSeen } = client?.useConnectivity?.() || {};

    const { results: alarms } = client?.useAlarms?.() || {};

    /*
        Parse the values blob internally and represent it as a clean tag system
        {
            [TAG]: {
                [STATE]: VALUE
            }
        }
    */

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

    const [selectedAnalytic, setSelectedAnalytic] = useState<any>(null);
    const [editAnalyticPage, setEditAnalyticPage] = useState<any>(null)
    
    const [selectedReport, setSelectedReport] = useState<any>({});
    const [ editReportPage, setEditReportPage ] = useState(false);

    const [infoTarget, setInfoTarget] = useState<{ x?: number, y?: number, width?: number, height?: number, dataFunction?: (state: any) => any }>();

    useEffect(() => {
        setInfoTarget(undefined)
    }, [activePage])

    /*
        showTagWindow (pos, '$TAG', {manual, actions: [], setpoints: []} )
        showTemplateWindow(pos, window, (state) => {props} )

        showTemplateWindow (..., (props) => {}, (state) => {})
    */

    const functions = {
        changeView: (args: { view: string }) => {
            setActivePage(args.view);
        },
        showTagWindow: (
            position: { x: number, y: number, width: number, height: number, anchor?: string },
            deviceTag: string,
            stateItems: string[] = [],
            actions: { label: string, func: string }[] = [],
            setpoints?: (state: any) => ({ label: string, getter: () => any, setter?: (value: any) => void }[]),
            manual?: (state: any) => ({ getter: () => boolean, setter: (value: boolean) => void }),
            transformer?: (state: any) => any
        ) => {
            functions.showWindow({
                x: position?.x,
                y: position?.y,
                width: position?.width,
                height: position?.height,
            }, (_state: any) => {

                const [view, setView] = useState<'info' | 'settings'>('info')

                // let values = workingState[deviceTag] || workingState || {};

                const state = transformer ? transformer(_state) : _state[deviceTag];

                let values = _state[deviceTag]

                console.log("SHOW WINDOW", values, state, deviceTag)

                if (values == undefined || values == null) values = {};

                let tag = tags?.find((a) => a.name === deviceTag);

                let fields = types?.find((a) => a.name === tag?.type)?.fields || [];

                const manualControls = useMemo(() => {
                    return manual?.(state);
                }, [JSON.stringify(state), manual])

                const leftAction = useMemo(() => {
                    if ((setpoints?.(state) || []).length > 0) {
                        if (view == 'settings') {
                            return (<IconButton onClick={() => setView('info')} sx={{ padding: 0 }}>
                                <KeyboardArrowLeft />
                            </IconButton>)
                        }
                    }
                }, [setpoints, state, view])

                const rightAction = useMemo(() => {
                    if (manualControls) {
                        return (<FormControlLabel labelPlacement="start" control={<Switch size='small' onChange={(e) => manualControls?.setter?.(e.target.checked)} checked={manualControls?.getter?.()} />} label="Manual" />)
                    }


                }, [manualControls, view, setpoints, JSON.stringify(state)])

                const headerExtras = useMemo(() => {
                    // if(setpoints.length > 0){
                    //     if(view === 'settings'){
                    //         return ' - Setpoints'
                    //     }
                    // }
                    if ((setpoints?.(state) || []).length > 0) {
                        // if(view == 'settings'){
                        //     return <Box sx={{display: 'flex'}}>
                        //         <IconButton sx={{  padding: 0  }}>
                        //             <RestartAlt />
                        //         </IconButton>
                        //         <IconButton sx={{  padding: 0  }}>
                        //             <Save />
                        //         </IconButton>
                        //     </Box>
                        // }
                        if (view === 'settings') return;

                        return (
                            <IconButton size="small" onClick={() => setView('settings')} sx={{ padding: 0 }}>
                                <Settings fontSize="inherit" />
                            </IconButton>
                        )
                    }

                    // return ''
                }, [setpoints, view]);

                const setpointValues = useMemo(() => {
                    return setpoints?.(state)
                }, [JSON.stringify(setpoints), JSON.stringify(state)])

                const renderFieldValue = (valueKey: string) => {

                    let type = fields?.find((a) => a.name == valueKey)?.type;

                    return <FieldValue
                        type={type}
                        value={values[valueKey]}
                        onChange={(value) => {
                            console.log("Change value", deviceTag, value, valueKey)
                            client?.writeTagValue?.(deviceTag, value, valueKey)
                        }} />
                }

                return <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '12px', justifyContent: (rightAction) ? 'space-between' : 'flex-start' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {leftAction}
                            <Typography sx={{ fontWeight: 'bold', marginRight: '6px' }}>{deviceTag}</Typography>
                            {headerExtras}
                        </Box>
                        {rightAction}
                    </Box>
                    <Divider sx={{ marginBottom: '6px' }} />
                    {view == "info" ? (
                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
                                {Object.keys(values).filter((a) => {
                                    return (stateItems || []).indexOf(a) > -1;
                                }).slice().sort((a, b) => a.localeCompare(b)).map((valueKey) => (
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography sx={{ marginRight: '6px' }} fontWeight={"bold"}>{valueKey}:</Typography>
                                        {renderFieldValue(valueKey)}
                                    </Box>
                                ))}
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                {actions?.slice().sort((a, b) => a.label.localeCompare(b.label)).map((action) => (
                                    <Button
                                        variant="contained"
                                        onClick={() => {
                                            console.log(action.func)
                                            getDeviceFunction(action.func).then((f) => {

                                                f({},
                                                    async (state) => {
                                                        // if(typeof(state) === 'object'){
                                                        await Promise.all(Object.keys(state).map((key) => {
                                                            client?.writeTagValue?.(deviceTag, state[key], key);
                                                        }))
                                                        // }else{
                                                        //     client?.writeTagValue?.(deviceTag, state)
                                                        // }
                                                        // console.log({state})
                                                    },
                                                    (state) => console.log({ state })
                                                );
                                            })


                                        }}>{action.label}</Button>
                                ))}
                            </Box>
                        </Box>
                    ) : (
                        <Box sx={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
                            {setpointValues?.slice()?.sort((a, b) => a.label?.localeCompare(b.label))?.map((setpoint, ix) => (
                                <Box sx={{ marginBottom: '12px', display: 'flex' }}>
                                    <FieldValue

                                        type={"Number"}
                                        label={setpoint.label}
                                        value={setpoint.getter()}
                                        onChange={(value) => {
                                            // console.log("Change value", deviceTag, value, valueKey)
                                            // client?.writeTagValue?.(deviceTag, value, valueKey)

                                            setpoint.setter?.(value)
                                        }} />

                                </Box>
                            ))}
                        </Box>
                    )}
                </Box>
            })
        },
        showWindow: (
            position: { x: number, y: number, width: number, height: number, anchor?: string },
            dataFunction: (state: any) => any,
            transformer?: (state: any) => any
        ) => {

            let df = transformer ? (state: any) => {
                let workingState = transformer(state);
                return dataFunction(workingState)
            } : dataFunction

            setInfoTarget({
                x: position?.x,
                y: position?.y,
                width: position?.width,
                height: position?.height,
                dataFunction: df
            });
        }
    }

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

    const { getPack } = useRemoteComponents(props.cache)

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
                setEditAnalyticPage(true);
                break;
            case 'reports':
                setEditReportPage(true);
                break;
        }
    }

    const onTreeEdit = (nodeId?: string) => {
        let nodes = drawerMenu.reduce((prev, curr) => [...prev, curr, ...(curr.children || []).map((x) => ({ ...x, parent: curr.id }))], [] as any[])

        let node = nodes.find((a) => a.id == nodeId)
        let page = node?.parent;

        switch (page) {
            case 'analytics':
                setSelectedAnalytic(node)
                setEditAnalyticPage(true)
                break;
            case 'reports':
                setSelectedReport(reports?.find((a) => a.id == node?.id))
                setEditReportPage(true)
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

                let node = nodes.find((a) => a.id == nodeId)
                let page = node?.parent;

                if (!page) page = node.id;

                const pathRoot = drawerMenu.find((a) => a.id == page)?.pathRoot || '';

                if (nodeId != 'controls' && nodeId != 'analytics' && nodeId != 'reports') {
                    setView(page);

                    navigate(pathRoot)
                } else {
                    break;
                }

                if (page == 'controls' || page == 'analytics' || page == 'reports') {
                    setActivePage(nodeId)
                    navigate(`${pathRoot?.length > 0 ? pathRoot + '/' : ''}${nodeId}`)
                }
                break;
        }
    }


    //Translates id to bus-port value

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
        return activeProgram?.interface?.map(mapHMI)?.sort((a,b) => a.name?.localeCompare(b.name));
    }, [activeProgram?.interface]);

    const drawerMenu: (TreeMenuItem & { pathRoot: string, component?: JSX.Element })[] = [
        {
            id: 'controls',
            name: 'Controls',
            pathRoot: 'controls',
            dontAdd: true,
            dontEdit: true,
            expanded: true,
            component: <ControlView />,
            children: (memoisedHmi || []).map((hmi: any) => ({ id: hmi.id, dontAdd: true, dontEdit: true, name: hmi.name }))
        },
        {
            id: 'alarms',
            name: 'Alarms',
            pathRoot: 'alarms',
            dontAdd: true,
            dontEdit: true,
            component: <AlarmList />
        },
        // ...(props.menu || []),
        {
            id: 'analytics',
            name: 'Analytics',
            pathRoot: 'analytics',
            dontEdit: true,
            children: analytics?.slice()?.sort((a, b) => (a.createdAt ? new Date(a.createdAt)?.getTime() : 0) - (b.createdAt ? new Date(b.createdAt)?.getTime() : 0) )?.map((x: any) => ({ id: x.id, name: x.name, dontAdd: true })),
            component: <AnalyticView />
        },
        {
            id: 'reports',
            name: 'Reports',
            pathRoot: 'reports',
            dontEdit: true,
            children: reports?.slice()?.sort((a, b) => (a.createdAt ? new Date(a.createdAt)?.getTime() : 0) - (b.createdAt ? new Date(b.createdAt)?.getTime() : 0) )?.map((x: any) => ({id: x.id, name: x.name, dontAdd: true})), 
            component: <ReportView />
        }
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

    const topLevel = drawerMenu?.filter((item) => {
        return useMatch(useResolvedPath(item.pathRoot + '/*').pathname) != null
    })

    const routes = drawerMenu?.map((item) => {
        return useResolvedPath(item.pathRoot + '/*').pathname
    })

    return (
        <Routes>
            <Route element={(
                <LocalizationProvider dateAdapter={AdapterMoment}>
                    <DeviceControlProvider value={{
                        historize,
                        alarms,
                        client,
                        // sendAction: props.onCommand,
                        setView,

                        infoTarget,
                        setInfoTarget,
                        // seekValue: props.seekValue,
                        // waitingForActions,

                        changeOperationMode: (mode) => {
                            client?.changeMode?.(mode);
                            // props.onCommand?.('CHANGE-MODE', { mode })
                        },
                        // values: deviceValues,
                        watching: watching || [],
                        // values,
                        activeProgram,

                        cache: props.cache,

                        analytics: analytics,
                        reports,
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
                            open={editReportPage}
                            selected={selectedReport}
                            onSubmit={(report) => {
                                if(report.id){
                                    client?.updateReport?.(report.id, {
                                        name: report.name,
                                        startDate: report.startDate ?  new Date(report.startDate) : undefined,
                                        endDate: !report.recurring ? (report.endDate ? new Date(report.endDate) : new Date()) : undefined,
                                        recurring: report.recurring,
                                        reportLength: report.reportLength
                                    }).then(() => {
                                        setEditReportPage(false);
                                        setSelectedReport({})
                                    })
                                }else{
                                    client?.createReport?.({
                                        ...report,
                                        startDate: report.startDate ? new Date(report.startDate) : new Date(),
                                        endDate: !report.recurring ? (report.endDate ? new Date(report.endDate) : new Date()) : undefined
                                    }).then(() => {
                                        setEditReportPage(false);
                                        setSelectedReport({})
                                    })
                                }

                            }}
                            onDelete={() => {
                                client?.deleteReport?.(selectedReport?.id).then(() => {
                                    setEditReportPage(false);
                                    setSelectedReport({})
                                })
                            }}
                            onClose={() => {
                                setEditReportPage(false)
                                setSelectedReport({})
                            }}
                            />
                        <DeviceAnalyticModal
                            selected={selectedAnalytic}
                            onSubmit={(page) => {

                                if (page.id) {
                                    client?.updateAnalyticPage?.(page.id, page.name).then(() => {
                                        setEditAnalyticPage(null);
                                        setSelectedAnalytic(null)
                                    })

                                } else {
                                    client?.createAnalyticPage?.(page.name).then(() => {
                                        setEditAnalyticPage(null);
                                        setSelectedAnalytic(null)
                                    });
                                }


                            }}
                            onDelete={() => {
                                client?.removeAnalyticPage?.(selectedAnalytic.id).then(() => {
                                    setEditAnalyticPage(null);
                                    setSelectedAnalytic(null)
                                })
                            }}
                            onClose={() => {
                                setEditAnalyticPage(null)
                                setSelectedAnalytic(null)
                            }}
                            open={Boolean(editAnalyticPage)} />
                        <Paper
                            ref={surfaceRef}
                            sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

                            <Header
                                title={props.title}
                                online={online}
                                lastSeen={lastSeen}
                                fullscreenHandler={() => {
                                    if (document.fullscreenElement) {
                                        document.exitFullscreen();
                                    } else {
                                        surfaceRef.current?.requestFullscreen();
                                    }
                                }}
                                activeUsers={watching}
                                menuItems={toolbarMenu}
                                onHome={props.onHome}
                            />

                            <Box
                                sx={{ flex: 1, display: 'flex', maxHeight: 'calc(100% - 38px)', flexDirection: 'row' }}>
                                <Outlet />

                            </Box>

                        </Paper>
                    </DeviceControlProvider>
                </LocalizationProvider>
            )}>
                <Route path={`alarms`} element={<AlarmList />} />
                <Route element={<React.Fragment>
                    <Paper sx={{
                        width: '200px',
                        borderRadius: 0
                    }}>
                        <TreeMenu
                            items={drawerMenu}
                            onAdd={onTreeAdd}
                            onEdit={onTreeEdit}
                        // onNodeSelect={onTreeSelect}
                        />
                    </Paper>
                    <Box sx={{ flex: 1, display: 'flex' }}>
                        <Outlet />
                        {/* {renderActiveView()} */}

                    </Box>
                </React.Fragment>}>
                    <Route path={''} element={<HomeView />} />
                    {drawerMenu.filter((a) => a.component).map((menuItem) => (
                        <Route path={menuItem.pathRoot} element={<Outlet />}>
                            {(menuItem.children || []).length > 0 &&
                                <Route path={':activePage/*'} element={menuItem.component} />}
                            {(menuItem.children || []).length == 0 &&
                                <Route path={''} element={menuItem.component} />}
                        </Route>
                    ))}

                </Route>
            </Route>
        </Routes>
    )
}