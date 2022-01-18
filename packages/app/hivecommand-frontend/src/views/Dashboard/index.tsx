import React, { useState } from 'react';

import { Route, Routes, matchPath, useNavigate, Outlet } from 'react-router-dom';

import { Box, List, Spinner } from 'grommet';
import { Header } from '../../components/ui/header'
import {Map, Tools, Previous, Plug, GraphQl} from 'grommet-icons';
import { EditorPage } from '../Editor';
import { Sidebar } from '@hexhive/ui'
import { DeviceDevices } from '../../pages/device-devices';
const PluginEditor = React.lazy(() => import('../../pages/plugin-editor').then((r) => ({default: r.PluginEditorPage})))
const DeviceControl = React.lazy(() => import('../../pages/device-control').then((r) => ({default: r.DeviceControl})))

const Devices = React.lazy(() => import('../../pages/device-list').then((r) => ({ default: r.Devices })))

const ProgramList = React.lazy(() => import('../../pages/program-list').then((r) => ({ default: r.ProgramList })));
const PluginList = React.lazy(() => import('../../pages/plugin-list').then((r) => ({ default: r.PluginList })));
const PluginSingle = React.lazy(() => import('../../pages/plugin-single').then((r) => ({ default: r.PluginSingle })));


const pages = [
    {
        icon: <Map color="neutral-1" />,
        label: "Deployments",
        path: 'devices',
        component: <Devices/>
    },
    {
        icon: <Tools color="neutral-1" />,
        label: "Programs",
        path: 'programs',
        component: <Outlet />,
        children: [
        {
            path: '',
            component: <ProgramList/>    
        },
        {
            path: ':id/*',
            component: <EditorPage />
        }]
    }, {
        icon: <Plug  color="neutral-1" />,
        label: "Plugins",
        path: "plugins",
        component: <PluginList/>
    },
    // {
    //     icon: <GraphQl color="neutral-1"  />,
    //     label: "Reports",
    //     path: "/reports"
    // }
]

const drawerWidth = 240;


const Dashboard : React.FC<any> = (props) => {
   
    const navigate = useNavigate()

     const [drawerOpen, openDrawer] = useState<boolean>(false)
    /*
                   <img    
                            style={{height: 50, filter: 'invert(1)'}}
                            src={HiveFlowLogo}/>
    */

   


    return (
        <Box flex background="neutral-2" className="dashboard">
       
            <Box
                flex
                direction="row"
                key={'left'}
                style={{ display: 'flex', flex: 1 }}>
                <Sidebar 
                    active={window.location.pathname.replace((process.env.REACT_APP_URL || '/dashboard/command'), '')}
                    onSelect={(item) => {
                        navigate(item.path)
                    }}
                    menu={pages}
                    />
                
                <Box
                    pad='xsmall'
                    background={'neutral-2'}
                    flex >
                    <React.Suspense fallback={(
                        <Box flex align="center" justify="center">
                            <Spinner color="gold" size="medium" />
                        </Box>)}>

                        <Routes>
                            {pages.map((x, ix) => (
                                <Route path={`${x.path}`} element={x.component}>
                                    {x.children && x.children.map((y, iy) => (
                                        <Route path={`${y.path}`} element={y.component} />
                                    ))}
                                </Route>
                            ))}
                            <Route path={`devices/:id/*`} element={<DeviceControl/>} />
                            {/* <Route path={`/devices/:id/graphs`} component={DeviceControlGraph} />
                            <Route path={`/devices/:id/devices`} component={DeviceDevices} /> */}
                            {/* <Route path={`/devices/:id`} component={DeviceSingle} /> */}
                        
                        
                            {/* <Route path={`programs/:id/*`} element={<EditorPage/>} /> */}
                            <Route path={`plugins/:id/editor`} element={<PluginEditor/>} />
                            <Route path={`plugins/:id`} element={<PluginSingle/>} />
                        </Routes>
                    </React.Suspense>

                </Box>
            </Box>
        </Box>
    )
}

export default Dashboard;