import { useDroppable } from '@dnd-kit/core';
import { Box } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, { Background, ConnectionMode, Edge, Node, MiniMap, useEdgesState, useNodesState, useReactFlow, addEdge } from 'reactflow';
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
}

export const EditorCanvas : React.FC<EditorCanvasProps> = (props) => {

    const { project } = useReactFlow()
    
    const edgeTypes = useMemo(() => ({ 'line-path': LinePath }), []);
    const nodeTypes = useMemo(() => ({ 'hmi-node': HMINode, outline: OutlineNode }), []);


    const [nodes, setNodes, onNodesChange] = useNodesState(props.nodes || [])
    const [edges, setEdges, onEdgesChange] = useEdgesState(props.edges || [])

    const onConnect = useCallback((params) => setEdges((els) => addEdge({...params, type: 'line-path'}, els)), [])

    const { selected, setSelected } = useHMIContext();

    const { isOver, over, rect, setNodeRef } = useDroppable({
        id: 'canvas'
    })

    useEffect(() => {
        if(props.id && !isEqual(props.nodes, nodes)){
            console.log("nodesChange", nodes)
            props.onNodesChange?.(nodes.map((node) => ({
                id: node.id,
                
                type: node.data.type,

                x: node.position.x,
                y: node.position.y,
                width: node.width,
                height: node.height,
            })))
        }
    }, [props.id, nodes])

    useEffect(() => {
        if(props.id && !isEqual(props.edges, edges)){
            props.onEdgesChange?.(edges)
        }
    }, [props.id, edges])

    useEffect(() => {
        if(!isEqual(props.nodes, nodes)) setNodes(props.nodes || [])
    }, [props.nodes, nodes])

    useEffect(() => {
        if(!isEqual(props.edges, edges)) setEdges(props.edges || [])
    }, [props.edges, edges])

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

    return (
        <Box sx={{ display: 'flex', flex: 1 }} ref={setNodeRef}>
            <ReactFlow
                nodes={(nodes || [])?.concat(dragNode)}
                edges={edges || []}
                connectionMode={ConnectionMode.Loose}
                edgeTypes={edgeTypes}
                nodeTypes={nodeTypes}
                // onNodeClick={}
                onSelectionChange={(_selection) => {
                    if (!isEqual(selected, _selection)) {
                        // alert("Selection")
                        setSelected?.(_selection)
                    }
                }}
                onEdgesChange={onEdgesChange}
                onNodesChange={onNodesChange}
                onConnect={onConnect}
            >
                <Background />
                <MiniMap />
                {/* <Controls /> */}
            </ReactFlow>
        </Box>
    )
}