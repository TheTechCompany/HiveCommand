import { nodeTypes, edgeTypes } from "@hive-command/canvas-nodes";
import React, { KeyboardEvent, useEffect, useMemo, useState } from "react";
import ReactFlow, { Node, Edge, Background, ConnectionMode, Controls, useOnSelectionChange, useNodesState, useEdgesState, Connection, NodePositionChange, useReactFlow, useNodesInitialized } from "reactflow";
import { useInterfaceEditor } from "../../context";
import {nanoid} from 'nanoid';
import { Box } from '@mui/material';
import { ToolOverlay } from "./overlay";
import { merge } from 'lodash'

export interface InterfaceConnection extends Partial<Connection> {
    id?: string;

    sourcePoint?: {x: number, y: number};
    targetPoint?: {x: number, y: number};

    points?: any[];
}

export interface InterfaceEditorSurfaceProps {
    nodes: Node[],
    edges: Edge[]

    selected?: {nodes: Node[], edges: Edge[]};
    onSelectionChange?: (selection: {nodes: Node[], edges: Edge[]} | undefined) => void;

    onEdgeCreate?: (connection: InterfaceConnection) => void
    onEdgeUpdate?: (edge: Partial<InterfaceConnection>) => void;
    onEdgeDelete?: (edges: Edge[] | Edge) => void;

    onNodeCreate?: (node: Node) => void;
    onNodeUpdate?: (node: Node) => void;
    onNodeDelete?: (node: Node[] | Node) => void;
}

