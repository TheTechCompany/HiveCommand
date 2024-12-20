import React, { useState } from 'react';

import { Route, Routes, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import {Map, Handyman, Extension, Schema, Psychology} from '@mui/icons-material';

import { Sidebar } from '../../components/sidebar'
import { ElementEditor } from '../../pages/element-editor';
import { ElementList } from '../../pages/element-list';
import { DeviceSettings } from '../../pages/device-settings';
import { SchematicList } from '../../pages/schematic-list';
import { FunctionList } from '../../pages/function-list';

const Devices = React.lazy(() => import('../../pages/device-list').then((r) => ({ default: r.Devices })))

const ProgramList = React.lazy(() => import('../../pages/program-list').then((r) => ({ default: r.ProgramList })));

export const pages = [
    {
        icon: <Map />,
        label: "Deployments",
        path: '',
        component: <Devices/>
    },
    // {
    //     icon: <Psychology />,
    //     label: "Functions",
    //     path: "functions",
    //     component: <Outlet />,
    //     children: [
    //         {
    //             path: '',
    //             component: <FunctionList />
    //         }
    //     ]
    // },
    // {
    //     icon: <Schema />,
    //     label: "Schematics",
    //     path: "schematics",
    //     component: <Outlet />,
    //     children: [
    //         {
    //             path: '',
    //             component: <SchematicList />
    //         }
    //     ]
    // },
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
        label: "Add-ons",
        path: "add-ons",
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

     const path = useLocation()
     console.log("URL ", process.env.REACT_APP_URL, path)

    return (
        <Box sx={{flex: 1, display: 'flex', bgcolor: 'primary.dark'}}>
       
            <Box
                sx={{flex: 1, display: 'flex', flexDirection: 'row'}}
                
                key={'left'}>
                <Sidebar 
                    active={path.pathname}
                    // active={path.pathname?.slice(1, path.pathname?.length) || window.location.pathname.replace((process.env.REACT_APP_URL || '/dashboard/command'), '')}
                    onSelect={(item) => {
                        navigate(item.path)
                    }}
                    items={pages}
                    />
                
                <Box
                    sx={{flex: 1, display: 'flex', padding: '6px'}}>
                    <React.Suspense fallback={(
                        <Box sx={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                            <CircularProgress color="primary" size="medium" />
                        </Box>)}>

                        <Routes>
                            <Route element={<Outlet />}>
                                {pages.map((x, ix) => (
                                    <Route path={`${x.path}`} element={x.component}>
                                        {x.children && x.children.map((y, iy) => (
                                            <Route path={`${y.path}`} element={y.component} />
                                        ))}
                                    </Route>
                                ))}
                                <Route path={':id/settings'} element={<DeviceSettings/>} />

                            </Route>
                         
                            {/* <Route path={`device-map/:id`} element={<DeviceMapper />} /> */}
                        </Routes>
                    </React.Suspense>

                </Box>
            </Box>
        </Box>
    )
}

export default Dashboard;