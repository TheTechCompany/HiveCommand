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
import { RemoteComponentCache, useRemoteComponents } from './hooks/remote-components';
import { Header } from './components/Header';
import { merge } from 'lodash'
import { getNodePack, getOptionValues, useNodesWithValues } from './utils';
import { template } from 'dot';
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

    inputs?: { id: string, name: string, type: string }[]
    outputs?: { id: string, name: string, type: string }[]

    edges?: { id: string, from: { id: string }, to: { id: string }, script: string }[]
}

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
    }

}

export interface HMITemplatePack {
    id: string
    url: string;
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
    values: { [key: string]: any } //{[key: deviceName]: deviceValues} //{ id: string, key: string, value: any }[] | { [key: string]: { [key: string]: any } }

    watching?: { id: string, name: string, color: string }[];

    cache?: RemoteComponentCache
}

export const CommandSurface: React.FC<CommandSurfaceProps> = (props) => {

    const surfaceRef = useRef<HTMLDivElement>(null);

    const { program: activeProgram, defaultPage, client, watching } = props;

    const { reports = [] } = client || {};

    const devices = useMemo(() =>
        activeProgram?.devices?.map((device) => ({
            ...device,
            tag: `${device?.type?.tagPrefix || ''}${device?.tag}`
        }))
        , [activeProgram?.devices])

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

	const [infoTarget, setInfoTarget] = useState<{ x?: number, y?: number, width?: number, height?: number, dataFunction?: (state: any) => any }>();

    const functions = {
        changeView: (args: { view: string }) => {
                setActivePage(args.view);
        },
        showDeviceWindow: (position: {x: number, y: number, width: number, height: number, anchor?: string}, deviceTag: string) => {
            functions.showWindow({
                x: position?.x,
                y: position?.y,
                width: position?.width,
                height: position?.height,
            }, (state: any) => (
                    <Box>
                        <Typography>{deviceTag}</Typography>
                        <Button>Start</Button>
                    </Box>
            ))
        },
        showWindow: (position: {x: number, y: number, width: number, height: number, anchor?: string}, dataFunction : (state: any) => any) => {
        //    alert("STUFF");
            console.log("SHOW WINDOW HANDLER")
            setInfoTarget({
                x: position?.x,
                y: position?.y,
                width: position?.width,
                height: position?.height,
                dataFunction
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

    const hmi = useMemo(() => {
        const activeInterface = activeProgram?.interface?.find((a) => activePage ? a.id === activePage : a.id === defaultPage);

        return activeInterface;



        //         /*
        //   let width = x.width || x?.icon?.metadata?.width //|| x.type.width ? x.type.width : 50;
        //         let height = x.height || x?.icon?.metadata?.height //|| x.type.height ? x.type.height : 50;

        //         let opts = Object.keys(x.options || {}).map((key) => {
        //             if(x.options[key]?.fn){
        //                 return {key, value: functions?.find((a) => a.id == x.options[key]?.fn)?.fn?.bind(this, x.options[key]?.args)}
        //             }


        //             // console.log(template('{{=it.stuff}}', {varname: 'stuff',})({stuff: 'abc'}))
        //             let value;
        //             try{
        //             // console.log({varname, tmpl: x.options[key], values})
        //                 value = template(x.options[key] || '')(values)
        //             }catch(e){
        //                 value = x.options[key];
        //             };
        // //x.options[key] /
        //             return {key, value: value}
        //         }).reduce((prev, curr) => ({...prev, [curr.key]: curr.value}), {})

        //         return {
        //             id: x.id,
        //             x: x.x,
        //             y: x.y,
        //             zIndex: x.zIndex || 1,
        //             rotation: x.rotation || 0,
        //             scaleX: x.scaleX || 1,
        //             scaleY: x.scaleY || 1,
        //             width,
        //             height,

        //             options: opts,
        //             //  width: `${x?.type?.width || 50}px`,
        //             // height: `${x?.type?.height || 50}px`,
        //             extras: {
        //                 options: x.icon?.metadata?.options || {},
        //                 devicePlaceholder: x.devicePlaceholder,
        //                 rotation: x.rotation || 0,
        //                 zIndex: x.zIndex || 1,
        //                 scaleX: x.scaleX != undefined ? x.scaleX : 1,
        //                 scaleY: x.scaleY != undefined ? x.scaleY : 1,
        //                 // showTotalizer: x.showTotalizer || false,
        //                 ports: x?.icon?.metadata?.ports?.map((y) => ({ ...y, id: y.key })) || [],
        //                 // iconString: x.type?.name,
        //                 icon: x.icon, //HMIIcons[x.type?.name],
        //                 // ports: x?.type?.ports?.map((y) => ({ ...y, id: y.key })) || []
        //             },
        //             type: 'hmi-node',

        //         }
        //         */

        //         // activeProgram?.interface?.find((a) => activePage ? a.id == activePage : a.id == defaultPage)
        //         //     ?.nodes?.filter((a: any) => !a.children || a.children.length == 0)
        //         //     ?.map((node: any) => {

        //         //         //Get node 
        //         //         const options = node.

        //         //         const setpoints = (node?.devicePlaceholder?.setpoints || [])?.map((setpoint: any) => {
        //         //             let s = deviceInfo?.commandDevices?.[0]?.setpoints?.find((a: any) => a.setpoint?.id == setpoint.id);

        //         //             return {
        //         //                 ...setpoint,
        //         //                 value: s?.value || setpoint.value
        //         //             };
        //         //         });


        //         //         return {
        //         //             ...node,
        //         //             devicePlaceholder: {
        //         //                 ...node.devicePlaceholder,
        //         //                 setpoints: setpoints
        //         //             }
        //         //         }
        //         //     }) || []
        //         return nodesWithElems;

    }, [activeProgram, activePage, defaultPage])

    const [hmiWithElems, setHMIWithElems] = useState<any[]>([])

    useEffect(() => {

        (async () => {
            const activeNodes = (hmi?.nodes || []).filter((a: any) => !a.children || a.children.length == 0);

            console.log("Active nodes");
            const nodesWithElems = await Promise.all(activeNodes.map(async (node) => {

                const nodeElem = await getNodePack(node.type, templatePacks, getPack)

                let width = node.width || nodeElem?.metadata?.width //|| x.type.width ? x.type.width : 50;
                let height = node.height || nodeElem?.metadata?.height //|| x.type.height ? x.type.height : 50;


                return {
                    id: node.id,
                    type: 'hmi-node',
                    x: node.x,
                    y: node.y,
                    zIndex: node.zIndex || 1,
                    rotation: node.rotation || 0,
                    scaleX: node.scaleX || 1,
                    scaleY: node.scaleY || 1,
                    width,
                    height,
                    options: node.options,
                    
                    dataTransformer: node?.dataTransformer,

                    extras: {
                        icon: nodeElem, //Icon from template pack
                        options: nodeElem?.metadata?.options || {}, //Options for node - related to extras.icon

                        //TODO: Figure out how to remove the duplication of options
                        rotation: node.rotation || 0,
                        zIndex: node.zIndex || 1,
                        scaleX: node.scaleX != undefined ? node.scaleX : 1,
                        scaleY: node.scaleY != undefined ? node.scaleY : 1,
                        // showTotalizer: x.showTotalizer || false,
                        ports: nodeElem?.metadata?.ports?.map((y) => ({ ...y, id: y.key })) || [],
                    }
                }

            }));

            setHMIWithElems(nodesWithElems)
        })();
    }, [hmi])


    const parseValue = (value: any, type: "BooleanT" | "Boolean" | "IntegerT" | "UIntegerT") => {
        switch (type) {
            case "Boolean":
            case "BooleanT":
                return (value == true || value == "true" || value == 1 || value == "1");
            case "UIntegerT":
            case "IntegerT":
                let val = parseFloat(value || 0);
                if (Number.isNaN(val)) {
                    val = 0;
                }
                return val.toFixed(2);
            default:
                console.log({ type })
                break;
        }
    }

    const [normalisedValues, setNormalisedValues] = useState<any>({});
    
    useEffect(() => {
        console.log("Devices", devices)
        setNormalisedValues(devices?.map((device) => {

            let deviceKey = `${device.tag}`;

            // let device = program?.devices.find((a) => `${a.type.tagPrefix ? a.type.tagPrefix : ''}${a.tag}` == deviceKey);

            // device.type.state
            let deviceValues = device?.type.state?.map((stateItem) => {

                // let deviceStateItem = device?.type.state.find((a) => a.key == valueKey)

                let currentValue = props.values?.[deviceKey]?.[stateItem.key];

                return {
                    key: stateItem.key,
                    value: parseValue(currentValue, stateItem.type)
                }
            }).reduce((prev, curr) => ({
                ...prev,
                [curr.key]: curr.value
            }), {})

            return {
                key: deviceKey,
                values: deviceValues
            }
        }).reduce((prev, curr) => ({
            ...prev,
            [curr.key]: curr.values
        }), {}))

    }, [props.values, devices])

    const fullHMIElements = useNodesWithValues(hmiWithElems, devices || [], functions, normalisedValues || {})

    // console.log({fullHMIElements})

    // const fullHMIElements = useMemo(() => {
    //     //Map HMI elements to their templated or real values

    //     console.log({hmiWithElems})
    //     return hmiWithElems.map((node) => {

    //         let opts = Object.keys(node.extras?.options || {}).map((key) => {

    //             const hmiNode = hmi?.nodes.find((a) => a.id === node.id)

    //             return { key, value: getOptionValues({...node, dataTransformer: hmiNode?.dataTransformer}, devices || [], functions.showWindow, normalisedValues, key, node.options?.[key]) };

    //         }).reduce((prev, curr) => ({ ...prev, [curr.key]: curr.value }), {})

    //         console.log({opts})

    //         return {
    //             ...node,
    //             options: opts
    //         }

    //     })

    // }, [hmiWithElems, hmi, normalisedValues])

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

    const program = useMemo(() => ({
        ...activeProgram,
        interface: {
            id: '',
            // ...activeProgram?.interface,
            ...hmi,
            nodes: fullHMIElements
        },
        devices: devices || []
    }), [activeProgram, hmi, fullHMIElements, devices])


    return (
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
                values: deviceValues,
                program,
                watching: watching || [],
                // values,
                reports: reports,
                hmis: memoisedHmi,
                defaultPage,
                activePage,
                // functions,
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