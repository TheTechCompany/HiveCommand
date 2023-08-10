import { Box, Collapse, IconButton, Paper } from "@mui/material";
import { GridView as Nodes, Construction as Action, Assignment } from '@mui/icons-material'

import React, { useEffect, useMemo, useState } from "react";
import { EditorCanvas } from "./canvas";
import { ReactFlowProvider, useNodesState, useEdgesState, Node, Edge } from 'reactflow';
import { DragOverlay, DndContext } from '@dnd-kit/core';
import { snapCenterToCursor } from '@dnd-kit/modifiers';
import { HMIContext } from "./context";
import { nanoid } from 'nanoid'
import { HMIDrawer } from "./drawer";
import Settings from "./icons/Settings";

export interface SurfaceEditorProps {
    nodePacks: {
        id: string;
        pack: {name: string, component: any}[]
    }[]

    id: string;
    activeProgram: any;

    program: any;

    hmiTemplatePacks: any;

    nodes?: any[];
    edges?: any[];

    onNodesChanged?: (nodes: any[]) => void;
    onEdgesChanged?: (edges: any[]) => void;

    loading: boolean;
    packsDownloaded: boolean;
}

export const SurfaceEditor : React.FC<SurfaceEditorProps> = (props) => {

    const { nodePacks, program, hmiTemplatePacks, id, activeProgram, onNodesChanged, onEdgesChanged, loading, packsDownloaded } = props;

    const [menuOpen, openMenu] = useState<string | undefined>(undefined);

    const [nodes, setNodes, onNodesChange] = useNodesState([])
    const [edges, setEdges, onPathsChange] = useEdgesState([])

    const [selection, setSelection] = useState<{
        nodes: Node[],
        edges: Edge[]
    }>({
        nodes: [],
        edges: []
    })

    const [ activeId, setActiveId ] = useState<any>(null)
    const [ currPosition, setCurrPosition ] = useState<any>(null);

    const ActiveComponent = useMemo(() => {
        return activeId ? nodePacks?.find((a) => a?.id == activeId?.split(':')?.[0])?.pack?.find((a) => a.name == activeId?.split(':')?.[1])?.component : null
    }, [activeId])


    const changeMenu = (view: string) => {
        openMenu(view == menuOpen ? undefined : view)
    }


    useEffect(() => {
        if (program && packsDownloaded) {

            // console.log({nodes})
            Promise.all((props.nodes || []).map(async (node: any) => {

                const [packId, templateName] = (node.type || '').split(':')
                // const url = templatePacks.find((a) => a.id == packId)?.url;

                // if (url) {
                  
                    const {pack} = nodePacks.find((a) => a.id == packId) || {}

                    const item = pack?.find((a) => a.name == templateName);

                    return {
                        ...node,
                        metadata: item?.component?.metadata,
                        icon: item?.component
                    }
                // }

                // return node;
                // return pack

            })).then((nodes) => {
                // console.log("ASD", {nodes})


                setNodes(nodes.map((x: any) => {
                    let width = x.width || x?.icon?.metadata?.width //|| x.type.width ? x.type.width : 50;
                    let height = x.height || x?.icon?.metadata?.height //|| x.type.height ? x.type.height : 50;
                    //x.width ||
                    //x.height || 
                    let scaleX = x.width / width;
                    let scaleY = x.height / height;

                    if (x?.icon?.metadata?.maintainAspect) scaleY = scaleX;


                    let extraOptions = x.icon?.metadata?.options || {};
                    let nodeOptions = x.options;

                    let node = {
                        id: x.id,
                        type: 'hmi-node',
                        position: {
                            x: x.x,
                            y: x.y,
                        },
                        data: {
                            type: x.type,
                            width,
                            height,
                            zIndex: x.zIndex != undefined ? x.zIndex : 1,
                            scaleX: x.scaleX != undefined ? x.scaleX : 1,
                            scaleY: x.scaleY != undefined ? x.scaleY : 1,
                            rotation: x.rotation || 0,

                            options: x.options,
                            templateOptions: x.dataTransformer?.configuration || [],

                            metadata: x.metadata,

                            icon: x.icon,
                            ports: x?.icon?.metadata?.ports?.map((y: any) => ({ ...y, id: y.key })) || []
                        },

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
                        },
                        // type: 'hmi-node',

                    };

                    // let values = Object.keys(extraOptions).map((optionKey) => {
                    //     let optionValue = nodeOptions?.[optionKey]

                    //     let parsedValue : any;

                    //     try{
                    //         // console.log({nodeValue: nodeInputValues.current.values[node.id]})
                    //         parsedValue = getOptionValues(node, tags, components, {} as any, {}, {values: {}}, {values: {}}, {values: {}}, (values: any) => {}, optionKey, optionValue);
                    //     }catch(e){
                    //         console.log({e, node, optionKey});
                    //     }

                    //     return {key: optionKey, value: parsedValue}

                    // }).reduce((prev, curr) => ({
                    //     ...prev,
                    //     [curr.key]: curr.value
                    // }), {});

                    // (node.extras as any).dataValue = values;


                    return node;
                }))
                // setNodes(nodes);
            })

            setEdges((props.edges || []).map((x: any) => {
                return {
                    id: x.id,
                    ...x,
                    type: 'line-path',

                    // source: x?.from?.id,
                    // sourceHandle: x.fromPoint || x.fromHandle,
                    // target: x?.to?.id,
                    // targetHandle: x.toPoint || x.toHandle,
                    data: {
                        points: x.points
                    }
                }
            }).reduce((prev, curr) => {
                return prev.concat(curr)
            }, []))
        }

    }, [props.nodes, props.edges, nodePacks, program, packsDownloaded])


    return (
        <DndContext
            modifiers={[snapCenterToCursor]}
            onDragStart={(event) => {

                setActiveId(event.active.id);
            }}
            onDragMove={(event) => {
                setCurrPosition(event.active.rect.current.translated)
            }}
            onDragEnd={(event) => {

                setCurrPosition(null);
                setActiveId(null);



                if (event.over?.id == 'canvas') {
                    let n = program?.nodes.slice();
                    n.push({
                        id: nanoid(),
                        type: event.active.id.toString(),
                        x: currPosition.left - (event.over?.rect.left || 0),
                        y: currPosition.top - (event.over?.rect.top || 0)

                    })
                    onNodesChanged?.(n)
                }
            }}>
            <HMIContext.Provider
                value={{
                    programId: id,
                    actions: activeProgram?.actions,
                    interfaces: program?.interface || [],
                    selected: selection,
                    setSelected: setSelection,
                    tags: program?.tags || [],
                    types: program?.types || [],
                    templates: program?.templates || [],
                    nodes: nodes,
                    // updateNode
                }}>
                <ReactFlowProvider>
                    <Box
                        sx={{
                            display: 'flex',
                            flex: 1,
                            position: 'relative',
                        }}>
                        <EditorCanvas
                            dragNode={
                                currPosition
                            }
                            id={!loading && props.activeProgram}
                            nodes={nodes}
                            edges={edges}
                            onNodesChange={(nodes) => {
                                console.log("nodesChanged", nodes)
                                onNodesChanged?.(nodes)
                            }}
                            onEdgesChange={(edges) => {
                                console.log("edgesChanged", edges)
                                onEdgesChanged?.(edges)
                            }}
                        />
                        <DragOverlay>
                            {ActiveComponent ? (
                                <Box sx={{
                                    width: ActiveComponent?.metadata?.width,
                                    height: ActiveComponent?.metadata?.height
                                }}>
                                    <ActiveComponent options={{}} />
                                </Box>
                            ) : null}
                        </DragOverlay>
                        <Box>
                            <Collapse
                                in={Boolean(menuOpen)}
                                orientation="horizontal"
                                sx={{
                                    display: 'flex',
                                    height: '100%',
                                    minWidth: '250px',
                                    flexDirection: 'column'
                                }}>
                                <Paper sx={{
                                    flex: 1,
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    minWidth: '250px',
                                    borderTopRightRadius: 0,
                                    borderBottomRightRadius: 0,
                                    overflow: 'visible'
                                }}>
                                    <HMIDrawer
                                        menu={menuOpen}
                                        nodes={hmiTemplatePacks || []}
                                    />
                                </Paper>
                            </Collapse>
                        </Box>
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            bgcolor: 'secondary.main',
                            color: 'white'
                        }}>
                            <div style={{ background: menuOpen == 'nodes' ? '#dfdfdfdf' : undefined }}>
                                <IconButton
                                    sx={{ color: 'white' }}
                                    onClick={() => changeMenu('nodes')}>
                                    <Nodes />
                                </IconButton>
                            </div>
                            <div style={{ background: menuOpen === 'template' ? '#dfdfdfdf' : undefined }}>
                                <IconButton
                                    sx={{ color: 'white' }}
                                    onClick={() => changeMenu('template')}>
                                    <Assignment style={{ fill: 'white' }} width="24px" />
                                </IconButton>
                            </div>
                            <div style={{ background: menuOpen == 'config' ? '#dfdfdfdf' : undefined }}>
                                <IconButton
                                    sx={{ color: 'white' }}
                                    onClick={() => changeMenu('config')}
                                >
                                    <Settings style={{ fill: 'white' }} width="24px" />

                                </IconButton>
                            </div>

                        </Box>
                    </Box>
                </ReactFlowProvider>

            </HMIContext.Provider>
        </DndContext>
    )
}