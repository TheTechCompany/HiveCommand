import React, {MouseEvent, useEffect, useMemo, useRef, useState} from 'react';
import { Box } from '@mui/material';
import { ReactFlow, MiniMap, Controls, Background, Node, Edge, NodeTypes, EdgeTypes, useOnSelectionChange, useNodesState, useEdgesState, CoordinateExtent, ConnectionMode, useViewport, useReactFlow, SelectionMode, useStore, Rect, Transform, getNodePositionWithOrigin, useStoreApi } from 'reactflow';
import { isEqual } from 'lodash';
import { useNodeState, useEdgeState } from './hooks'

export interface EditorCanvasSelection {
    nodes?: string[];
    edges?: string[];
}

export interface EditorCanvasProps {

    defaultNodes?: Node[];
    defaultEdges?: Edge[];

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

    const containerRef = useRef<any>(null);

    const storeApi = useStoreApi();
    // const { selectActive, nodeOrigin, nodeInternals, selectRect } = useStore((state) => ({
    //     selectRect: state.userSelectionRect, 
    //     selectActive: state.userSelectionActive,
    //     nodeInternals: state.nodeInternals,
    //     nodeOrigin: state.nodeOrigin
    // }))

    // console.log(selectActive, selectRect)

    const [nodes, setNodes, selectedNodes, setSelectedNodes, onNodesChange] = useNodeState(props.nodes || [], props.onNodesChanged)
    const [edges, setEdges, selectedEdges, setSelectedEdges, onEdgesChange] = useEdgeState(props.edges || [], containerRef?.current, props.onEdgesChanged)

    // const [ nodes, setNodes, onNodesChange ] = useNodesState(props.nodes || [])
    // const [ edges, setEdges, onEdgesChange ] = useEdgesState(props.edges || [])

    const [ lastDrag, setLastDrag ] = useState<{x: number, y: number}>()
    const [ selectionLastDrag, setSelectionLastDrag ] = useState<{x: number, y: number}>()

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
            if(node.type == 'canvasNode' || node.type == 'page'){
                return false;
            }
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

        setSelectionZone(null);
    }

    const onSelectionDragStart = (e: MouseEvent) => {
        setSelectionLastDrag(project({
            x: e.clientX,
            y: e.clientY
        }))
    }

    const onSelectionDrag = (e: MouseEvent, nodes: Node[]) => {

        if(!selectionLastDrag) return;

        let currentPoint = project({
            x: e.clientX,
            y: e.clientY
        })

        let delta = {
            x: currentPoint.x - selectionLastDrag?.x,
            y: currentPoint.y - selectionLastDrag?.y
        }

        moveSelection(delta.x, delta.y)

        setSelectionLastDrag(currentPoint)
    }

    const onSelectionDragStop = (e: MouseEvent) => {
        setSelectionLastDrag(undefined)
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
                setSelectedNodes([])
            }else{
                edgesSelection = [edge.id];
                setSelectedNodes([])
            }
        }

        setSelectedEdges(edgesSelection)
        props.onSelect?.({...props.selection, edges: edgesSelection})
    }

    const onPaneClick = () => {
        setSelectedEdges([]);
        setSelectedNodes([]);

        props.onSelect?.({nodes: [], edges: []})
    }

    const finalNodes = useMemo(() => nodes.concat(props.defaultNodes || []), [nodes, props.defaultNodes])
    const finalEdges = useMemo(() => edges.concat(props.defaultEdges || []), [edges, props.defaultEdges])

    useEffect(() => {
        props.onSelect?.({
            nodes: selectedNodes || [],
            edges: selectedEdges || []
        })
    }, [selectedEdges, selectedNodes])

    return (
        <Box
            ref={containerRef}
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
                nodes={finalNodes.map((x) => ({...x, selectable: false})) || []}
                edges={finalEdges.map((x) => ({...x, selectable: false})) || []}
                snapGrid={[5, 5]}
                snapToGrid
                onPaneClick={onPaneClick}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onEdgeClick={onEdgeClick}
                // onNodeClick={onNodeClick}
                selectNodesOnDrag={true}
                
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

                onNodeDragStart={(ev, node, nodes) => {
                    // console.log("Start", node, nodes)

                    setLastDrag(project({
                        x: ev.clientX,
                        y: ev.clientY
                    }));

                    if(ev.ctrlKey || ev.metaKey){
                        if(selectedNodes.indexOf(node.id) > -1){
                            setSelectedNodes(selectedNodes?.filter((a) => a != node.id));
                        }else{
                            setSelectedNodes([...new Set([...selectedNodes, node.id])])
                        }
                    }else{
                        if(selectedNodes.indexOf(node.id) < 0){
                            setSelectedNodes([node.id])
                        }
                        setSelectedEdges([])
                    }
                }}
                onNodeDrag={(ev, node, nodes) => {
                    // console.log("node drag", ev, node, nodes);
                    // if(ev.ctrlKey || ev.metaKey){
                    //     setSelectedNodes([...selectedNodes, node.id])
                    // }else{
                    //     setSelectedNodes([node.id])
                    // }

                    let nextDrag =  project({
                        x: ev.clientX,
                        y: ev.clientY
                    })

                    const delta = {
                        x: nextDrag.x - (lastDrag?.x || 0),
                        y: nextDrag.y - (lastDrag?.y || 0)
                    }

                    moveSelection(delta.x, delta.y);

                    // console.log("Delta", delta)
                    // setNodes((n) => {
                    //     let nodes = n.slice();

                    //     moveSelection(delta.x, delta.y)

                    //     // let ixList = selection?.map((node) => nodes?.findIndex((a) => a.id == node.id));

                    //     // ixList.forEach((ix) => {

                    //     // })
                    //     // nodes[ix].position = {
                    //     //     x: nodes[ix].position?.x + delta.x,
                    //     //     y: nodes[ix].position?.y + delta.y
                    //     // }
                    //     return nodes;
                    // })

                    setLastDrag(nextDrag);
                }}
                onNodeDragStop={(ev, node) => {
                    // console.log("End", node)

                    setLastDrag(undefined);
                }}
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