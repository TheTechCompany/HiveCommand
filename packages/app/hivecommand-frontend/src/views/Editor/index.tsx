import { gql, useApolloClient, useQuery } from '@apollo/client';
import React, { Suspense, lazy, useEffect, useRef, useState, useCallback } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { Spinner } from 'grommet'
import qs from 'qs';
import { matchPath, Outlet, useLocation, useMatch, useNavigate, useParams, useResolvedPath } from 'react-router-dom';
import { IconNodeFactory, InfiniteCanvas, InfiniteCanvasNode, InfiniteCanvasPath, HyperTree } from '@hexhive/ui'
//const Editor = lazy(() => import('@hive-flow/editor'));

import {  Menu } from '@mui/icons-material'

import { Routes, Route } from 'react-router-dom';
import {Program} from './pages/program'
import {Controls} from './pages/controls'
import { Alarms } from './pages/alarms';
import { Devices, DeviceSingle } from './pages/devices';

import { useCreateProgramFlow, useCreateProgramHMI } from '@hive-command/api';
import { RoutedTabs } from '../../components/routed-tabs';
import { CommandEditorProvider } from './context';
import { Variables } from './pages/variables';
import { IconButton } from '@mui/material';
export interface EditorProps {

}

export const EditorPage: React.FC<EditorProps> = (props) => {
    const { id } = useParams()
    const navigate = useNavigate()
    const location = useLocation()


    const match = useMatch(`*/:path`)

    const [ modalOpen, openModal ] = useState<boolean>(false);

    const [ selectedItem, setSelectedItem ] = useState<any>(undefined);

    const [ view, setView ] = useState<"Documentation" | "Program" | "HMI" | "Devices" | "Alarms">("Program")

    const [ sidebarOpen, openSidebar ] = useState<boolean>(true);

    const [ nodes, setNodes ] = useState<InfiniteCanvasNode[]>([]);
    const [ paths, _setPaths ] = useState<InfiniteCanvasPath[]>([]);


    const [ activeProgram, setActiveProgram ] = useState<string>('')


    const client = useApolloClient()

    const { data } = useQuery(gql`
        query EditorCommandProgram ($id: ID){
            commandPrograms(where: {id: $id}){
                id
                name
                devices {
                    id
                    name
                }
                program {
                    id
                    name
                    children {
                        id
                        name
                    }
                }

             
            }
        }
    `, {
        variables: {
            id: id
        }
    })

    const createProgramFlow = useCreateProgramFlow(id)
    const createProgramHMI = useCreateProgramHMI(id)

   
    const refetch = () => {
        client.refetchQueries({include: ['EditorCommandProgram']})
    }
   
    const program = data?.commandPrograms?.[0] || {};

    const query = qs.parse(location.search, {ignoreQueryPrefix: true})

    const menu = [
        "Program",
        "Controls",
        "Devices",
        "Variables",
        "Alarms"
    ]

    useEffect(() => {

        menu.forEach((item, ix) => {
            console.log(item, window.location.pathname)
           

        })

    }, [window.location.pathname])


    return (
        <CommandEditorProvider value={{
            sidebarOpen: sidebarOpen,
            program,
            refetch: refetch
        }}>
            <Suspense fallback={(
                <Box 
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                    <Spinner size="medium"/>
                    <Typography>Loading Editor ...</Typography>
                </Box>)}>
            <Paper 
                sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                <Box
                    sx={{
                        display: 'flex',
                        bgcolor: 'secondary.main'
                    }}>
                    <Box 
                        sx={{display: 'flex', flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                        <IconButton
                            onClick={() => {
                                openSidebar(!sidebarOpen)
                            }}>
                            <Menu fontSize='small' style={{color: 'white'}} />
                        </IconButton>
                        <Typography color="#fff">{program.name}</Typography>
                    </Box>

                    <Box 
                        sx={{
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            display: 'flex',
                            flexDirection: 'row',
                            overflow: 'hidden'
                        }}>
                        <RoutedTabs 
                            tabs={menu.map((x) => ({
                                path: x.toLowerCase(),
                                label: x,
                                default: x == "Program"
                            }))} />
                        {/* {menu.map((menu_item) => (
                            <Button 
                            
                                hoverIndicator
                                onClick={() => {
                                    setActiveProgram(undefined)
                                    setView(menu_item as any)
                                    navigate(`${menu_item.toLowerCase()}`)
                                }}
                                style={{padding: 6, borderRadius: 3}} 
                                active={view == menu_item} 
                                plain 
                                label={menu_item} />
                        ))}\

                        */}
                        
                    </Box>
                </Box>

              
                <Box
                    sx={{flex: 1, display: 'flex', flexDirection: 'row'}}>
                    
                    <Box sx={{flex: 1, display: 'flex'}}>
                        <Routes>
                            <Route path={`/`} element={<Outlet />}>
                                <Route path={""} element={<Program activeProgram={activeProgram} />} />
                                <Route path={`program`} element={<Program activeProgram={activeProgram} />} />
                                <Route path={`controls`} element={<Controls activeProgram={activeProgram} />} />
                                <Route path={`devices`} element={<Devices/>} />
                                <Route path={`devices/:id*`} element={ <DeviceSingle program={id} />} />
                                <Route path={`alarms`} element={<Alarms/>} />
                                <Route path={`variables`} element={<Variables />} />
                            </Route>
                        </Routes>
                    </Box>
                    
                </Box>
            </Paper>
            </Suspense>
        </CommandEditorProvider>
    )
}