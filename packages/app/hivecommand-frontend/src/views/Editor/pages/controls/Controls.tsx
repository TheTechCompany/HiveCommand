import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Box, Button, Collapse, IconButton } from '@mui/material'
import { InfiniteCanvas, ContextMenu, IconNodeFactory, InfiniteCanvasNode, ZoomControls, InfiniteCanvasPath, BumpInput, HyperTree, InfiniteScrubber } from '@hexhive/ui';
import { HMINodeFactory } from '@hive-command/canvas-nodes';
import { gql, useApolloClient, useQuery } from '@apollo/client';
import * as HMIIcons from '../../../../assets/hmi-elements'
import { GridView as Nodes, Construction as Action } from '@mui/icons-material'
import Settings from './Settings'
import { useParams } from 'react-router-dom';
import { useAssignHMINode, useCreateHMIAction, useCreateHMINode, useCreateProgramHMI, useUpdateHMIGroup, useDeleteHMINode, useDeleteHMIPath, useDeleteHMIAction, useUpdateHMINode, useCreateHMIPath, useUpdateHMIPath } from '@hive-command/api';
import { useCommandEditor } from '../../context';
import { HMIDrawer } from './Drawer';
import { HMIContext, HMINodeData } from './context';
import NodeMenu from './NodeMenu';
import { CanvasStyle } from '../../../../style';
import { useRemoteComponents } from '../../../../hooks/remote-components';
import { size } from 'mathjs';
import { PipePathFactory } from "@hexhive/ui";

