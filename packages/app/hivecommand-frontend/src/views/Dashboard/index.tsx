import React, { useState } from 'react';

import { Route, Routes, matchPath, useNavigate, Outlet } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { Header } from '../../components/ui/header'
import {Map, Handyman, Extension} from '@mui/icons-material';
import { EditorPage } from '../Editor';
import { Sidebar } from '@hexhive/ui'
import { DeviceDevices } from '../../pages/device-devices';
import { ElementEditor } from '../../pages/element-editor';
import { ElementList } from '../../pages/element-list';
import { DeviceMapper } from '../../pages/device-mapper';
import { DeviceSettings } from '../../pages/device-settings';

const Devices = React.lazy(() => import('../../pages/device-list').then((r) => ({ default: r.Devices })))

const ProgramList = React.lazy(() => import('../../pages/program-list').then((r) => ({ default: r.ProgramList })));


const pages = [
    {
        icon: <Map />,
        label: "Deployments",
        path: '',
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
                            <CircularProgress color="primary" size="medium" />
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
                            <Route path={'devices/:id/settings'} element={<DeviceSettings/>} />
                            <Route path={`device-map/:id`} element={<DeviceMapper />} />
                            {/* <Route path={`programs/:id/*`} element={<EditorPage/>} /> */}
                        </Routes>
                    </React.Suspense>

                </Box>
            </Box>
        </Box>
    )
}

export default Dashboard;