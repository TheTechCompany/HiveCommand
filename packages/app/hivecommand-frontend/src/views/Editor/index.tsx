import { gql, useApolloClient, useQuery } from '@apollo/client';
import React, { Suspense, lazy, useEffect, useRef, useState, useCallback } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { Spinner } from 'grommet'
import qs from 'qs';
import { matchPath, Outlet, useLocation, useMatch, useNavigate, useParams, useResolvedPath } from 'react-router-dom';
import { IconNodeFactory, InfiniteCanvas, InfiniteCanvasNode, InfiniteCanvasPath, HyperTree } from '@hexhive/ui'
//const Editor = lazy(() => import('@hive-flow/editor'));
import { Home } from './pages/home'
import { KeyboardArrowLeft as ArrowLeft, Menu } from '@mui/icons-material'

import { Routes, Route } from 'react-router-dom';
import {Program} from './pages/program'
import {Controls} from './pages/controls'
import { Alarms } from './pages/alarms';
import { Devices, DeviceSingle } from './pages/devices';

import { useCreateProgramFlow, useCreateProgramHMI, useUpdateProgramFlow, useUpdateProgramHMI } from '@hive-command/api';
import { RoutedTabs } from '../../components/routed-tabs';
import { CommandEditorProvider } from './context';
import { Variables } from './pages/variables';
import { IconButton } from '@mui/material';
import { TreeMenu } from './components/tree-menu';
import { EditorMenuDialog } from '../../components/modals/editor-menu';

import { Home as HomeIcon  } from '@mui/icons-material'
// import Broadcast from '@mui/icons-material/BroadcastOnHome'
export interface EditorProps {

}

