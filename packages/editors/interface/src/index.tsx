import ReactFlow, { Background, Node, Edge, ConnectionMode, ReactFlowProvider, Connection} from 'reactflow'
import { Box, Collapse, IconButton } from '@mui/material';
import { nodeTypes } from '@hive-command/canvas-nodes'

import 'reactflow/dist/style.css';
import { useMemo, useState, KeyboardEvent } from 'react';
import { Sidebar } from "./sidebar";
import { ComponentPack, ComponentTool, InterfaceEditorProvider } from './context';
import { InterfaceEditorSurface } from './components/surface';

export interface InterfaceEditorProps {
    nodes: Node[],
    edges: Edge[],

    packs: ComponentPack[]

    onNodeCreate?: (node: Node) => void;
    onNodeUpdate?: (node: Node) => void;
    onNodeDelete?: (node: Node | Node[]) => void;

    onEdgeCreate?: (connection: Connection) => void;
    onEdgeUpdate?: (edge: Partial<Edge>) => void;
    onEdgeDelete?: (edge: Edge | Edge[]) => void;
}

export const InterfaceEditor : React.FC<InterfaceEditorProps> = (props) => {


    const [ activeTool, setActiveTool ] = useState<ComponentTool | null>(null)

    const onKeyDown = (e: KeyboardEvent) => {
        if(e.key == 'Escape') setActiveTool(null);
    }

    return (
        <InterfaceEditorProvider value={{
            packs: props.packs || [],
            activeTool,
            changeTool: (tool: ComponentTool | null) => setActiveTool(tool)
        }}>
            <Box 
                tabIndex={0} 
                onKeyDown={onKeyDown} 
                sx={{flex: 1, display: 'flex'}}>
                <ReactFlowProvider>
                    <InterfaceEditorSurface 
                        nodes={props.nodes}
                        edges={props.edges}
                        onNodeCreate={props.onNodeCreate}
                        onNodeUpdate={props.onNodeUpdate}
                        onNodeDelete={props.onNodeDelete}
                        onEdgeCreate={props.onEdgeCreate}
                        onEdgeUpdate={props.onEdgeUpdate}
                        onEdgeDelete={props.onEdgeDelete} />
                </ReactFlowProvider>
                <Sidebar  />
            </Box>
        </InterfaceEditorProvider>
    )
}