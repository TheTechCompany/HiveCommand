import React, {MouseEvent, useEffect, useState} from 'react';
import { Box } from '@mui/material';
import { ReactFlow, MiniMap, Controls, Background, Node, Edge, NodeTypes, EdgeTypes, useOnSelectionChange, useNodesState, useEdgesState, CoordinateExtent, ConnectionMode, useViewport, useReactFlow } from 'reactflow';
import { isEqual } from 'lodash';

export interface EditorCanvasSelection {
    nodes?: Node[];
    edges?: Edge[];
}

export interface EditorCanvasProps {
    nodes?: Node[],
    edges?: Edge[],

    onNodesChanged?: (nodes: Node[]) => void;
    onEdgesChanged?: (edges: Edge[]) => void;
    onPageChanged?: (page: any) => void;

    nodeTypes?: NodeTypes,
    edgeTypes?: EdgeTypes

    fitView?: boolean;
    nodeExtent?: CoordinateExtent;
    translateExtent?: CoordinateExtent

    selection?: EditorCanvasSelection;
    onSelect?: (selection: EditorCanvasSelection) => void;
    onNodeDoubleClick?: (node: Node) => void;

    wrapper?: any;
}

export const EditorCanvas : React.FC<EditorCanvasProps> = (props) => {

    const [ nodes, setNodes, onNodesChange ] = useNodesState(props.nodes || [])
    const [ edges, setEdges, onEdgesChange ] = useEdgesState(props.edges || [])

    const [ selection, setSelection ] = useState<EditorCanvasSelection>({});

    const [ selectionZone, setSelectionZone ] = useState<{start?: {x: number, y: number}} | null>(null);

    const { project } = useReactFlow();

    const { x, y, zoom }  = useViewport()

    const onSelectionStart = (e: MouseEvent) => {
        let bounds = props.wrapper?.getBoundingClientRect();

        setSelectionZone({
            start: project({
                x: e.clientX - (bounds.x || 0),
                y: e.clientY - (bounds.y || 0)
            })
        })
    }

    const onSelectionEnd = (e: MouseEvent) => {
        let bounds = props.wrapper?.getBoundingClientRect();

        let zone = {
            ...selectionZone,
            end: project({
                x: e.clientX - (bounds.x || 0),
                y: e.clientY - (bounds.y || 0)
            })
        }

        let zoneOrientationX = (zone?.start?.x || 0) < (zone.end?.x || 0)
        let zoneOrientationY = (zone?.start?.y || 0) < (zone.end?.y || 0)

        let currentSelection = Object.assign({}, selection);

        let selectEdges = props.edges?.filter((edge) => {
            if((currentSelection?.edges || []).findIndex((a) => a.id == edge.id) > -1){
                return false;
            }
            return edge.data?.points?.filter((point: {x: number, y: number}) => {

                let xIn = zoneOrientationX ? point.x > (zone.start?.x || 0) && point.x < (zone.end?.x || 0) : point.x > (zone.end?.x || 0) && point.x < (zone.start?.x || 0)
                let yIn = zoneOrientationY ? point.y > (zone.start?.y || 0) && point.y < (zone.end?.y || 0) : point.y > (zone.end?.y || 0) && point.y < (zone.start?.y || 0)

                return xIn && yIn
            })?.length > 0;
        })

        currentSelection.edges = currentSelection.edges?.concat(selectEdges || [])
        
        setSelection(currentSelection);

        props.onSelect?.(currentSelection);
        
        setSelectionZone(null);
    }

    useOnSelectionChange({
        onChange: (params) => {
            setSelection(params);
            props.onSelect?.(params)
        }
    })

    useEffect(() => {
        setNodes(
            (props.nodes || []).map((e) => ({
                ...e,
                selected: selection?.nodes?.find((a) => a.id == e.id) != null
            }))
        )
    }, [props.nodes, selection])

    useEffect(() => {
        setEdges(
            (props.edges || []).map((e) => ({
                ...e,
                selected: selection?.edges?.find((a) => a.id == e.id) != null
            }))
        )
    }, [props.edges, selection])

    const nodeMap = (item: any) => {
        return {
            id: item.id,
            type: item.type,
            position: item.position,
            data: item.data
        }
    }


    const moveSelection = (xVector: number, yVector: number) => {

        let modifiedNodes = props.nodes?.map((x) => {
            if((selection.nodes || []).findIndex((a) => a.id == x.id) > -1){
                return {
                    ...x,
                    position: {
                        ...x.position,
                        x: x.position.x + xVector,
                        y: x.position.y + yVector
                    }
                }
            }
            return x;
        }) 

        let modifiedEdges = props.edges?.map((x) => {
            if((selection.edges || []).findIndex((a) => a.id == x.id) > -1){
                return {
                    ...x,
                    data: {
                        ...x.data,
                        points: x.data?.points?.map((point: any) => ({
                            x: point.x + xVector,
                            y: point.y + yVector
                        }))
                    }
                }
            }

            return x;
        });

        if(modifiedEdges && modifiedNodes){
            props.onPageChanged?.({
                nodes: modifiedNodes,
                edges: modifiedEdges
            })
        }else{
            if(modifiedNodes) props.onNodesChanged?.(modifiedNodes)
            if(modifiedEdges) props.onEdgesChanged?.(modifiedEdges)
        }
    }

    // useEffect(() => {
    //     const listener = (e: KeyboardEvent) => {
    //         const mod = e.shiftKey ? 2 : 1;
    //         const amt = 1 * mod;

    //         switch(e.key){
    //             case 'ArrowLeft':
    //                 moveSelection(amt * -1, amt * 0);
    //                 break;
    //             case 'ArrowRight':
    //                 moveSelection(amt * 1, amt * 0)
    //                 break;
    //             case 'ArrowDown':
    //                 moveSelection(amt * 0, amt * 1)
    //                 break;
    //             case 'ArrowUp':
    //                 moveSelection(amt * 0, amt * -1)
    //                 break;
    //         }
    //     }

    //     document.addEventListener('keydown', listener)

    //     return () => {
    //         document.removeEventListener('keydown', listener)
    //     }
    // }, [])

    return (
        <Box
            tabIndex={0}
            onKeyDown={(e) => {
                const mod = e.shiftKey ? 2 : 1;
                const amt = 1 * mod;
    
                switch(e.key){
                    case 'ArrowLeft':
                        moveSelection(amt * -1, amt * 0);
                        break;
                    case 'ArrowRight':
                        moveSelection(amt * 1, amt * 0)
                        break;
                    case 'ArrowDown':
                        moveSelection(amt * 0, amt * 1)
                        break;
                    case 'ArrowUp':
                        moveSelection(amt * 0, amt * -1)
                        break;
                }
            }}
            sx={{flex: 1, display: 'flex'}}>
            <ReactFlow
                nodeTypes={props.nodeTypes}
                edgeTypes={props.edgeTypes}
                nodes={nodes || []}
                edges={edges || []}
                onNodesChange={(changes) => {
                    onNodesChange(changes);

                    if (!isEqual((props.nodes || []).map(nodeMap), (nodes || []).map(nodeMap))) {
                        props.onNodesChanged?.(nodes)
                    }
                }}
                onNodesDelete={(deleted_nodes) => {
                    props.onNodesChanged?.(nodes?.filter((a) => deleted_nodes.findIndex((b) => a.id == b.id) < 0))
                }}
                onEdgesChange={(changes) => {
                    
                    onEdgesChange(changes);

                    if(!isEqual((props.edges || []), (edges || []))){
                        props.onEdgesChanged?.(edges)
                    }
                }}
                nodesFocusable={false}
                edgesFocusable={false}
                nodesDraggable={false}
                fitView={props.fitView}
                minZoom={0.8}
                translateExtent={props.translateExtent}
                nodeExtent={props.nodeExtent}
                onSelectionStart={onSelectionStart}
                onSelectionEnd={onSelectionEnd}
                // onSelectionDrag={()}
                onNodeDoubleClick={(ev, node) => props.onNodeDoubleClick?.(node)}
                connectionMode={ConnectionMode.Loose}
                >
                <Background />
                <Controls />
                {props.children}
            </ReactFlow>
        </Box>
    )
}