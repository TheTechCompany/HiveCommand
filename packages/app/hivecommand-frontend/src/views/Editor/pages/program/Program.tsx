import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, Collapsible, List, Text } from 'grommet';
import { useConnectProgramNode, useCreateProgramFlow, useCreateProgramNode, useDeleteProgramFlow, useDeleteProgramNodes, useDisconnectProgramNode, useUpdateProgramFlow, useUpdateProgramNode } from '@hive-command/api';

import { IconNodeFactory, InfiniteCanvasNode, InfiniteCanvas, ZoomControls, InfiniteCanvasPath, HyperTree } from '@hexhive/ui';
import { HMINodeFactory } from '@hive-command/canvas-nodes';
import { nanoid } from 'nanoid';
import { NodeDropdown } from '../../../../components/node-dropdown';
import { SubdirectoryArrowRight as Connect, GridView as Action, PlayArrow as Trigger, PowerSettingsNew as PowerShutdown, Add, Timer } from '@mui/icons-material';
import { gql, useApolloClient, useQuery } from '@apollo/client';
import { ProgramCanvas } from '../../../../components/program-canvas';

import { ChevronRight, ExpandMore } from '@mui/icons-material'

import Settings from './Settings';
import { ProgramEditorProvider } from './context';
import { ProgramDrawer } from './Drawer';
import { useEditor } from './store';
import { debounce, pick } from 'lodash';
import { useParams } from 'react-router-dom';
import { useCommandEditor } from '../../context';
import { ProgramCanvasModal } from '../../../../components/modals/program-canvas';
import { ObjectTypeDefinitionNode } from 'graphql';
import { cleanTree } from '../../utils';
import { EmptyView } from '../../components/empty-view';
import { TreeItem, TreeView } from '@mui/lab';
import { TreeMenu } from '../../components/tree-menu';
import { ProgramFlowModal } from '../../../../components/modals/program-flow';

import { ACTION_TYPES } from '@hive-command/data-types'
import { IconMap } from '../../../../asset-map';

const reducer = (state, action) => {
    switch (action.type) {
        case 'ADD_NODE':
            let newNode = action.data;

            return { ...state, nodes: [...state.nodes, newNode] }
            break;
        default:
            return state;
    }
}

