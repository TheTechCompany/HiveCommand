import React, {MouseEvent, useEffect, useState} from 'react';
import { Box } from '@mui/material';
import { ReactFlow, MiniMap, Controls, Background, Node, Edge, NodeTypes, EdgeTypes, useOnSelectionChange, useNodesState, useEdgesState, CoordinateExtent, ConnectionMode, useViewport, useReactFlow, SelectionMode, useStore, Rect, Transform, getNodePositionWithOrigin, useStoreApi } from 'reactflow';
import { isEqual } from 'lodash';
import { useNodeState, useEdgeState } from './hooks'

export interface EditorCanvasSelection {
    nodes?: string[];
    edges?: string[];
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

    const storeApi = useStoreApi();
    // const { selectActive, nodeOrigin, nodeInternals, selectRect } = useStore((state) => ({
    //     selectRect: state.userSelectionRect, 
    //     selectActive: state.userSelectionActive,
    //     nodeInternals: state.nodeInternals,
    //     nodeOrigin: state.nodeOrigin
    // }))

    // console.log(selectActive, selectRect)

    const [nodes, setNodes, selectedNodes, setSelectedNodes, onNodesChange] = useNodeState(props.nodes || [])
    const [edges, setEdges, selectedEdges, setSelectedEdges, onEdgesChange] = useEdgeState(props.edges || [])

    // const [ nodes, setNodes, onNodesChange ] = useNodesState(props.nodes || [])
    // const [ edges, setEdges, onEdgesChange ] = useEdgesState(props.edges || [])

    const [ lastDrag, setLastDrag ] = useState<{x: number, y: number}>()

    const [ selectionZone, setSelectionZone ] = useState<{start?: {x: number, y: number}} | null>(null);

    const { project } = useReactFlow();

    useEffect(() => {
        if(!isEqual(props.selection, {nodes: selectedNodes, edges: selectedEdges})){
            // setSelection({...props.selection});
            setSelectedEdges(props.selection?.edges || [])
            setSelectedNodes(props.selection?.nodes || [])
        }
    }, [props.selection])

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

        let currentSelection = Object.assign({}, {nodes: selectedNodes, edges: selectedEdges});

        let selectEdges = props.edges?.filter((edge) => {
            if((currentSelection?.edges || []).indexOf(edge.id) > -1){
                return false;
            }
            return edge.data?.points?.filter((point: {x: number, y: number}) => {

                let xIn = zoneOrientationX ? point.x > (zone.start?.x || 0) && point.x < (zone.end?.x || 0) : point.x > (zone.end?.x || 0) && point.x < (zone.start?.x || 0)
                let yIn = zoneOrientationY ? point.y > (zone.start?.y || 0) && point.y < (zone.end?.y || 0) : point.y > (zone.end?.y || 0) && point.y < (zone.start?.y || 0)

                return xIn && yIn
            })?.length > 0;
        }).map((x) => x.id);

        currentSelection.edges = (currentSelection.edges || []).concat(selectEdges || []);
        
        let selectNodes = props.nodes?.filter((node) => {
            if((currentSelection?.nodes || []).indexOf(node.id) > -1){
                return false;
            }

            let nodeWidth = node.width || 0;
            let nodeHeight = node.height || 0;

            let xIn = zoneOrientationX ? node.position.x > (zone.start?.x || 0) && node.position.x + nodeWidth < (zone.end?.x || 0) : node.position.x > (zone.end?.x || 0) && node.position.x + nodeWidth < (zone.start?.x || 0)
            let yIn = zoneOrientationY ? node.position.y > (zone.start?.y || 0) && node.position.y + nodeHeight < (zone.end?.y || 0) : node.position.y > (zone.end?.y || 0) && node.position.y + nodeHeight < (zone.start?.y || 0)

            return xIn && yIn
        }).map((x) => x.id)

        currentSelection.nodes = (currentSelection.nodes || []).concat(selectNodes || []);

        setSelectedEdges(currentSelection.edges);
        setSelectedNodes(currentSelection.nodes)

        props.onSelect?.(currentSelection);

