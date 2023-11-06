import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Box, Button, Collapse, IconButton, Paper } from '@mui/material'
import { InfiniteCanvas, ContextMenu, IconNodeFactory, InfiniteCanvasNode, ZoomControls, InfiniteCanvasPath, BumpInput, HyperTree, InfiniteScrubber, LinePathFactory } from '@hexhive/ui';
import { HMINodeFactory } from '@hive-command/canvas-nodes';
import { gql, useApolloClient, useQuery } from '@apollo/client';
import * as HMIIcons from '../../../../assets/hmi-elements'
import { GridView as Nodes, Construction as Action, Assignment } from '@mui/icons-material'
import Settings from './Settings'
import { useParams } from 'react-router-dom';
import { useCreateHMINode, useDeleteHMINode, useDeleteHMIPath, useUpdateHMINode, useCreateHMIPath, useUpdateHMIPath } from '@hive-command/api';
import { useCommandEditor } from '../../context';
import { HMIDrawer } from './Drawer';
import { HMIContext, HMINodeData } from './context';
import NodeMenu from './NodeMenu';
import { CanvasStyle } from '../../../../style';

import { useRemoteComponents } from '@hive-command/remote-components';

import { getOptionValues } from '@hive-command/command-surface/dist/utils';

export const Controls = (props) => {

    const { id = '', activeId = '' } = useParams()

    const { getPack } = useRemoteComponents()

    const { program: { templatePacks, tags, types, components } = {}} = useCommandEditor()

    const [selected, _setSelected] = useState<{ key?: "node" | "path", id?: string }>({})

    const selectedRef = useRef<{ selected?: { key?: "node" | "path", id?: string } }>({})

    const setSelected = (s: { key?: "node" | "path", id?: string }) => {
        _setSelected(s)
        selectedRef.current.selected = s;
    }

    const [menuOpen, openMenu] = useState<string | undefined>(undefined);

    const [nodes, setNodes] = useState<InfiniteCanvasNode[]>([])
    const [paths, setPaths] = useState<InfiniteCanvasPath[]>([])


    const client = useApolloClient()

    const { data } = useQuery(gql`
        query Q ($id: ID){

            commandInterfaceDevices{
                id
                name
                width
                height
            }

            commandPrograms(where: {id: $id}){
                id
                name

                tags {
                    id
                    name
                    type
                }

                types {
                    id 
                    name
                    fields {
                        name
                        type
                    }
                }

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
                }

                templatePacks {
                    id
                    name
                    url
                    elements {
                        id
                        name
                    }
                }
                interface {
                    id
                    name

                    edges {
                        id
                        from {
                            id
                        
                        }
                        fromHandle
                        fromPoint
                        to {
                          
                            id
                        
                        }
                        toHandle
                        toPoint
                        points {
                            x
                            y
                        }
                    }
                    nodes {
                        
                        id
                        type

                        options

                        x
                        y

                        zIndex

                        scaleX
                        scaleY

                        showTotalizer
                        rotation
                        
                        dataTransformer {
                            id

                            template {
                                id
                            }

                            configuration {
                                id
                                field {
                                    id
                                }
                                value
                            }

                        }

                        width
                        height

                        inputs {
                            id
                            type 
                        }

                        children {
                            id
                            type 
                            x
                            y

                            width
                            height
                            
                            rotation

                           
                        }

                        ports {
                            id
                            key
                            x
                            y
                            rotation
                            length
                        }
                    }

                }               
            }
        }
    `, {
        variables: {
            id: id
        }
    })

    const refetch = () => {
        client.refetchQueries({ include: ['Q'] })
    }

    const createHMINode = useCreateHMINode(id, activeId)
    const updateHMINode = useUpdateHMINode(id)
    const deleteHMINode = useDeleteHMINode(id)


    const deleteHMIEdge = useDeleteHMIPath(id)
    const createHMIEdge = useCreateHMIPath(id, activeId)
    const updateHMIEdge = useUpdateHMIPath(id)

    // const updateHMIGroup = useUpdateHMIGroup()


    const canvasTemplates = data?.commandInterfaceDevices || [];

    const { program: flows, devices} = data?.commandPrograms?.[0] || {};

    let program = data?.commandPrograms?.[0]

    let hmiTemplatePacks = program?.templatePacks || [];

    let activeProgram = useMemo(() => (program?.interface)?.find((a) => a.id == activeId), [activeId, program]);



    const nodeMenu = useMemo(() => NodeMenu.map((x) => {
        let item = canvasTemplates.find((a) => a.name == x.extras.icon)
        return {
            id: item?.id,
            ...x,
            extras: {
                ...x.extras,
                id: item?.id,
                width: item?.width,
                height: item?.height
            }
        }
    }).filter((a) => a.id), [canvasTemplates])

    useEffect(() => {
        let program = data?.commandPrograms?.[0]
        if (program) {

            let nodes = activeProgram?.nodes?.filter((a) => !a.children || a.children.length == 0) || []
            let groups = activeProgram?.nodes?.filter((a) => a.children && a.children.length > 0) || []

            // console.log({nodes})
            Promise.all(nodes.map(async (node) => {

                const [packId, templateName ] = (node.type || '').split(':')
                const url = templatePacks?.find((a) => a.id == packId)?.url;

                if(url){
                    let base = url.split('/');
                    let [url_slug] = base.splice(base.length -1, 1)
                    base = base.join('/');

                    const pack = await getPack(packId, `${base}/`, url_slug)

                    const item = pack?.find((a) => a.name == templateName);

                    return {
                        ...node,
                        metadata: item?.component?.metadata,
                        icon: item?.component
                    }
                }
                
                return node;
                // return pack

            })).then((nodes) => {
                // console.log("ASD", {nodes})


                setNodes(nodes.map((x: any) => {
                    let width =  x.width || x?.icon?.metadata?.width //|| x.type.width ? x.type.width : 50;
                    let height = x.height || x?.icon?.metadata?.height //|| x.type.height ? x.type.height : 50;
    //x.width ||
    //x.height || 
                    let scaleX = x.width / width;
                    let scaleY = x.height / height;

                    if(x?.icon?.metadata?.maintainAspect) scaleY = scaleX;


                    let extraOptions = x.icon?.metadata?.options || {};
                    let nodeOptions = x.options;

                    let node = {
                        id: x.id,
                        x: x.x,
                        y: x.y,
                        width, 
                        height,
                        zIndex: x.zIndex != undefined ? x.zIndex : 1,
                        scaleX: x.scaleX != undefined ? x.scaleX : 1,
                        scaleY: x.scaleY != undefined ? x.scaleY : 1,
                        rotation: x.rotation || 0,
                        options: x.options,
                        templateOptions: x.dataTransformer?.configuration || [],

                        //  width: `${x?.type?.width || 50}px`,
                        // height: `${x?.type?.height || 50}px`,
                        extras: {
                            template: x.dataTransformer?.template?.id,
                            options: x.icon?.metadata?.options || {},
                            devicePlaceholder: {
                                ...x.devicePlaceholder,
                                tag: x?.devicePlaceholder?.tag ? `${x?.devicePlaceholder?.type?.tagPrefix || ''}${x?.devicePlaceholder?.tag}` : ''
                            },
                            rotation: x.rotation || 0,
                            zIndex: x.zIndex != undefined ? x.zIndex : 1,
                            scaleX: x.scaleX != undefined ? x.scaleX : 1,
                            scaleY: x.scaleY != undefined ? x.scaleY : 1,
                            showTotalizer: x.showTotalizer || false,
                            metadata: x.metadata,
                            icon: x.icon, //HMIIcons[x.type?.name],
                            ports: x?.icon?.metadata?.ports?.map((y) => ({ ...y, id: y.key })) || []
                        },
                        type: 'hmi-node',
        
                    }

                    let values = Object.keys(extraOptions).map((optionKey) => {
                        let optionValue = nodeOptions?.[optionKey]
                        
                        let parsedValue : any;

                        try{
                            // console.log({nodeValue: nodeInputValues.current.values[node.id]})
                            parsedValue = getOptionValues(node, tags || [], components || [], {} as any, {}, {values: {}}, {values: {}}, {values: {}}, (values: any) => {}, optionKey, optionValue);
                        }catch(e){
                            console.log({e, node, optionKey});
                        }

                        return {key: optionKey, value: parsedValue}

                    }).reduce((prev, curr) => ({
                        ...prev,
                        [curr.key]: curr.value
                    }), {});

                    (node.extras as any).dataValue = values;

                    
                    return node;
                }))
                // setNodes(nodes);
            })
            
            setPaths(((activeProgram)?.edges || []).map((x) => {
                return {
                    id: x.id,
                    type: 'line',

                    source: x?.from?.id,
                    sourceHandle: x.fromPoint || x.fromHandle,
                    target: x?.to?.id,
                    targetHandle: x.toPoint || x.toHandle,
                    points: x.points
                }
            }).reduce((prev, curr) => {
                return prev.concat(curr)
            }, []))
        }
    }, [data?.commandPrograms?.[0], activeProgram])


    const changeMenu = (view: string) => {
        openMenu(view == menuOpen ? undefined : view)
    }



    const watchEditorKeys = () => {

        if (selectedRef.current?.selected?.id) {
            if (selected.key == "node") {
                deleteHMINode(selectedRef.current?.selected?.id).then(() => {
                    refetch()
                })
            } else {
                deleteHMIEdge(selectedRef.current?.selected?.id).then(() => {
                    refetch()
                })
            }


        }

    }


    const updateNode = (id: string, data: ((node: HMINodeData) => HMINodeData)) => {

    
        setNodes((nodes) => {
            let n = nodes.slice();
            let ix = n.map(x => x.id).indexOf(id)

            let nodeData : HMINodeData = {
                position: {x: n[ix].x, y: n[ix].y},
                rotation: n[ix].rotation,
                size: {width: n[ix].width || 0, height: n[ix].height || 0}
            };

            let newData = {
                ...nodeData,
                ...data(nodeData)
            };

            n[ix] = {
                ...n[ix],
                x: newData.position?.x || 0,
                y: newData.position?.y || 0,
                rotation: newData.rotation,
                width: newData.size?.width,
                height: newData.size?.height
            }

            updateHMINode(id, {
                x: n[ix].x,
                y: n[ix].y,
                rotation: n[ix].rotation,
                width: n[ix].width,
                height: n[ix].height
            })

            return n
        })

      
    }


    return (
        <HMIContext.Provider
            value={{
                programId: id,
                actions: activeProgram?.actions,
                interfaces: program?.interface || [],
                refetch,
                selected,
                tags: program?.tags || [],
                types: program?.types || [],
                templates: program?.templates || [],
                nodes: nodes,
                updateNode
            }}>
            <Box
                sx={{
                    display: 'flex',
                    flex: 1,
                    position: 'relative',
                }}>

                {(<InfiniteCanvas
                    style={CanvasStyle}
                    // snapToGrid={true}
                    showGuides
                    grid={{divisions: 20, width: 100, height: 100}}
                    onDelete={watchEditorKeys}
                    selected={(selected ? [selected] : undefined) as any}
                    onSelect={(key, id) => {
                        setSelected({
                            key,
                            id
                        })
                    }}
                    menu={ (<Collapse
                        in={Boolean(menuOpen)}
                        orientation="horizontal"
                        sx={{
                            display: 'flex',
                            height: '100%',
                            flexDirection: 'column'
                        }}>
                        <HMIDrawer
                            menu={menuOpen}
                            nodes={hmiTemplatePacks || []}
                        />
                    </Collapse>)}
                    editable={true}
                    nodes={nodes}
                    paths={paths}
                    factories={[HMINodeFactory(true), LinePathFactory(false)]}
                    onPathCreate={(path: any) => {

                        setPaths((paths) => {
                            let p = paths.slice();
                            path.type = 'line';
                            path.draft = true;
                            p.push(path)
                            return p;
                        })
                        // updateRef.current?.addPath(path);
                    }}
                    onPathUpdate={(path: any) => {

                        console.log("Path Update", {path})

                        if (path.source && path.target && path.targetHandle) {

                            let p = paths.slice()
                            let ix = p.map((x) => x.id).indexOf(path.id)
                            if (ix > -1) { 
                                (p[ix] as any).draft = false;
                                setPaths(p)
                            }

                            let sourceHandle = typeof(path.sourceHandle) == 'string' ? path.sourceHandle : undefined;
                            let targetHandle = typeof(path.targetHandle) == 'string' ? path.targetHandle : undefined;
                            let sourcePoint = typeof(path.sourceHandle) == 'string' ? undefined : path.sourceHandle;
                            let targetPoint = typeof(path.targetHandle) == 'string' ? undefined : path.targetHandle;

                            let node = nodes.find((a) => a.id == path.target);

                            if(targetPoint && (node?.extras?.ports?.length > 0)) return;

                                if (!path.draft) {
                                    updateHMIEdge(
                                        path.id,
                                        path.source,
                                        sourceHandle,
                                        sourcePoint,
                                        path.target,
                                        targetHandle,
                                        targetPoint,
                                        path.points
                                    ).then(() => {
                                        refetch()
                                    })
                                } else {
                                    createHMIEdge(
                                        path.source,
                                        sourceHandle,
                                        sourcePoint,
                                        path.target,
                                        targetHandle,
                                        targetPoint,
                                        path.points
                                    ).then(() => {
                                        refetch()
                                    })
                                }
                                // connectHMINode(
                                //     (path as any).draft ? undefined : path.id,
                                //     path.source,
                                //     path.sourceHandle,
                                //     path.target,
                                //     path.targetHandle,
                                //     path.points
                                // ).then(() => {

                                //     refetch()
                                // })

                        }else{
                            console.log({path})
                        }

                        setPaths((paths) => {
                            let p = paths.slice();
                            let ix = p.map((x) => x.id).indexOf(path.id)
                            path.type = 'line';
                            p[ix] = path;
                            return p;
                        })


                        // updateRef.current?.updatePath(path)
                    }}
                    onNodeUpdate={(node) => {
                        let n = nodes.slice()
                        let ix = n.map((x) => x.id).indexOf(node.id)
                        n[ix] = node;
                        setNodes(n)

                        console.log({node});

                        setSelected({
                            key: 'node',
                            id: node.id
                        })

                            updateHMINode(
                                node.id,
                                {
                                    x: node.x,
                                    y: node.y,
                                    width: node.width,
                                    height: node.height,
                                    rotation: node.rotation
                                }
                            ).then(() => {
                                refetch()
                            })
                
                    }}
                    onNodeCreate={(position, data) => {

                        createHMINode(
                            `${data.extras.pack}:${data.extras?.name}`,
                            position.x,
                            position.y,
                        ).then(() => {
                            refetch()
                        })

                    }}
                >

                    <ZoomControls anchor={{ vertical: 'bottom', horizontal: 'right' }} />
                </InfiniteCanvas>)}

                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: 'secondary.main',
                    color: 'white'
                }}>
                    <div style={{background: menuOpen == 'nodes' ? '#dfdfdfdf' : undefined}}>
                    <IconButton
                        sx={{color: 'white'}}
                        onClick={() => changeMenu('nodes')}>
                        <Nodes />
                    </IconButton>
                    </div>
                    <div style={{background: menuOpen === 'template' ? '#dfdfdfdf' :undefined}}>
                        <IconButton 
                            sx={{color: 'white'}}
                            onClick={() => changeMenu('template')}>
                                <Assignment style={{fill: 'white'}} width="24px" />
                        </IconButton>
                    </div>
                    <div style={{background: menuOpen == 'config' ? '#dfdfdfdf' : undefined}}>
                    <IconButton
                        sx={{color: 'white'}}
                        onClick={() => changeMenu('config')}
                    >
                        <Settings style={{fill: 'white'}} width="24px" />

                    </IconButton>
                    </div>
           
                </Box>
            </Box>
        </HMIContext.Provider>
    )
}