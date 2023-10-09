import React, {MouseEvent, useState} from 'react';
import { Box } from '@mui/material';
import { ReactFlow, MiniMap, Controls, Background, Node, Edge, NodeTypes, EdgeTypes } from 'reactflow';

export interface EditorCanvasProps {
    nodes?: Node[],
    edges?: Edge[],
    nodeTypes?: NodeTypes,
    edgeTypes?: EdgeTypes

    fitView?: boolean;
    
    onNodeDoubleClick?: (node: Node) => void;
}

export const EditorCanvas : React.FC<EditorCanvasProps> = (props) => {

    const [ selectionZone, setSelectionZone ] = useState<{start?: {x: number, y: number}} | null>(null);

    const onSelectionStart = (e: MouseEvent) => {
        setSelectionZone({
            start: {
                x: e.clientX,
                y: e.clientY
            }
        })
    }

    const onSelectionEnd = (e: MouseEvent) => {

        let zone = {
            ...selectionZone,
            end: {
                x: e.clientX,
                y: e.clientY
            }
        }
        
        setSelectionZone(null);
    }

    return (
        <Box sx={{flex: 1, display: 'flex'}}>
            <ReactFlow
                nodeTypes={props.nodeTypes}
                edgeTypes={props.edgeTypes}
                nodes={props.nodes || []}
                edges={props.edges || []}
                fitView={props.fitView}
                onSelectionStart={onSelectionStart}
                onSelectionEnd={onSelectionEnd}
                onNodeDoubleClick={(ev, node) => props.onNodeDoubleClick?.(node)}
                >
                <Background />
                <Controls />
                <MiniMap />
                {props.children}
            </ReactFlow>
        </Box>
    )
}