        console.log("Selection change moar", currentSelection);

        
        setSelectionZone(null);
    }

    useOnSelectionChange({
        onChange: (params) => {

            // if(!isEqual(selection, params)){

            //     console.log("Selection change", params, selection, props.selection);

            //     setSelection(params);
            //     props.onSelect?.(params)
            // }
        }
    })

    const onSelectionDragStart = (e: MouseEvent) => {
        console.log("Start Drag")
        setLastDrag(project({
            x: e.clientX,
            y: e.clientY
        }))
    }

    const onSelectionDrag = (e: MouseEvent) => {
        console.log("Drag")

        if(!lastDrag) return;

        let currentPoint = project({
            x: e.clientX,
            y: e.clientY
        })

        let delta = {
            x: currentPoint.x - lastDrag?.x,
            y: currentPoint.y - lastDrag?.y
        }

        moveSelection(delta.x, delta.y)

        setLastDrag(currentPoint)
    }

    const onSelectionDragStop = (e: MouseEvent) => {
        console.log("Stop drag")
        setLastDrag(undefined)
    }

    useEffect(() => {
        setNodes(
            (props.nodes || []).map((e) => ({
                ...nodes?.find((a) => a.id == e.id),
                ...e,
                // selected: selection?.nodes?.find((a) => a.id == e.id) != null
            }))
        )
    }, [JSON.stringify(props.nodes)])//, selection])

    useEffect(() => {
        setEdges(
            (props.edges || []).map((e) => ({
                ...e,
            }))
        );
    }, [JSON.stringify(props.edges)])

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
            if((selectedNodes || []).indexOf(x.id) > -1){
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
            if((selectedEdges || []).indexOf(x.id) > -1){
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

    const onNodeClick = (e: MouseEvent, node: Node) => {
        let multiple = e.ctrlKey || e.metaKey;
        let exists = selectedNodes?.indexOf(node.id) > -1;

        let nodesSelection : string[] = [];

        if(multiple){
            if(exists){
                nodesSelection = selectedNodes.filter((a) => a != node.id);
            }else{
                nodesSelection = [...selectedNodes, node.id]
            }
        }else{
            if(exists){
                nodesSelection = [];
            }else{
                nodesSelection = [node.id]
            }
        }

        setSelectedNodes(nodesSelection)
        props.onSelect?.({...props.selection, nodes: nodesSelection})
    }

    const onEdgeClick = (e: MouseEvent, edge: Edge) => {
        let multiple = e.ctrlKey || e.metaKey;
        let exists = selectedEdges?.indexOf(edge.id) > -1;

        let edgesSelection : string[] = [];

        if(multiple){
            if(exists){
                edgesSelection = selectedEdges.filter((a) => a != edge.id)
            }else{
                edgesSelection = [...selectedEdges, edge.id]
            }
        }else{
            if(exists){
                edgesSelection = [];
            }else{
                edgesSelection = [edge.id];
            }
        }

        setSelectedEdges(edgesSelection)
        props.onSelect?.({...props.selection, edges: edgesSelection})
    }

    const onPaneClick = () => {
        setSelectedEdges([]);
        setSelectedNodes([]);
    }

    return (
        <Box
            tabIndex={0}
            onKeyDown={(e) => {
                const mod = e.shiftKey ? 5 : 1;
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
                nodes={nodes.map((x) => ({...x, selectable: false})) || []}
                edges={edges.map((x) => ({...x, selectable: false})) || []}
                onPaneClick={onPaneClick}
                onNodesChange={(changes) => {
                    // console.log("Node", changes)
                    // onNodesChange(changes);

                    // if (!isEqual((props.nodes || []).map(nodeMap), (nodes || []).map(nodeMap))) {
                    //     props.onNodesChanged?.(nodes)
                    // }
                }}
                // onNodesDelete={(deleted_nodes) => {
                //     props.onNodesChanged?.(nodes?.filter((a) => deleted_nodes.findIndex((b) => a.id == b.id) < 0))
                // }}
                onEdgesChange={(changes) => {
                    
                    // console.log("Edge", changes)

                    // onEdgesChange(changes);
                    // console.log("Edge", edges)

                    // if(!isEqual((props.edges || []), (edges || []))){
                    //     props.onEdgesChanged?.(edges)
                    // }
                }}
                onEdgeClick={onEdgeClick}
                onNodeClick={onNodeClick}
                // nodesDraggable={false}
                // nodesConnectable={false}
                // elementsSelectable={false}

                nodesFocusable={false}
                edgesFocusable={false}
                disableKeyboardA11y
                // nodesDraggable={false}
                fitView={props.fitView}
                minZoom={0.8}
                translateExtent={props.translateExtent}
                nodeExtent={props.nodeExtent}
                onSelectionDragStart={onSelectionDragStart}
                onSelectionDrag={onSelectionDrag}
                onSelectionDragStop={onSelectionDragStop}
                onSelectionStart={onSelectionStart}
                onSelectionEnd={onSelectionEnd}
                // onSelectionDrag={()}
                onNodeDoubleClick={(ev, node) => props.onNodeDoubleClick?.(node)}
                connectionMode={ConnectionMode.Loose}
                selectionMode={SelectionMode.Full}
                >
                <Background />
                <Controls />
                {props.children}
            </ReactFlow>
        </Box>
    )
}