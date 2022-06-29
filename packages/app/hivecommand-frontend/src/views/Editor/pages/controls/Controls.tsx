import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Box, Text, List, Button, Collapsible, TextInput, Select, CheckBox } from 'grommet'
import { InfiniteCanvas, ContextMenu, IconNodeFactory, InfiniteCanvasNode, ZoomControls, InfiniteCanvasPath, BumpInput, HyperTree } from '@hexhive/ui';
import { HMINodeFactory } from '../../../../components/hmi-node/HMINodeFactory';
import { NodeDropdown } from '../../../../components/node-dropdown';
import { gql, useApolloClient, useQuery } from '@apollo/client';
import * as HMIIcons from '../../../../assets/hmi-elements'
import { GridView as Nodes, Construction as Action } from '@mui/icons-material'
import Settings from './Settings'
import { nanoid } from 'nanoid';
import { pick } from 'lodash';
import { throttle } from 'lodash';
import { HMIGroupModal } from '../../../../components/modals/hmi-group';
import { debounce } from 'lodash';
import { AssignFlowModal } from '../../../../components/modals/assign-flow';
import { useParams } from 'react-router-dom';
import { useAssignHMINode, useCreateHMIAction, useCreateHMINode, useCreateProgramHMI, useUpdateHMIGroup, useDeleteHMINode, useDeleteHMIPath, useDeleteHMIAction, useUpdateHMINode, useCreateHMIPath, useUpdateHMIPath } from '@hive-command/api';
import { useCommandEditor } from '../../context';
import { cleanTree } from '../../utils';
import { ObjectTypeDefinitionNode } from 'graphql';
import { ProgramCanvasModal } from '../../../../components/modals/program-canvas';
import { EmptyView } from '../../components/empty-view';
import { HMIDrawer } from './Drawer';
import { HMIContext } from './context';
import NodeMenu from './NodeMenu';
import { CanvasStyle } from '../../../../style';

