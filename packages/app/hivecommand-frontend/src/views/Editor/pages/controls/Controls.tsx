import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Box, Button, Collapse, IconButton, Paper } from '@mui/material'
import { InfiniteCanvas, ContextMenu, IconNodeFactory, InfiniteCanvasNode, ZoomControls, InfiniteCanvasPath, BumpInput, HyperTree, InfiniteScrubber, LinePathFactory } from '@hexhive/ui';
import { gql, useApolloClient, useMutation, useQuery } from '@apollo/client';
import Settings from './Settings'
import { useParams } from 'react-router-dom';
import { useCreateHMINode, useDeleteHMINode, useDeleteHMIPath, useUpdateHMINode, useCreateHMIPath, useUpdateHMIPath } from '@hive-command/api';
import { useCommandEditor } from '../../context';
import { HMIContext, HMINodeData } from './context';

import { Node, Edge } from 'reactflow';
import { InterfaceEditor } from '@hive-command/interface-editor';

import { useRemoteComponents } from '@hive-command/remote-components';

import { debounce, throttle, merge } from 'lodash';
import { getOptionValues } from '@hive-command/interface-types';

export const Controls = (props) => {

    const { id = '', activeId = '' } = useParams()

    const { getPack } = useRemoteComponents()

    const { program: { templatePacks, tags, types, components } = {} } = useCommandEditor()

    const [selected, _setSelected] = useState<{ key?: "node" | "path", id?: string }>({})

    const selectedRef = useRef<{ selected?: { key?: "node" | "path", id?: string } }>({})

    const setSelected = (s: { key?: "node" | "path", id?: string }) => {
        _setSelected(s)
        selectedRef.current.selected = s;
    }


    const [nodes, setNodes] = useState<Node[]>([])
    const [edges, setEdges] = useState<Edge[]>([])


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

                            options

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
    const _updateHMINode = useUpdateHMINode(id)
    const deleteHMINode = useDeleteHMINode(id)


    const deleteHMIEdge = useDeleteHMIPath(id)
    const createHMIEdge = useCreateHMIPath(id, activeId)
    const updateHMIEdge = useUpdateHMIPath(id)

    const debounceUpdateHMINode = useMemo(() => {
        return debounce(_updateHMINode, 500)
    }, [_updateHMINode])

    const updateHMINode = (id: string, update: any) => {
        let n = nodes.slice();

            let ix = n.findIndex((a) => a.id == id)
            n[ix] = merge({}, nodes[ix], update)
        

        let node = n[ix]

        setNodes(n);

        debounceUpdateHMINode(id, {
            x: node.position.x,
            y: node.position.y,
            width: node.data?.width,
            height: node.data?.height,
            rotation: node.data?.rotation,
            options: node.data.configuredOptions,
            template: node.data.template,
            templateOptions: node.data.templateOptions

        })
    }

    let program = data?.commandPrograms?.[0] || {}

    let activeProgram = useMemo(() => (program?.interface)?.find((a) => a.id == activeId), [activeId, program]);

    const [loadedPacks, setLoadedPacks] = useState<any[]>([]);

    useEffect(() => {
        (async () => {
            let outputPacks: any[] = [];
            let packs = templatePacks || [];

            for (var i = 0; i < packs.length; i++) {
                let url = packs[i]?.url;
                if (url) {
                    let base: string | string[] = url.split('/');
                    let [url_slug] = base.splice(base.length - 1, 1)
                    base = base.join('/');

                    const pack = await getPack(packs[i].id, `${base}/`, url_slug)

                    outputPacks.push({id: packs[i].id, pack});
                }
            }
            setLoadedPacks(outputPacks);
        })();

    }, [templatePacks])

    useEffect(() => {
        let program = data?.commandPrograms?.[0]
        if (program) {

            let nodes = activeProgram?.nodes?.filter((a) => !a.children || a.children.length == 0) || []
            let groups = activeProgram?.nodes?.filter((a) => a.children && a.children.length > 0) || []

            // console.log({nodes})
            Promise.all(nodes.map(async (node) => {

                const [packId, templateName] = (node.type || '').split(':')

                const pack = loadedPacks.find((a) => a.id == packId)?.pack;

                const item = pack?.find((a) => a.name == templateName);

                return {
                    ...node,
                    metadata: item?.component?.metadata,
                    icon: item?.component
                }

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
                        position: {
                            x: x.x,
                            y: x.y,
                        },
                        data: {
                            width,
                            height,
                            zIndex: x.zIndex != undefined ? x.zIndex : 1,
                            scaleX: x.scaleX != undefined ? x.scaleX : 1,
                            scaleY: x.scaleY != undefined ? x.scaleY : 1,
                            rotation: x.rotation || 0,

                            options: x.icon?.metadata?.options || {},
                            configuredOptions: x.options,

                            template: x.dataTransformer?.template?.id,
                            templateOptions: x.dataTransformer?.options || [],

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
                        },

                        type: 'hmi-node',

                    }

                    let values = Object.keys(extraOptions).map((optionKey) => {
                        let optionValue = nodeOptions?.[optionKey]

                        let parsedValue: any;

                        try {
                            console.log({optionKey, optionValue})
                            parsedValue = getOptionValues(
                                {
                                    id: node.id,
                                    x: node.position.x,
                                    y: node.position.y,
                                    width: node.data.width,
                                    height: node.data.height,
                                    dataTransformer: x.dataTransformer
                                }, 
                                tags || [], 
                                components || [], 
                                {} as any, {}, 
                                { values: {} }, 
                                { values: {} }, 
                                { values: {} }, 
                                (values: any) => { }, 
                                optionKey, 
                                optionValue
                            );
                        } catch (e) {
                            console.log({ e, node, optionKey });
                        }

                        return { key: optionKey, value: parsedValue }

                    }).reduce((prev, curr) => ({
                        ...prev,
                        [curr.key]: curr.value
                    }), {});

                    (node.data as any).dataValue = values;

                    console.log({values})

                    return node;
                }))
                // setNodes(nodes);
            })

            setEdges(((activeProgram)?.edges || []).map((x) => {
                return {
                    id: x.id,
                    type: 'line',

                    source: x?.from?.id,
                    sourceHandle: x.fromHandle,// x.fromPoint ||
                    target: x?.to?.id,
                    targetHandle:  x.toHandle,//x.toPoint ||
                    data: {
                        points: x.points
                    }
                }
            }).reduce((prev, curr) => {
                return prev.concat(curr)
            }, []))
        }
    }, [data?.commandPrograms?.[0], activeProgram, loadedPacks])





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
            }}>
            <Box
                sx={{
                    display: 'flex',
                    flex: 1,
                    position: 'relative',
                }}>

                <InterfaceEditor
                    nodes={nodes}
                    edges={edges}
                    tags={program.tags}
                    templates={program.templates}
                    types={program.types}

                    packs={loadedPacks}
                    onNodeCreate={(node) => {
                        if(node.type)
                            createHMINode(node.type, node.position.x, node.position.y).then(() => {
                                refetch()
                            })

                    }}
                    onNodeUpdate={(node) => {
                        console.log("Update niode", node)
                        updateHMINode(
                            node.id,
                            node
                        )
            
                    }}
                    onNodeDelete={(nodes) => {
                        if(Array.isArray(nodes)){
                            Promise.all(nodes.map(async (n) => {
                                await deleteHMINode(n.id)
                            })).then(() => refetch());
                        }else{
                            deleteHMINode(nodes.id).then(() => refetch());
                        }
                    }}
                    onEdgeCreate={(connection) => {
                        if(connection.source && connection.sourceHandle && connection.target && connection.targetHandle){
                            createHMIEdge(
                                connection.source,
                                connection.sourceHandle,
                                {x: 0, y: 0}, //sourcePoint,
                                connection.target,
                                connection.targetHandle,
                                {x: 0, y: 0}, //targetPoint,
                                []
                                // path.points
                            ).then(() => {
                                refetch()
                            })
                        }
                    }}
                    onEdgeUpdate={(edge) => {
                        if(edge.id && edge.source && edge.sourceHandle &&  edge.target && edge.targetHandle)
                            updateHMIEdge(
                                edge.id,
                                edge.source,
                                edge.sourceHandle,
                                {x: 0, y: 0},
                                edge.target,
                                edge.targetHandle,
                                {x: 0, y: 0}, 
                                edge.data?.points || []
                            ).then(() => refetch())
                    }}
                    onEdgeDelete={(edges) => {
                        if(Array.isArray(edges)){
                            Promise.all(edges.map(async (e) => {
                                await deleteHMIEdge(e.id)
                            })).then(() => {
                                refetch()
                            })
                        }else{
                            deleteHMIEdge(edges.id).then(() => refetch())
                        }
                    }}
                />
               

            </Box>
        </HMIContext.Provider>
    )
}