export const Controls = (props) => {

    const { id } = useParams()

    const { getPack } = useRemoteComponents()

    const { sidebarOpen, program: { templatePacks } } = useCommandEditor()

    const createProgramHMI = useCreateProgramHMI(id)

    const [selectedItem, setSelectedItem] = useState<{ id?: string } | undefined>(undefined)

    const [selected, _setSelected] = useState<{ key?: "node" | "path", id?: string }>({})

    const selectedRef = useRef<{ selected?: { key?: "node" | "path", id?: string } }>({})

    const setSelected = (s: { key?: "node" | "path", id?: string }) => {
        _setSelected(s)
        selectedRef.current.selected = s;
    }


    const [createModalOpen, openCreateModal] = useState(false);

    const [target, setTarget] = useState<{ x?: number, y?: number }>({})

    const [menuOpen, openMenu] = useState<string | undefined>(undefined);

    const [nodes, setNodes] = useState<InfiniteCanvasNode[]>([])
    const [paths, setPaths] = useState<InfiniteCanvasPath[]>([])

    // const pathRef = useRef<{ paths: InfiniteCanvasPath[] }>({ paths: [] })

    // const setPaths = (paths: InfiniteCanvasPath[]) => {
    //     _setPaths(paths)
    //     pathRef.current.paths = paths;
    // }

    // const updateRef = useRef<{ addPath?: (path: any) => void, updatePath?: (path: any) => void }>({
    //     updatePath: (path) => {

    //         console.log("Update path");
    //         let p = pathRef.current.paths.slice()
    //         let ix = p.map((x) => x.id).indexOf(path.id)
    //         // if(path.sourceHandle && path.targetHandle){
    //         //     path.draft = false;
    //         // }
    //         path.type = 'pipe-path';
    //         p[ix] = path;
    //         setPaths(p)
    //     },
    //     addPath: (path) => {

    //         console.log("Add Path");
    //         let p = pathRef.current.paths.slice()
    //         path.type = 'pipe-path';
    //         path.draft = true;
    //         p.push(path)
    //         setPaths(p)
    //     }
    // })


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

                    actions {
                        id
                        name
                    }

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

                        devicePlaceholder {
                            id
                            
                            tag

                            type {
                                tagPrefix
                            }

                            setpoints {
                                id
                                name
                                key {
                                    id
                                    key
                                }
                                value
                                type
                            }
                        }
                        x
                        y

                        zIndex

                        scaleX
                        scaleY

                        showTotalizer
                        rotation
                        
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

                            devicePlaceholder {
                                id
                                tag
                            }
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

                program {
                    id
                    name
                    children {
                        id
                        name
                    }
                }

                devices {
                    id
                    tag
                    type {
                        id
                        name
                        type
                        tagPrefix

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

    const createHMINode = useCreateHMINode(id, props.activeProgram)
    const updateHMINode = useUpdateHMINode(id)
    const deleteHMINode = useDeleteHMINode(id)


    const deleteHMIEdge = useDeleteHMIPath(id)
    const createHMIEdge = useCreateHMIPath(id, props.activeProgram)
    const updateHMIEdge = useUpdateHMIPath(id)

    // const updateHMIGroup = useUpdateHMIGroup()


    const canvasTemplates = data?.commandInterfaceDevices || [];

    // const devices = data?.commandPrograms?.[0]?.devices
    // const flows = data?.commandPrograms?.[0]?.program;
    const { program: flows, devices} = data?.commandPrograms?.[0] || {};

    let program = data?.commandPrograms?.[0]

    let hmiTemplatePacks = program?.templatePacks || [];

    let activeProgram = (program?.interface)?.find((a) => a.id == props.activeProgram)

    // console.log({templatePacks, data, program, activeProgram})


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
                const url = templatePacks.find((a) => a.id == packId)?.url;

                if(url){
                    let base = url.split('/');
                    let [url_slug] = base.splice(base.length -1, 1)
                    base = base.join('/');

                    const pack = await getPack(packId, `${base}/`, url_slug)

                    const item = pack.find((a) => a.name == templateName);

                    return {
                        ...node,
                        metadata: item?.metadata,
                        icon: item?.component
                    }
                }
                
                return node;
                // return pack

            })).then((nodes) => {
                // console.log("ASD", {nodes})


                setNodes(nodes.map((x) => {
                    let width =  x.width || x?.icon?.metadata?.width //|| x.type.width ? x.type.width : 50;
                    let height = x.height || x?.icon?.metadata?.height //|| x.type.height ? x.type.height : 50;
    //x.width ||
    //x.height || 
                    let scaleX = x.width / width;
                    let scaleY = x.height / height;

                    if(x?.icon?.metadata?.maintainAspect) scaleY = scaleX;


                    return {
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

                        //  width: `${x?.type?.width || 50}px`,
                        // height: `${x?.type?.height || 50}px`,
                        extras: {
                            options: x.icon?.metadata?.options || {},
                            devicePlaceholder: x.devicePlaceholder,
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
                }))
                // setNodes(nodes);
            })
            // setNodes(nodes.map((x) => ({
            //     id: x.id,
            //     x: x.x,
            //     y: x.y,
            //     width: x.type.width ? `${x.type.width}px` : '50px',
            //     height: x.type.height ? `${x.type.height}px` : '50px',
            //     //  width: `${x?.type?.width || 50}px`,
            //     // height: `${x?.type?.height || 50}px`,
            //     extras: {
            //         devicePlaceholder: x.devicePlaceholder,
            //         rotation: x.rotation || 0,
            //         scaleX: x.scaleX != undefined ? x.scaleX : 1,
            //         scaleY: x.scaleY != undefined ? x.scaleY : 1,
            //         showTotalizer: x.showTotalizer || false,
            //         iconString: x.type?.name,
            //         icon: HMIIcons[x.type?.name],
            //         ports: x?.type?.ports?.map((y) => ({ ...y, id: y.key })) || []
            //     },
            //     type: 'hmi-node',

            // })).concat(groups.map((group) => ({
            //     id: group.id,
            //     x: group.x || 0,
            //     y: group.y || 0,
            //     type: 'hmi-node',
            //     extras: {
            //         nodes: group.children?.map((x) => ({
            //             id: x.id,
            //             x: x.x,
            //             y: x.y,
            //             z: x.z,
            //             width: x.type.width || 50,
            //             height: x.type.height || 50,
            //             scaleX: x.scaleX || 1,
            //             scaleY: x.scaleY || 1,
            //             rotation: x.rotation || 0,
            //             type: x.type,
            //             devicePlaceholder: x.devicePlaceholder,
            //         })),
            //         ports: group.ports?.map((x) => ({
            //             ...x,
            //             id: x.id,
            //             x: x.x,
            //             y: x.y,
            //             length: x.length || 1,
            //             rotation: x.rotation || 0,
            //         }))
            //     }
            // }))))

            // console.log({intf: program.interface})
            setPaths(((activeProgram)?.edges || []).map((x) => {
                return {
                    id: x.id,
                    type: 'pipe-path',
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
    }, [data?.commandPrograms?.[0]])


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
                size: {width: n[ix].width, height: n[ix].height}
            };

            let newData = {
                ...nodeData,
                ...data(nodeData)
            };

            n[ix] = {
                ...n[ix],
                x: newData.position.x,
                y: newData.position.y,
                rotation: newData.rotation,
                width: newData.size.width,
                height: newData.size.height
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
                flows: flows,
                interfaces: program?.interface || [],
                refetch,
                selected,
                devices,
                nodes: nodes,
                updateNode
            }}>
            <Box
                sx={{
                    display: 'flex',
                    flex: 1,
                    position: 'relative',
                }}>

                <InfiniteScrubber time={new Date().getTime()} />
               
                {(<InfiniteCanvas
                    finite
                    style={CanvasStyle}
                    snapToGrid={true}
                    grid={{divisions: 20, width: 100, height: 100}}
                    onDelete={watchEditorKeys}
                    selected={selected ? [selected] : undefined}
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
                    factories={[HMINodeFactory(true), PipePathFactory]}
                    onPathCreate={(path) => {

                        setPaths((paths) => {
                            let p = paths.slice();
                            path.type = 'pipe-path';
                            path.draft = true;
                            p.push(path)
                            return p;
                        })
                        // updateRef.current?.addPath(path);
                    }}
                    onPathUpdate={(path) => {

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

                        // setPaths((paths) => {
                        //     let p = paths.slice();
                        //     let ix = p.map((x) => x.id).indexOf(path.id)
                        //     path.type = 'pipe-path';
                        //     p[ix] = path;
                        //     return p;
                        // })


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


                        // data.extras.icon = HMIIcons[data.extras.icon]

                        // setNodes([...nodes, {
                        //     id: nanoid(),
                        //     x: position.x,
                        //     y: position.y,
                        //     extras: {
                        //         icon: data.extras.icon,
                        //         rotation: 0
                        //     },
                        //     type: 'hmi-node'
                        // }])
                    }}

                    onRightClick={(target, position) => {
                        setTarget(position)
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
                    <div style={{background: menuOpen == 'config' ? '#dfdfdfdf' : undefined}}>
                    <IconButton
                        sx={{color: 'white'}}
                        onClick={() => changeMenu('config')}
                    >
                        <Settings style={{fill: 'white'}} width="24px" />

                    </IconButton>
                    </div>
                    {/* <div style={{background: menuOpen == 'actions' ? '#dfdfdfdf' : undefined}}>
                    <IconButton
                        sx={{color: 'white'}}
                        onClick={() => changeMenu('actions')}
                    >
                        <Action />
                    </IconButton>
                    </div> */}
                </Box>
            </Box>
        </HMIContext.Provider>
    )
}