export const Controls = (props) => {

    const { id } = useParams()

    const { sidebarOpen } = useCommandEditor()

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
    const [paths, _setPaths] = useState<InfiniteCanvasPath[]>([])

    const pathRef = useRef<{ paths: InfiniteCanvasPath[] }>({ paths: [] })

    const setPaths = (paths: InfiniteCanvasPath[]) => {
        _setPaths(paths)
        pathRef.current.paths = paths;
    }

    const updateRef = useRef<{ addPath?: (path: any) => void, updatePath?: (path: any) => void }>({
        updatePath: (path) => {
            let p = pathRef.current.paths.slice()
            let ix = p.map((x) => x.id).indexOf(path.id)
            // if(path.sourceHandle && path.targetHandle){
            //     path.draft = false;
            // }
            p[ix] = path;
            setPaths(p)
        },
        addPath: (path) => {
            let p = pathRef.current.paths.slice()
            path.draft = true;
            p.push(path)
            setPaths(p)
        }
    })


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
                        to {
                          
                            id
                        
                        }
                        toHandle
                        points {
                            x
                            y
                        }
                    }
                    nodes {
                        
                        id
                        type {
                            name
                            width
                            height
                            ports {
                                key
                                x
                                y
                                rotation
                            }
                        }
                        devicePlaceholder {
                            id
                            name

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

                        showTotalizer
                        rotation
                        scaleX
                        scaleY

                        inputs {
                            id
                            type {
                                name
                            }
                        }

                        children {
                            id
                            type {
                                name
                                width
                                height
                            }
                            x
                            y

                            scaleX
                            scaleY
                            rotation

                            devicePlaceholder {
                                id
                                name
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
                    name
                    type {
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

    const refetch = () => {
        client.refetchQueries({ include: ['Q'] })
    }

    const createHMINode = useCreateHMINode(id)
    const updateHMINode = useUpdateHMINode(id)
    const deleteHMINode = useDeleteHMINode(id)


    const deleteHMIEdge = useDeleteHMIPath(id)
    const createHMIEdge = useCreateHMIPath(id)
    const updateHMIEdge = useUpdateHMIPath(id)

    // const updateHMIGroup = useUpdateHMIGroup()


    const canvasTemplates = data?.commandInterfaceDevices || [];

    const devices = data?.commandPrograms?.[0]?.devices
    const flows = data?.commandPrograms?.[0]?.program;
    let program = data?.commandPrograms?.[0]

    let activeProgram = (program?.interface)


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

            let activeProgram = (program.interface)
            let nodes = activeProgram?.nodes?.filter((a) => !a.children || a.children.length == 0) || []
            let groups = activeProgram?.nodes?.filter((a) => a.children && a.children.length > 0) || []

            setNodes(nodes.map((x) => ({
                id: x.id,
                x: x.x,
                y: x.y,
                width: x.type.width ? `${x.type.width}px` : '50px',
                height: x.type.height ? `${x.type.height}px` : '50px',
                //  width: `${x?.type?.width || 50}px`,
                // height: `${x?.type?.height || 50}px`,
                extras: {
                    devicePlaceholder: x.devicePlaceholder,
                    rotation: x.rotation || 0,
                    scaleX: x.scaleX != undefined ? x.scaleX : 1,
                    scaleY: x.scaleY != undefined ? x.scaleY : 1,
                    showTotalizer: x.showTotalizer || false,
                    iconString: x.type?.name,
                    icon: HMIIcons[x.type?.name],
                    ports: x?.type?.ports?.map((y) => ({ ...y, id: y.key })) || []
                },
                type: 'hmi-node',

            })).concat(groups.map((group) => ({
                id: group.id,
                x: group.x || 0,
                y: group.y || 0,
                type: 'hmi-node',
                extras: {
                    nodes: group.children?.map((x) => ({
                        id: x.id,
                        x: x.x,
                        y: x.y,
                        z: x.z,
                        width: x.type.width || 50,
                        height: x.type.height || 50,
                        scaleX: x.scaleX || 1,
                        scaleY: x.scaleY || 1,
                        rotation: x.rotation || 0,
                        type: x.type,
                        devicePlaceholder: x.devicePlaceholder,
                    })),
                    ports: group.ports?.map((x) => ({
                        ...x,
                        id: x.id,
                        x: x.x,
                        y: x.y,
                        length: x.length || 1,
                        rotation: x.rotation || 0,
                    }))
                }
            }))))

            console.log({intf: program.interface})
            setPaths((program.interface)?.edges?.map((x) => {
                return {
                    id: x.id,
                    source: x?.from?.id,
                    sourceHandle: x.fromHandle,
                    target: x?.to?.id,
                    targetHandle: x.toHandle,
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

    return (
        <HMIContext.Provider
            value={{
                programId: id,
                actions: activeProgram?.actions,
                flows: flows,
                refetch,
                selected,
                devices,
                nodes: nodes
            }}>
            <Box
                direction="row"
                flex>

                <ProgramCanvasModal
                    open={createModalOpen}
                    onSubmit={(item) => {
                        let parent = selectedItem.id !== 'root' ? selectedItem.id : undefined;
                        createProgramHMI(item.name, parent).then(() => {
                            refetch()
                        })


                        openCreateModal(false)
                    }}
                    onClose={() => {
                        setSelectedItem(undefined)
                        openCreateModal(false)
                    }}
                    modal={(gql`
                        type HMI {
                            name: String
                        }
                    `).definitions.find((a) => (a as ObjectTypeDefinitionNode).name.value == "HMI") as ObjectTypeDefinitionNode} />

                {(<InfiniteCanvas
                    style={CanvasStyle}
                    snapToGrid={true}
                    grid={{divisions: 20, width: 100, height: 100}}
                    onDelete={watchEditorKeys}
                    onSelect={(key, id) => {
                        console.log("Select", key, id)
                        setSelected({
                            key,
                            id
                        })
                    }}
                    menu={(<Collapsible
                        open={Boolean(menuOpen)}
                        direction="horizontal">
                        <HMIDrawer
                            menu={menuOpen}
                            nodes={nodeMenu}
                        />
                    </Collapsible>)}
                    editable={true}
                    nodes={nodes}
                    paths={pathRef.current.paths}
                    factories={[new HMINodeFactory(true)]}
                    onPathCreate={(path) => {
                        updateRef.current?.addPath(path);
                    }}
                    onPathUpdate={(path) => {
                        console.log("CREATE PATH", {path})

                        if (path.source && path.target && path.targetHandle) {

                            let p = paths.slice()
                            let ix = p.map((x) => x.id).indexOf(path.id)
                            if (ix > -1) {
                                (p[ix] as any).draft = false;
                                setPaths(p)
                            }

                                if (!path.draft) {
                                    updateHMIEdge(
                                        path.id,
                                        path.source,
                                        path.sourceHandle,
                                        path.target,
                                        path.targetHandle,
                                        path.points
                                    ).then(() => {
                                        refetch()
                                    })
                                } else {
                                    createHMIEdge(
                                        path.source,
                                        path.sourceHandle,
                                        path.target,
                                        path.targetHandle,
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

                        }

                        updateRef.current?.updatePath(path)
                    }}
                    onNodeUpdate={(node) => {
                        let n = nodes.slice()
                        let ix = n.map((x) => x.id).indexOf(node.id)
                        n[ix] = node;
                        setNodes(n)

                        setSelected({
                            key: 'node',
                            id: node.id
                        })

                            updateHMINode(
                                node.id,
                                {
                                    x: node.x,
                                    y: node.y
                                }
                            ).then(() => {
                                refetch()
                            })
                
                    }}
                    onNodeCreate={(position, data) => {
          
                        createHMINode(
                            data.extras?.id,
                            position.x,
                            position.y,
                        ).then(() => {
                            refetch()
                        })


                        data.extras.icon = HMIIcons[data.extras.icon]

                        setNodes([...nodes, {
                            id: nanoid(),
                            x: position.x,
                            y: position.y,
                            extras: {
                                icon: data.extras.icon,
                                rotation: 0
                            },
                            type: HMINodeFactory.TAG
                        }])
                    }}

                    onRightClick={(target, position) => {
                        setTarget(position)
                    }}
                >

                    <ZoomControls anchor={{ vertical: 'bottom', horizontal: 'right' }} />
                </InfiniteCanvas>)}

                <Box background="accent-1" >
                    <Button
                        active={menuOpen == 'nodes'}
                        onClick={() => changeMenu('nodes')}
                        hoverIndicator
                        icon={<Nodes  />} />
                    <Button
                        active={menuOpen == 'config'}
                        onClick={() => changeMenu('config')}
                        hoverIndicator
                        icon={<Settings width="24px" />} />
                    <Button
                        active={menuOpen == 'actions'}
                        onClick={() => changeMenu('actions')}
                        hoverIndicator
                        icon={<Action />} />
                </Box>
            </Box>
        </HMIContext.Provider>
    )
}