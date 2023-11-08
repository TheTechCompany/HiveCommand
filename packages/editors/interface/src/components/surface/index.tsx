import { nodeTypes, edgeTypes } from "@hive-command/canvas-nodes";
import React, { useEffect, useMemo, useState } from "react";
import ReactFlow, { Node, Edge, Background, ConnectionMode, Controls, useOnSelectionChange, useNodesState, useEdgesState, Connection, NodePositionChange, useReactFlow } from "reactflow";
import { useInterfaceEditor } from "../../context";
import {nanoid} from 'nanoid';
import { Box } from '@mui/material';
import { ToolOverlay } from "./overlay";

export interface InterfaceEditorSurfaceProps {
    nodes: Node[],
    edges: Edge[]

    onEdgeCreate?: (connection: Connection) => void
    onEdgeUpdate?: (edge: Partial<Edge>) => void;
    onEdgeDelete?: (edges: Edge[] | Edge) => void;

    onNodeCreate?: (node: Node) => void;
    onNodeUpdate?: (node: Node) => void;
    onNodeDelete?: (node: Node[] | Node) => void;
}

export const InterfaceEditorSurface : React.FC<InterfaceEditorSurfaceProps> = (props) => {
   
    const containerRef = React.useRef<HTMLDivElement>(null);

    const { activeTool } = useInterfaceEditor();

    const [ selected, setSelected ] = useState<{nodes: Node[], edges: Edge[]}>()

    const [ nodes, setNodes, onNodesChange ] = useNodesState(props.nodes || [])
    const [ edges, setEdges, onEdgesChange ] = useEdgesState(props.edges || [])

    const [ pointer, setPointer ] = useState<{x: number, y: number} | null>(null)

    useEffect(() => {
        setNodes(props.nodes || [])
    }, [props.nodes])

    useEffect(() => {
        setEdges(props.edges || [])
    }, [props.edges])

    const _nodeTypes = useMemo(() => nodeTypes(true), [])
    const _edgeTypes = useMemo(() => edgeTypes(true), [])

    useOnSelectionChange({
        onChange: (selection) => {
            console.log({selection})
            // setSelected(selection)
        }
    })

    const { project: _project } = useReactFlow()

    const project = (point: {x: number, y: number}) => {
        const bounds = containerRef.current?.getBoundingClientRect();

        return _project({
            x: point.x - (bounds?.x || 0),
            y: point.y - (bounds?.y || 0)
        })
    }

    // useEffect(() => {

    //     const onPointerMove = (e: PointerEvent) => {
    //         console.log(e.clientX)
    //     }

    //     containerRef.current?.addEventListener('pointermove', onPointerMove);

    //     return () => {
    //         containerRef.current?.removeEventListener('pointermove', onPointerMove)
    //     }

    // }, [containerRef.current])

    return (
        <Box
            onPointerMove={(e) => {
                // console.log(e.clientX)
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
                    />
            <ReactFlow
                snapToGrid
                connectionMode={ConnectionMode.Loose}
                nodes={nodes.map((x) => ({
                    ...x,
                    selected: x.selected || selected?.nodes?.find((a) => a.id == x.id) != null
                }))}
                edges={edges.map((x) => ({
                    ...x,
                    selected: x.selected || selected?.edges?.find((a) => a.id == x.id) != null
                }))}
                onNodesChange={(changes) => {
                    console.log(changes)

                    changes.filter((a) => a.type == 'dimensions').forEach((dim: any) => {
                        if(dim.resizing || dim.rotating){
                            console.log(dim)
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

                    changes.filter((x) => x.type == 'select').forEach((select: any) => {
                        if(select.selected){
                            setSelected((s) => {
                                let n = props.nodes?.find((a) => a.id == select.id);
                                return {edges: (s?.edges || []), nodes: (s?.nodes || []).concat(n ? [n] : []) }
                             })
                        }else{
                            setSelected((s) => ({edges: (s?.edges || []), nodes: (s?.nodes || []).filter((a) => a.id !== select.id) }) )
                        }
                    })
                    onNodesChange(changes.filter((a: any) => a.type !== 'dimensions' && !a.resizing))
                }}
                onPaneClick={(ev) => {
                    const bounds = containerRef.current?.getBoundingClientRect();
                    const coords = project({x: ev.clientX, y: ev.clientY});

                    if(activeTool){
                        props.onNodeCreate?.({id: nanoid(), position: coords, data:{}, type: `${activeTool.pack}:${activeTool.name}`})
                    }else{
                        setSelected(undefined)
                    }
                }}
                onEdgesChange={(changes) => {
                    let leftover_changes = changes.filter((a: any) => a.type !== 'points-created' && a.type !== 'points-changed');
                    let points_created = changes.filter((a: any) => a.type == 'points-created')
                    let points_moved = changes.filter((a: any) => a.type == 'points-changed');

                    points_created.map((value: any) => {
                        const point = project({x: value.point.x, y: value.point.y})

                        let edge =  props.edges?.find((a) => a.id == value.id)
                        let e_points = (edge?.data?.points || []).slice();
                        console.log("IX", value.ix)
                        e_points.splice(value.ix, 0, point)

                        props.onEdgeUpdate?.({ ...edge, data: { points: e_points }, })

                    })

                    points_moved.map((value: any) => {

                        let edge =  props.edges?.find((a) => a.id == value.id)
                        let e_points = (edge?.data?.points || []).slice();

                        console.log("IX", value.ix)
                        e_points[value.ix] = value.point //(value.ix, 0, point)

                        props.onEdgeUpdate?.({ ...edge, data: { points: e_points }, })
                    })

                    onEdgesChange(leftover_changes)
                }}
                onNodesDelete={props.onNodeDelete}
                onConnect={props.onEdgeCreate}
                onEdgesDelete={props.onEdgeDelete}
                nodeTypes={_nodeTypes}
                edgeTypes={_edgeTypes}>
                <Controls />
                <Background />
            </ReactFlow>
        </Box>
    )
}