export const EditorPage: React.FC<EditorProps> = (props) => {
    const { id } = useParams()
    const navigate = useNavigate()
    const location = useLocation()


    const match = useMatch(`*/:path`)

    const [ menuOpen, setMenuOpen ] = useState<any>();
    const [ editItem, setEditItem ] = useState<any>();

    const [ selected, setSelected ] = useState<{
        id: string,
        parent?: string,
        type: 'root' | 'editor'
    }>()

    const client = useApolloClient()

    const { data } = useQuery(gql`
        query EditorCommandProgram ($id: ID){
            commandPrograms(where: {id: $id}){
                id
                name

                templatePacks {
                    id
                    url
                    name
                }
                
                devices {
                    id
                    name
                }

                interface {
                    id
                    name
                    localHomepage
                    remoteHomepage
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

    const updateProgramFlow = useUpdateProgramFlow(id)
    const updateProgramHMI = useUpdateProgramHMI(id)

    const handleMenuSubmit = async (type: string, data: any) => {
        let promise : any = null

        if(editItem){
            switch(type){
                case 'program':
                    promise = updateProgramFlow(editItem.id, data.name)
                    break;
                case 'hmi':
                    promise = updateProgramHMI(editItem.id, data.name, data.localHomepage, data.remoteHomepage)
            }
        }else{
            switch(type){
                case 'program':
                    //Add parent opt
                    promise = createProgramFlow(data.name)
                    break;
                case 'hmi':
                    //Add parent opt
                    promise = createProgramHMI(data.name, data.localHomepage, data.remoteHomepage)
                    break;
            }

        }
        await promise;
        setMenuOpen(null);
        setEditItem(null);
        refetch()
    }
   
    const refetch = () => {
        client.refetchQueries({include: ['EditorCommandProgram']})
    }
   
    const program = data?.commandPrograms?.[0] || {};

    const query = qs.parse(location.search, {ignoreQueryPrefix: true})

    const menu = [
        "Home",
        "Variables",
        "Alarms"
    ]

    useEffect(() => {

        menu.forEach((item, ix) => {
            console.log(item, window.location.pathname)
           

        })

    }, [window.location.pathname])

    const treeMenu = [
        {
            id: 'system-root',
            name: 'System',
            dontAdd: true,
            element: <Home />
        },
        {
            id: 'program-root',
            name: 'Program',
            children: program?.program?.map((x) => ({
                id: x.id,
                name: x.name,
                children: x.children?.map((y) => ({
                    id: y.id,
                    name: y.name
                }))
            })),
            element: <div>Program</div>,
            editor: <Program activeProgram={selected?.id} />
        },
        {
            id: 'hmi-root',
            name: 'HMI',
            children: program?.interface?.map((x) => ({
                id: x.id,
                name: x.name,
                children: [],
                icon: x.localHomepage ? <HomeIcon fontSize="small"/> : x.remoteHomepage ? <HomeIcon fontSize="small" /> : undefined
            })),
            element: <div>HMI</div>,
            editor: <Controls activeProgram={selected?.id} />
        },
        {
            id: 'devices-root',
            name: 'Devices',
            children: program?.devices?.map((x) => ({
                id: x.id,
                name: x.name
            })),
            element: <Devices />
        },
        {
            id: 'alarms-root',
            name: 'Alarms',
            element: <Alarms />

        },
        {
            id: 'setpoints-root',
            name: 'Setpoints',
            element: <Variables />
        }
    ];

    const renderRootPage = () => {
        let page = treeMenu?.find((a) => a.id == `${selected?.id}-root`)
        return page.element
    }

    const renderEditorPage = () => {
        let root = treeMenu.find((a) => a.id == selected?.parent);
        let page = root?.children?.find((a) => a.id == selected?.id);

        console.log({root, page, selected})
        return root?.editor
    }

    return (
        <CommandEditorProvider value={{
            program,
            refetch: refetch
        }}>
            <EditorMenuDialog 
                type={menuOpen}
                selected={editItem}
                onClose={() => {
                    setEditItem(undefined);
                    setMenuOpen(undefined)
                }}
                onSubmit={(item) => {
                    handleMenuSubmit(menuOpen, item)
                }}
                open={Boolean(menuOpen)} />
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
                    margin: '6px',
                    flex: 1,
                    display: 'flex',
                    position: 'relative',
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
                                navigate(`/programs`)
                                // openSidebar(!sidebarOpen)
                            }}>
                            <ArrowLeft fontSize='small' style={{color: 'white'}} />
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
                    sx={{
                        flex: 1, 
                        display: 'flex', 
                        flexDirection: 'row',
                        height: 'calc(100% - 36px)'
                    }}>
                    
                    <Paper sx={{borderRadius: 0, minWidth: '175px'}}>
                      
                        <TreeMenu
                            onEdit={(nodeId) => {
                                console.log(nodeId)
                                let elements = treeMenu.reduce((prev, curr) => {
                                    return [...prev, ...(curr.children || []).map((x) => ({...x, parent: curr.id}))]
                                }, [])

                                let element = elements.find((a) => a?.id == nodeId);

                                console.log({element});
                                let type = element.parent.replace(/-root/, '');

                                switch(type){
                                    case 'hmi':
                                        setEditItem(program.interface?.find((a) => a.id == nodeId));
                                        break;
                                }

                                setMenuOpen(type)
                            }}
                            onAdd={(parent) => {
                                setMenuOpen(parent.replace(/-root/, ''))
                            }}
                            onNodeSelect={(node) => {
                                let isRoot = node.match(/(.+)-root/);
                                if(isRoot){
                                    setSelected({
                                        id: isRoot[1],
                                        type: 'root'
                                    })
                                    // setView(node.match(/(.+)-root/)?.[1] as any)
                                }else{

                                    let elements = treeMenu.reduce((prev, curr) => {
                                        return [...prev, ...(curr.children || []).map((x) => ({...x, parent: curr.id}))]
                                    }, [])

                                    let element = elements.find((a) => a?.id == node);

                                    setSelected({
                                        id: node,
                                        parent: element?.parent,
                                        type: 'editor',
                                    })
                                }
                            }}
                            items={treeMenu}
                            />
                    </Paper>
                    <Box sx={{flex: 1, display: 'flex'}}>
                        {selected?.type == 'root' ? renderRootPage() : renderEditorPage()}
                    </Box>
                    
                </Box>
            </Paper>
            </Suspense>
        </CommandEditorProvider>
    )
}