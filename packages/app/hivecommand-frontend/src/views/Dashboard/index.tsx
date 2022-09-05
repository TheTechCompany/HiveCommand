import React, { useState } from 'react';

import { Route, Routes, matchPath, useNavigate, Outlet } from 'react-router-dom';
import { Spinner } from 'grommet'
import { Box } from '@mui/material';
import { Header } from '../../components/ui/header'
import {Map, Handyman, Extension} from '@mui/icons-material';
import { EditorPage } from '../Editor';
import { Sidebar } from '@hexhive/ui'
import { DeviceDevices } from '../../pages/device-devices';
import { ElementEditor } from '../../pages/element-editor';
import { ElementList } from '../../pages/element-list';
import { DeviceMapper } from '../../pages/device-mapper';
const PluginEditor = React.lazy(() => import('../../pages/plugin-editor').then((r) => ({default: r.PluginEditorPage})))
const DeviceControl = React.lazy(() => import('../../pages/device-control').then((r) => ({default: r.DeviceControl})))

const Devices = React.lazy(() => import('../../pages/device-list').then((r) => ({ default: r.Devices })))

const ProgramList = React.lazy(() => import('../../pages/program-list').then((r) => ({ default: r.ProgramList })));
const PluginList = React.lazy(() => import('../../pages/plugin-list').then((r) => ({ default: r.PluginList })));
const PluginSingle = React.lazy(() => import('../../pages/plugin-single').then((r) => ({ default: r.PluginSingle })));


const pages = [
    {
        icon: <Map />,
        label: "Deployments",
        path: 'devices',
        component: <Devices/>
    },
    {
        icon: <Handyman />,
        label: "Programs",
        path: 'programs',
        component: <Outlet />,
        children: [
        {
            path: '',
            component: <ProgramList/>    
        },
       ]
    },
    {
        icon: <Extension />,
        label: "Elements",
        path: "elements",
        component: <Outlet />,
        children: [
            {
                path: '',
                component: <ElementList />
            },
            {
                path: ':id/*',
                component: <ElementEditor />
            }
        ]
    }
]

const drawerWidth = 240;


const Dashboard : React.FC<any> = (props) => {
   
    const navigate = useNavigate()

     const [drawerOpen, openDrawer] = useState<boolean>(false)


    return (
        <Box sx={{flex: 1, display: 'flex', bgcolor: 'primary.dark'}}>
       
            <Box
                sx={{flex: 1, display: 'flex', flexDirection: 'row'}}
                
                key={'left'}>
                <Sidebar 
                    active={window.location.pathname.replace((process.env.REACT_APP_URL || '/dashboard/command'), '')}
                    onSelect={(item) => {
                        navigate(item.path)
                    }}
                    menu={pages}
                    />
                
                <Box
                    sx={{flex: 1, display: 'flex', padding: '6px'}}>
                    <React.Suspense fallback={(
                        <Box sx={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
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
                            {/* <Route path={`/devices/:id/graphs`} component={DeviceControlGraph} />
                            <Route path={`/devices/:id/devices`} component={DeviceDevices} /> */}
                            {/* <Route path={`/devices/:id`} component={DeviceSingle} /> */}
                        
                            <Route path={`device-map/:id`} element={<DeviceMapper />} />
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