import { useDroppable } from '@dnd-kit/core';
import { Box } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, { Background, ConnectionMode, Edge, Node, MiniMap, useEdgesState, useNodesState, useReactFlow, addEdge, useOnSelectionChange } from 'reactflow';
import { isEqual } from 'lodash'
import { LinePath } from '../paths/line-path';
import { useHMIContext } from '../context';
import { HMINode } from '../nodes/hmi-node';
import { OutlineNode } from '../nodes/outline-node';

export interface EditorNode {
    id: string;
    type: string,
    x: number,
    y: number,
    width?: number | null,
    height?: number | null
}
export interface EditorCanvasProps {
    id: string;

    dragNode?: any;

    nodes: Node[];
    onNodesChange?: (nodes: EditorNode[]) => void;
    edges: Edge[];
    onEdgesChange?: (edges: Edge[]) => void;

    onSelect?: (selection: any) => void;
}

export const EditorCanvas : React.FC<EditorCanvasProps> = (props) => {

    const { project } = useReactFlow()
    
    const edgeTypes = useMemo(() => ({ 'line-path': LinePath }), []);
    const nodeTypes = useMemo(() => ({ 'hmi-node': HMINode, outline: OutlineNode }), []);


    const [nodes, setNodes, onNodesChange] = useNodesState(props.nodes || [])
    const [edges, setEdges, onEdgesChange] = useEdgesState(props.edges || [])


    const onConnect = useCallback((params) => setEdges((els) => addEdge({...params, type: 'line-path'}, els)), [])

    const { onSelect } = props;

    const { isOver, over, rect, setNodeRef } = useDroppable({
        id: 'canvas'
    })

    const nodeMap = (node: any) => ({
        id: node.id,
                
        type: node.data.type,

        options: node.data.options,

        x: node.position.x,
        y: node.position.y,
        width: node.data.width,
        height: node.data.height,
    })

    // useEffect(() => {
    //     if(props.nodes && nodes && !isEqual(props.nodes?.map(nodeMap), nodes?.map(nodeMap))){
    //         console.log("nodesChange", nodes, props.nodes)
    //         props.onNodesChange?.(nodes.map(nodeMap))
    //     }
    // }, [nodes])

    // useEffect(() => {
    //     if(props.id && !isEqual(props.edges, edges)){
    //         props.onEdgesChange?.(edges.map((edge) => ({
    //             id: edge.id,
    //             source: edge.source,
    //             sourceHandle: edge.sourceHandle,
    //             target: edge.target,
    //             targetHandle: edge.targetHandle,
    //             type: edge.type

    //         })))
    //     }
    // }, [props.id, edges])

    useEffect(() => {
        // if(!isEqual(props.nodes, nodes)) 
        if(props.nodes && !isEqual(props.nodes, nodes)) setNodes(props.nodes || [])
    }, [props.nodes])

    useEffect(() => {
        if(props.edges) setEdges(props.edges || [])
    }, [props.edges])

    const dragNode = useMemo(() => {
        if(props.dragNode){
        // const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
        // const type = event.dataTransfer.getData('application/reactflow');
  
        // // check if the dropped element is valid
        // if (typeof type === 'undefined' || !type) {
        //   return;
        // }
  
        // const position = reactFlowInstance.project({
        //   x: props.dragNode?.left - reactFlowBounds.left,
        //   y: props.dragNode?.tope - reactFlowBounds.top,
        // });

        return [
            { 
                id: 'drag-overlay', 
                type: 'outline', 
                position: project({ x: props.dragNode?.left - (rect.current?.left || 0), y: props.dragNode?.top - (rect.current?.top || 0) }), 
                data: { width: props.dragNode?.width, height: props.dragNode?.height }, 
                width: props.dragNode?.width, 
                height: props.dragNode?.height 
            }
        ]
        }

        return [];

    }, [props.dragNode, rect])

    useOnSelectionChange({
        onChange: (_selection) => {
            onSelect?.(_selection)

        }
    })

    const flowNodes = useMemo(() => {
        return (nodes || [])?.concat(dragNode)
    }, [nodes, dragNode])

    return (
        <Box sx={{ display: 'flex', flex: 1 }} ref={setNodeRef}>
            <ReactFlow
                snapToGrid
                nodes={flowNodes}
                edges={edges || []}
                connectionMode={ConnectionMode.Loose}
                edgeTypes={edgeTypes}
                nodeTypes={nodeTypes}
                // onNodeClick={}
                
                // onSelectionChange={(_selection) => {
                //     // console.log(_selection, selected)
                //     // if (!isEqual(selected, _selection)) {
                //         // alert("Selection")
                //         onSelect?.(_selection)
                //     // }
                // }}
                onEdgesDelete={(edges) => {
                    setEdges((_edges: any[]) => {
                        let newEdges = _edges.slice().filter((a: any) => edges.findIndex((b) => b.id == a.id) < 0)

                        props.onEdgesChanged?.(newEdges.map(edgeMap))

                        return newEdges;
                    })
                }}
                onEdgesChange={(changes) => {
                    onEdgesChange(changes);

                    props.onEdgesChange?.(edges.map((edge) => ({
                        id: edge.id,
                        source: edge.source,
                        sourceHandle: edge.sourceHandle,
                        target: edge.target,
                        targetHandle: edge.targetHandle,
                        type: edge.type
        
                    })))
                }}
                onNodesDelete={(nodes) => {
                    setNodes((_nodes: any[]) => {
                        let newNodes = _nodes.slice().filter((a: any) => nodes.findIndex((b) => b.id == a.id) < 0)

                        props.onNodesChange?.(newNodes.map(nodeMap))

                        return newNodes;
                    })
                }}
                onNodesChange={(changes) => {
                    onNodesChange(changes);
                    console.log("nodeChange 1", nodes)
        
                    props.onNodesChange?.(nodes.map(nodeMap))

                }}
                onConnect={(connection) => {
                    onConnect(connection);

                    setEdges((els) => {
                    
                        let edges = addEdge({...connection, type: 'line-path'}, els) 

                        props.onEdgesChange?.(edges.map((edge) => ({
                            id: edge.id,
                            source: edge.source,
                            sourceHandle: edge.sourceHandle,
                            target: edge.target,
                            targetHandle: edge.targetHandle,
                            type: edge.type
            
                        })))
                        return edges;
                    })

                }}
            >
                <Background />
                <MiniMap />
                {/* <Controls /> */}
            </ReactFlow>
        </Box>
    )
}