export const InterfaceEditorSurface : React.FC<InterfaceEditorSurfaceProps> = (props) => {
   
    const containerRef = React.useRef<HTMLDivElement>(null);

    const { activeTool, toolRotation } = useInterfaceEditor();


    const [ selected, setSelected ] = useState<{nodes: Node[], edges: Edge[]}>()

    const [ nodes, setNodes, onNodesChange ] = useNodesState(props.nodes || [])
    const [ edges, setEdges, onEdgesChange ] = useEdgesState(props.edges || [])

    const [ pointer, setPointer ] = useState<{x: number, y: number} | null>(null)

    const [ connecting, setConnecting ] = useState<any>(null);

    const nodesInitialized = useNodesInitialized()

    console.log({nodes: props.nodes, edges: props.edges})

    useEffect(() => {
        setNodes(props.nodes || [])
    }, [JSON.stringify(props.nodes)])

    useEffect(() => {

        setEdges((props.edges || []).map((edge) => {

            let sourceNode = nodes?.find((a) => a.id == edge.source)
            let targetNode = nodes?.find((a) => a.id == edge.target)

            return merge({}, edge,
                {
                    data: {
                    
                        sourcePoint: edge.data?.sourcePoint ? {
                            x: edge.data?.sourcePoint.x + sourceNode?.position?.x,
                            y: edge.data?.sourcePoint.y + sourceNode?.position?.y
                        } : undefined,
                        targetPoint: edge.data?.targetPoint ? {
                            x: edge.data?.targetPoint.x + targetNode?.position?.x,
                            y: edge.data?.targetPoint.y + targetNode?.position?.y
                        } : undefined,
                    }
                })
            }
        ))

    }, [ JSON.stringify(props.edges), JSON.stringify(props.nodes) ])


    useEffect(() => {
        setSelected(props.selected)
    }, [props.selected])

    const _nodeTypes = useMemo(() => nodeTypes(true), [])
    const _edgeTypes = useMemo(() => edgeTypes(true), [])


    const { project: _project } = useReactFlow()

    const project = (point: {x: number, y: number}) => {
        const bounds = containerRef.current?.getBoundingClientRect();

        return _project({
            x: point.x - (bounds?.x || 0),
            y: point.y - (bounds?.y || 0)
        })
    }

    return (
        <Box
            // tabIndex={-1}
            // onKeyDown={onKeyDown}
            onPointerMove={(e) => {
                const bounds = containerRef?.current?.getBoundingClientRect();
                setPointer({x: e.clientX - ( bounds?.x || 0 ), y: e.clientY - ( bounds?.y || 0 )})
            }}
            onPointerLeave={() => {
                setPointer(null);
            }}
            sx={{flex: 1, display: 'flex'}} 
            ref={containerRef}>
                <ToolOverlay
                    pointer={pointer}
                    activeTool={activeTool}
                    rotation={toolRotation}
                    />
            <ReactFlow
                snapToGrid
                snapGrid={[5, 5]}
                connectionMode={ConnectionMode.Loose}
                nodes={nodes.slice()?.sort((a, b) => (a.data?.zIndex || 0) - (b.data?.zIndex || 0))?.map((x) => ({
                    ...x,
                    selected: x.selected || selected?.nodes?.find((a) => a.id == x.id) != null
                }))}
                edges={edges.map((x) => ({
                    ...x,
                    selected: x.selected || selected?.edges?.find((a) => a.id == x.id) != null
                }))}
                onNodesChange={(changes) => {

                    changes.filter((a) => a.type == 'dimensions').forEach((dim: any) => {
                        if(dim.resizing || dim.rotating){
                            setNodes((n) => {
                                let on = n.slice();
                                let ix = on.findIndex((a) => a.id == dim.id)

                                let update : any = {};

                                if(dim.dimensions?.rotation) update.rotation = dim.dimensions?.rotation
                                if(dim.dimensions?.width) update.width = dim.dimensions?.width
                                if(dim.dimensions?.height) update.height = dim.dimensions?.height
                                on[ix].data = {
                                    ...on[ix].data,
                                   ...update
                                }

                                props.onNodeUpdate?.(on[ix])

                                return on;
                            })
                            

                        }
                    })

                    changes.filter((x) =>  x.type == 'position').forEach((pos: any) => {
                        if(pos.dragging == false){
                            let n = nodes.find((a) => a.id == pos.id)
                            if(!n) return;
                            n.position =  {
                                ...n.position,
                                ...pos.position
                            }
                            
                            
                            props.onNodeUpdate?.(n)
                        }
                    })

                    if(nodesInitialized){
                        setSelected((selected) => {
                            let s = Object.assign({}, selected);

                            changes.filter((x) => x.type == 'select').forEach((select: any) => {
                                if(select.selected){
                                    // setSelected((s) => {
                                        let n = props.nodes?.find((a) => a.id == select.id);
                                        s = {edges: (s?.edges || []), nodes: (s?.nodes || []).concat(n ? [n] : []) }
                                    //  })
                                }else{
                                    // setSelected((s) => (
                                        s = {edges: (s?.edges || []), nodes: (s?.nodes || []).filter((a) => a.id !== select.id) }
                                        // ) )
                                }
                            })
                        
                        if(nodesInitialized) props.onSelectionChange?.(s)

                            return s;
                        })
                }

                   
                    // setSelected(s)
                    onNodesChange(changes.filter((a: any) => (a.type !== 'dimensions' && !a.resizing) && a.type !== 'select'))
                }}
                onPaneClick={(ev) => {
                    const bounds = containerRef.current?.getBoundingClientRect();
                    const coords = project({x: ev.clientX, y: ev.clientY});

                    if(activeTool){
                        props.onNodeCreate?.({
                            id: nanoid(), 
                            position: coords, 
                            data: {
                                rotation: toolRotation
                            }, 
                            type: `${activeTool.pack}:${activeTool.name}`
                        })
                    }else{
                        setSelected(undefined)
                    }
                }}
                onEdgesChange={(changes) => {


                    let leftover_changes = changes.filter((a: any) => a.type !== 'points-created' && a.type !== 'points-changed' && a.type !== 'select');
                    let points_created = changes.filter((a: any) => a.type == 'points-created')
                    let points_moved = changes.filter((a: any) => a.type == 'points-changed');

                    let selected_events = changes?.filter((a) => a.type == 'select');


                    setSelected((selected) => {
                        let s = Object.assign({}, selected);

                        selected_events?.forEach((event: any) => {
                            if(event.selected){
                                // setSelected((s) => {
                                    let n = props.edges?.find((a) => a.id == event.id);
                                    s = {edges: (s?.edges || []).concat(n ? [n] : []), nodes: (s?.nodes || []) }
                                //  })
                            }else{
                                // setSelected((s) => (
                                    s = {edges: (s?.edges || []).filter((a) => a.id !== event.id), nodes: (s?.nodes || []) }
                                    // ) )
                            }
                        })

                        if(nodesInitialized) props.onSelectionChange?.(s)

                        return s;
                    })

                    points_created.map((value: any) => {
                        const point = project({x: value.point.x, y: value.point.y})

                        let edge =  props.edges?.find((a) => a.id == value.id)
                        let e_points = (edge?.data?.points || []).slice();

                        e_points.splice(value.ix, 0, point)

                        props.onEdgeUpdate?.({ ...edge, points: e_points  })

                    })

                    points_moved.map((value: any) => {

                        let edge =  props.edges?.find((a) => a.id == value.id)
                        let e_points = (edge?.data?.points || []).slice();

                        e_points[value.ix] = value.point //(value.ix, 0, point)

                        props.onEdgeUpdate?.({ ...edge, points: e_points })
                    })

                    onEdgesChange(leftover_changes)
                }}
                onNodesDelete={props.onNodeDelete}
                onConnect={(connection) => {
                    setConnecting(null);
                    props.onEdgeCreate?.(connection)
                }}
                onConnectStart={(event, params) => {
                    setConnecting(params);
                }}
                onConnectEnd={(event: any) => {

                    if(connecting != null){

                        const node = (event.target as HTMLElement).closest('.react-flow__node')
                        const point = project({x: event.clientX, y: event.clientY})

                        const nodeId = node?.getAttribute('data-id');

                        const nodeXY = nodes?.find((a) => a.id == nodeId);

                        if(nodeId){

                            props.onEdgeCreate?.({
                                source: connecting?.nodeId,
                                sourceHandle: connecting?.handleId,
                                target: nodeId,
                                targetPoint: { x: point.x - (nodeXY?.position.x || 0), y: point.y - (nodeXY?.position.y || 0) }
                            })
                        }
                    }

                }}
                onEdgesDelete={props.onEdgeDelete}
                nodeTypes={_nodeTypes}
                edgeTypes={_edgeTypes}>
                <Controls />
                <Background />
            </ReactFlow>
        </Box>
    )
}