export const Program : React.FC<{activeProgram: string}> = (props) => {


    const { sidebarOpen, refetch: refetchProgram } = useCommandEditor()

    const [ selectedItem, setSelectedItem ] = useState<{id?: string} | undefined>(undefined)
    const [ parentItem, setParentItem ] = useState<{id?: string} | undefined>(undefined)
    
    // const [ activeProgram, setActiveProgram ] = useState<string>(undefined)

    const { activeProgram } = props;

    const createProgramFlow = useCreateProgramFlow(activeProgram)
    const updateProgramFlow = useUpdateProgramFlow(activeProgram);
    const deleteProgramFlow = useDeleteProgramFlow(activeProgram);

    const [state, dispatch] = useEditor(reducer, {
        nodes: [],
        paths: []
    })

    const [conditions, setConditions] = useState<any[]>([])
    const [modalOpen, openModal] = useState<boolean>(false);

    const [selected, _setSelected] = useState<{ key?: "node" | "path", id?: string }>({})
    const selectedRef = useRef<{ selected?: { key?: "node" | "path", id?: string } }>({})
    const setSelected = (s: { key?: "node" | "path", id?: string }) => {
        _setSelected(s)
        selectedRef.current.selected = s;
    }

    const [nodes, setNodes] = useState<InfiniteCanvasNode[]>([])
    const [paths, setPaths] = useState<InfiniteCanvasPath[]>([])

    const client = useApolloClient()

    const nodeMenu = [
        {
            icon: IconMap[ACTION_TYPES.ACTION]?.icon,
            label: IconMap[ACTION_TYPES.ACTION]?.label,
            extras: {
                type: ACTION_TYPES.ACTION,
                // label: "Action",
                // icon: 'Action'
            },
        },
        {
            icon: IconMap[ACTION_TYPES.TRIGGER]?.icon,
            label:  IconMap[ACTION_TYPES.TRIGGER]?.label,
            extras: {
                type: ACTION_TYPES.TRIGGER,
                // label: "Trigger",
                // icon: 'Trigger'
            }
        },
        {
            icon: IconMap[ACTION_TYPES.SHUTDOWN_TRIGGER]?.icon,
            label: IconMap[ACTION_TYPES.SHUTDOWN_TRIGGER]?.label,
            extras: {
                type: ACTION_TYPES.SHUTDOWN_TRIGGER,
                // label: "Shutdown",
                // icon: "PowerShutdown"
            }
        },
        // {
        //     icon: <Cycle />,
        //     label: "PID",
        //     extras: {
        //         label: "PID",
        //         icon: "Cycle"
        //     }
        // },
        {
            icon: IconMap[ACTION_TYPES.TIMER]?.icon,
            label: IconMap[ACTION_TYPES.TIMER]?.label,
            extras: {
                type: ACTION_TYPES.TIMER,
                // label: "Timer",
                // icon: "Clock"
            }
        },
   
    ]

    const { data: flowData } = useQuery(gql`
        query FlowData ($program: ID){ 
            commandProgramFlows (where: {id: $program}) {
                    id
                    name

                    children {
                        id
                        name
                    }

                    parent {
                        id
                    }


                    edges {
                        id

                        from {
                            id
                        }
                        fromHandle
                        
                        to {
                            id
                        }

                        conditions {
                            id

                            inputDevice {
                                id
                                name
                            }
                            inputDeviceKey {
                                id
                                key
                            }
                            comparator
                            assertion {
                                id
                                type
                                value
                                setpoint {
                                    id
                                    name
                                    value
                                }
                                variable {
                                    id
                                    name
                                    value
                                }
                            }
                        }

                        toHandle

                        points{
                            x
                            y
                        }
                    }

                    nodes {
                        id
                        type
                        x 
                        y

                        inputs {
                            id
                        }
                        
                        outputs {
                            id
                        }

                        subprocess {
                            id
                            name
                        }

                        timer {
                            unit
                            value
                        }

                        actions {
                            id
                            release

                            device {
                                id
                                name
                            }
                            request {
                                id
                                key
                            }
                        }
                        configuration {
                            id
                            key
                            
                            value
                        }

                    
                    }
                
            }
        }

    `, {
        variables: {
            program: activeProgram
        }
    });
    

    const { data } = useQuery(gql`
    query ProgramEditor ($id: ID){
        commandPrograms(where: {id: $id}){
            id
            name

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
            }

            devices {
                id
                name
                requiresMutex

                setpoints {
                    id
                    name
                }

                type {
                    id
                    name
                    state {
                        id
                        key
                        type
                    }
                    actions {
                        id
                        key
                    }
                }
            }

        }

    
    }
`, {
        variables: {
            id: activeProgram,
        }
    })

    const refetch = () => {
        client.refetchQueries({ include: ['ProgramEditor', 'FlowData'] })
    }

    let flow = flowData?.commandProgramFlows?.[0]

    const program = data?.commandPrograms?.[0];

    const createProgramNode = useCreateProgramNode(activeProgram, activeProgram, flow?.parent?.id)
    const updateProgramNode = useUpdateProgramNode(activeProgram, activeProgram, flow?.parent?.id)
    const deleteProgramNodes = useDeleteProgramNodes(activeProgram, activeProgram, flow?.parent?.id)
    const connectProgramNode = useConnectProgramNode(activeProgram, activeProgram, flow?.parent?.id)
    const disconnectProgramNode = useDisconnectProgramNode(activeProgram, activeProgram, flow?.parent?.id)

    useEffect(() => {
        if (flow && activeProgram) {
            setNodes(flow.nodes.map((x) => ({
                id: x.id,
                x: x.x,
                y: x.y,
                extras: {
                    type: x.type,
                    icon: IconMap[x.type]?.icon,
                    label: x.subprocess?.name,
                    configuration: [
                        { key: "timer", value: x.timer },
                        { key: "actions", value: x.actions }
                    ]
                    // actions: x.actions
                },
                type: 'icon-node'

            })))

            
            setPaths(flow?.edges?.map((conn) => {
                return {
                    id: conn.id,
                    source: conn.from?.id,
                    sourceHandle: conn.fromHandle,
                    target: conn.to?.id,
                    targetHandle: conn.toHandle,
                    points: conn.points,
                    extras: {
                        conditions: conn.conditions,
                        configuration: {
                            conditions: conn.conditions
                        }
                    }
                }
            }))
        }
    }, [flow, activeProgram])


    // const [addNode, addInfo] = useMutation((mutation, args: { type: string, x: number, y: number, subprocess?: string}) => {
    //     let createNode : any = {
       
    //             type: args.type,
    //             x: args.x,
    //             y: args.y,
            
    //     }

    //     if(args.type == "Connect" && args.subprocess){
    //         console.log("CoNFIG")
    //         createNode.subprocess = {
    //             connect: {where: {node: {id: args.subprocess}}}
    //         }
    //     }
    //     const program = mutation.updateCommandProgramFlows({
    //         where: { id: activeProgram },
    //         update: {
    //                 nodes: [{
    //                     create: [{
    //                        node: createNode
    //                     }]
    //                 }]
    //         }

    //     })
    //     return {
    //         item: {
    //             ...program.commandProgramFlows[0]
    //         }
    //     }
    // })


    // const [updateNode, updateInfo] = useMutation((mutation, args: {
    //     id: string,
    //     x?: number,
    //     y?: number
    // }) => {

    //     let update: any = {};

    //     if (args.x) update.x = args.x;
    //     if (args.y) update.y = args.y;

    //     const updated = mutation.updateCommandProgramNodes({
    //         where: { id: args.id },
    //         update: {
    //             x: args.x,
    //             y: args.y
    //         }
    //     })
    //     return {
    //         item: {
    //             ...updated.commandProgramNodes[0]
    //         }
    //     }
    // });


    const deleteSelected = async (selected: { type: "node" | "path", id: string }[]) => {

        let queries = [];

        let query: any = {};
        let nodes = selected.filter((a) => a.type == "node").map((x) => x.id)
        let _paths = selected.filter((a) => a.type == "path").map((x) => x.id)

        let disconnectInfo: any = {};
        let deleteInfo: any = {};
        if (_paths.length > 0) {
            let path = paths.find((a) => a.id == _paths[0]);

            queries.push(
                disconnectProgramNode(_paths[0]) //, path.sourceHandle, path.target, path.targetHandle)
            )
    
            // return {
            //     item: {
            //         ...disconnectInfo.commandProgramNodes?.[0]
            //     }
            // }
        }
        if (nodes.length > 0) {
            query = {
                id_IN: nodes,
            }

            queries.push(
                deleteProgramNodes(nodes)
            )

        }
        return await Promise.all(queries)
    }

    // const [connectNodes, connectInfo] = useMutation((mutation, args: {
    //     source: string,
    //     sourceHandle: string,
    //     target: string,
    //     targetHandle: string,
    //     points?: { x: number, y: number }[]
    // }) => {
    //     const updated = mutation.updateCommandProgramNodes({
    //         where: { id: args.source },
    //         update: {
    //             next: [{
    //                 connect: [{
    //                     where: {
    //                         node: {
    //                             id: args.target
    //                         }
    //                     }, edge: {
    //                         sourceHandle: args.sourceHandle,
    //                         targetHandle: args.targetHandle,
    //                         points: args.points.map((x) => pick(x, ['x', 'y']))
    //                     }
    //                 }]
    //             }]
    //         }
    //     })
    //     return {
    //         item: {
    //             ...updated.commandProgramNodes[0]
    //         }
    //     }
    // })

    const renderSelectedSettings = () => {
        if (!selected || selected.key != 'node') return;

        let node = nodes.find((a) => a.id == selected.id)

        switch (node?.extras?.icon) {
            case 'Cycle':
                return (
                    <Box flex>
                        <Box
                            align="center"
                            direction="row">
                            <Text>PID</Text>

                            <Button
                                size="small"
                                icon={<Add />} />
                        </Box>

                    </Box>
                )
            case 'Action':
                return (
                    <Box flex>
                        <Box
                            align="center"
                            justify="between"
                            direction="row">
                            <Text>Actions</Text>
                            <Button
                                onClick={() => openModal(true)}
                                hoverIndicator
                                icon={<Add />} />
                        </Box>
                        <Box>
                            <List

                                data={node.extras.actions || []}>
                                {(datum) => (
                                    <Text size="small">{datum.device.name} - {datum.request.key}</Text>
                                )}
                            </List>
                        </Box>
                    </Box>
                )
            case 'Trigger':
                return (<Text>Triggers</Text>)
        }

    }



    const watchEditorKeys = () => {
        if (selectedRef.current.selected.id) {
            deleteSelected([selectedRef.current.selected].map((x) => ({
                        type: x.key,
                        id: x.id
                    }))
            ).then(() => {
                refetch()
            })
        }

    }


    const devices = data?.commandPrograms?.[0]?.devices || []
    const variables = data?.commandPrograms?.[0]?.variables || [];


    const tree = useMemo(() => {
        console.log({program: program?.program})
        return cleanTree(program?.program)
    }, [program])


    useEffect(() => {
        setConditions(flow?.conditions)
    }, [flow])

    console.log("Conditions", conditions)

    return (
        <ProgramEditorProvider
            value={{
                flow,
                refresh: refetch,
                devices,
                variables,
                program,
                activeProgram: activeProgram,
                selectedType: selected.key,
                selected: selected.key == 'node' ? nodes.find((a) => a.id == selected.id) : paths.find((a) => a.id == selected.id)
            }}
        >
            <Box flex direction='row'>         
                {activeProgram != undefined ? (
                <ProgramCanvas
                    onDelete={watchEditorKeys}
                    menu={[
                        {
                            key: 'nodes',
                            icon: <Action />,
                            panel: (
                                <NodeDropdown
                                    items={nodeMenu.concat(
                                        (flow?.children || []).map((x) => ({
                                            icon: IconMap[ACTION_TYPES.SUBPROCESS]?.icon,
                                            label: x.name,
                                            extras: {
                                                type: ACTION_TYPES.SUBPROCESS,
                                                subprocess: x.id
                                            }
                                        }))
                                    )}
                                />
                            )
                        },
                        {
                            key: 'settings',
                            icon: <Settings style={{fill:"white"}} width="24px" />,
                            panel: (
                                <ProgramDrawer />
                            )
                        }
                    ]}
                    selected={[selected]}
                    onSelect={(selected) => {
                        setSelected(selected)
                    }}

                    onNodeCreate={(position, node) => {
                        console.log("Node create", node)
                        // dispatch({type: "ADD_NODE", data: {
                        //     x: position.x,
                        //     y: position.y,
                        //     type: node.extras.icon
                        // }})

                        createProgramNode(
                            node.extras.type, 
                            position.x, 
                            position.y, 
                            node.extras.subprocess
                        ).then(() => {
                            refetch()
                        })
                    }}
                    onNodeUpdate={(node) => {
                        updateProgramNode(
                            node.id,
                            node.x,
                            node.y
                        ).then(() => {
                            refetch()
                        })
                    }}

                    onPathCreate={(path) => {

                        // connectProgramNode(
                        //     path.source,
                        //     path.sourceHandle,
                        //     path.target,
                        //     path.targetHandle,
                        //     path.points,
                        //     path.id != 'temp' && path.id
                        // ).then(() => {
                        //     refetch()
                        // })
                    }}

                    nodes={nodes}
                    paths={paths}
                />) : (
                    <EmptyView label={"program"} />
                )}
            </Box>
        </ProgramEditorProvider>

    )
}