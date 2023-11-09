import ReactFlow, { Background, Node, Edge, ConnectionMode, ReactFlowProvider, Connection} from 'reactflow'
import { Box, Collapse, IconButton } from '@mui/material';
import { nodeTypes } from '@hive-command/canvas-nodes'

import 'reactflow/dist/style.css';
import { useMemo, useState, KeyboardEvent } from 'react';
import { Sidebar } from "./sidebar";
import { ComponentPack, ComponentTool, InterfaceEditorProvider } from './context';
import { InterfaceConnection, InterfaceEditorSurface } from './components/surface';
import { HMIType, HMITag, HMITemplate } from '@hive-command/interface-types';

export interface InterfaceEditorProps {
    nodes: Node[],
    edges: Edge[],

    tags: HMITag[];
    types: HMIType[];
    templates: HMITemplate[];

    packs: ComponentPack[]

    onNodeCreate?: (node: Node) => void;
    onNodeUpdate?: (node: Node) => void;
    onNodeDelete?: (node: Node | Node[]) => void;

    onEdgeCreate?: (connection: InterfaceConnection) => void;
    onEdgeUpdate?: (edge: Partial<InterfaceConnection>) => void;
    onEdgeDelete?: (edge: Edge | Edge[]) => void;
}

export const InterfaceEditor : React.FC<InterfaceEditorProps> = (props) => {

    const [ selected, setSelected ] = useState<{nodes: Node[], edges: Edge[]} | undefined>(undefined)

    const [ activeTool, setActiveTool ] = useState<ComponentTool | null>(null)

    const onKeyDown = (e: KeyboardEvent) => {
        if(e.key == 'Escape') setActiveTool(null);
    }

    return (
        <InterfaceEditorProvider value={{
            tags: props.tags || [],
            types: props.types || [],
            templates: props.templates || [],

            packs: props.packs || [],

            nodes: props.nodes || [],
            edges: props.edges || [],
            selected,

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
                        selected={selected}
                        onSelectionChange={(selected) => setSelected(selected)}
                        onNodeCreate={props.onNodeCreate}
                        onNodeUpdate={props.onNodeUpdate}
                        onNodeDelete={props.onNodeDelete}
                        onEdgeCreate={props.onEdgeCreate}
                        onEdgeUpdate={props.onEdgeUpdate}
                        onEdgeDelete={props.onEdgeDelete} />
                </ReactFlowProvider>
                {/* Check for paths/multiples */}
                <Sidebar    
                    onNodeUpdate={props.onNodeUpdate} />
            </Box>
        </InterfaceEditorProvider>
    )
}