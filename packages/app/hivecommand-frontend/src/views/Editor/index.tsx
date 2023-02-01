import { gql, useApolloClient, useQuery } from '@apollo/client';
import React, { Suspense, lazy, useEffect, useRef, useState, useCallback } from 'react';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import qs from 'qs';
import { matchPath, Outlet, useLocation, useMatch, useNavigate, useParams, useResolvedPath } from 'react-router-dom';
//const Editor = lazy(() => import('@hive-flow/editor'));
import { Home } from './pages/home'
import { KeyboardArrowLeft as ArrowLeft, Menu } from '@mui/icons-material'


import { Routes, Route } from 'react-router-dom';
import {Controls} from './pages/controls'

import { useCreateProgramFlow, useCreateProgramHMI, useCreateProgramPlaceholder, useCreateProgramTemplate, useCreateProgramVariable, useDeleteProgramHMI, useUpdateProgramFlow, useUpdateProgramHMI, useUpdateProgramPlaceholder, useUpdateProgramTemplate, useUpdateProgramVariable } from '@hive-command/api';
import { RoutedTabs } from '../../components/routed-tabs';
import { CommandEditorProvider } from './context';
import { IconButton } from '@mui/material';
import { TreeMenu } from './components/tree-menu';
import { EditorMenuDialog } from '../../components/modals/editor-menu';

import { Home as HomeIcon  } from '@mui/icons-material'
import { TemplateEditor } from './pages/template';
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

            commandProgramDevices { 
                id
                name
                tagPrefix

                state {
                    key
                    type
                }
            }

            commandPrograms(where: {id: $id}){
                id
                name

                templates {
                    id
                    name

                    inputs {
                        id
                        name
                        type
                    }

                    outputs {
                        id
                        name
                        type
                    }

                    edges {
                        id

                        to {
                            id
                        }

                        from {
                            id
                        }
                        script
                    }
                }

                templatePacks {
                    id
                    url
                    name
                }
                
                devices {
                    id
                    tag

                    type {
                        tagPrefix

                        
                    }
                }

                interface {
                    id
                    name

                    localHomepage
                    remoteHomepage

                    nodes {
                        id
                        type

                    }
                }

                program {
                    id
                    name
                    children {
                        id
                        name
                    }
                }

                variables {
                    id
                    name
                    type
                }
             
            }
        }
    `, {
        variables: {
            id: id
        }
    })


    const deviceTypes = data?.commandProgramDevices || [];

    console.log({deviceTypes})

    const createProgramFlow = useCreateProgramFlow(id)
    const createProgramHMI = useCreateProgramHMI(id)
    const createProgramPlaceholder = useCreateProgramPlaceholder(id);
    const createProgramVariable = useCreateProgramVariable(id);
    const createProgramTemplate = useCreateProgramTemplate(id);

    const updateProgramFlow = useUpdateProgramFlow(id)
    const updateProgramHMI = useUpdateProgramHMI(id)
    const updateProgramPlaceholder = useUpdateProgramPlaceholder(id);
    const updateProgramVariable = useUpdateProgramVariable(id);
    const updateProgramTemplate = useUpdateProgramTemplate(id);
    
    const deleteProgramHMI = useDeleteProgramHMI(id);

    const handleMenuDelete = async (type: string, data: any) => {
        let promise : any = null;

        console.log({type});

        switch(type){
            case 'hmi':
                promise = deleteProgramHMI(data.id)
                break;
            default: 
                promise = Promise.resolve(true)
                break;
        }
        await promise;

        setMenuOpen(null);
        setEditItem(null);
        refetch()
    }

    const handleMenuSubmit = async (type: string, data: any) => {
        let promise : any = null

        if(editItem){
            switch(type){
                case 'templates':
                    promise = updateProgramTemplate(editItem.id, {name: data.name})
                    break;
                case 'program':
                    promise = updateProgramFlow(editItem.id, data.name)
                    break;
                case 'hmi':
                    promise = updateProgramHMI(editItem.id, data.name, data.localHomepage, data.remoteHomepage)
                    break;
                case 'devices':
                    promise = updateProgramPlaceholder(editItem.id, data.tag, data.type);
                    break;
                case 'variables':
                    promise = updateProgramVariable(editItem.id, {name: data.name, type: data.type});
                    break;
            }
        }else{
            switch(type){
                case 'templates':
                    promise = createProgramTemplate({name: data.name});
                    break;
                case 'program':
                    //Add parent opt
                    promise = createProgramFlow(data.name)
                    break;
                case 'hmi':
                    //Add parent opt
                    promise = createProgramHMI(data.name, data.localHomepage, data.remoteHomepage)
                    break;
                case 'devices':
                    promise = createProgramPlaceholder(data.tag, data.type)
                    break;
                case 'variables':
                    promise = createProgramVariable({name: data.name, type: data.type})
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
        // {
        //     id: 'program-root',
        //     name: 'Program',
        //     children: program?.program?.map((x) => ({
        //         id: x.id,
        //         name: x.name,
        //         children: x.children?.map((y) => ({
        //             id: y.id,
        //             name: y.name
        //         }))
        //     })),
        //     element: <div>Program</div>,
        //     editor: <Program activeProgram={selected?.id} />
        // },
        {
            id: 'hmi-root',
            name: 'HMI',
            children: program?.interface?.map((x) => ({
                id: x.id,
                name: x.name,
                icon: x.localHomepage ? <HomeIcon fontSize="small"/> : x.remoteHomepage ? <HomeIcon fontSize="small" /> : undefined,
                children: x.nodes?.map((node) => ({
                    id: node.id,
                    name: node.type.split(':')[1] //`${node.devicePlaceholder?.type?.tagPrefix || ''}${node.devicePlaceholder?.tag}`
                })),
            })),
            element: <div>HMI</div>,
            editor: <Controls activeProgram={selected?.id} />
        },
        {
            id: 'templates-root',
            name: 'Templates',
            children: program?.templates?.slice(),
            editor: <TemplateEditor active={selected?.id} />
        },
        {
            id: 'devices-root',
            name: 'Devices',
            children: program?.devices?.slice()?.sort((a, b) => {
                let aTag = `${a.type?.tagPrefix || ''}${a.tag}`;
                let bTag = `${b.type?.tagPrefix || ''}${b.tag}`;
                
                return aTag?.localeCompare(bTag);
                
            }).map((x) => ({    
                id: x.id,
                name: `${x.type?.tagPrefix || ''}${x.tag}`
            })),
            // element: <Devices />
        },
        {
            id: 'variables-root',
            name: 'Variables',
            // element: <Variables />,
            children: program?.variables?.slice()
        },
        {
            id: 'alarms-root',
            name: 'Alarms',
            // element: <Alarms />

        }
    ];

    const renderRootPage = () => {
        let page = treeMenu?.find((a) => a.id == `${selected?.id}-root`)
        return page.element
    }

    const renderEditorPage = () => {
        let root = treeMenu?.find((a) => a.id == selected?.parent);
        let page = root?.children?.find((a) => a.id == selected?.id);

        return root?.editor
    }

    return (
        <CommandEditorProvider value={{
            program,
            deviceTypes,
            refetch: refetch
        }}>
            <EditorMenuDialog 
                type={menuOpen}
                selected={editItem}
                onDelete={() => {
                    handleMenuDelete(menuOpen, editItem)
                }}
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
                    <CircularProgress size="medium"/>
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
                    
                    <Paper sx={{borderRadius: 0, display: 'flex', minWidth: '175px'}}>
                      
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