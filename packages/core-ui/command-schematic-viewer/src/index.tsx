import React from 'react';
import { Box, Typography } from '@mui/material';
import { ReactFlow, ReactFlowProvider, Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import { ViewportLogger } from './viewport';
import { nodeTypes as _nodeTypes, edgeTypes as _edgeTypes, ElectricalNodesProvider } from '@hive-command/electrical-nodes'

export interface SchematicViewerProps {
    ratio: number,
    elements: any[]
    nodes: Node[],
    edges: Edge[],
}

export const SchematicViewer : React.FC<SchematicViewerProps> = (props) => {
    console.log(props);
// width: 1080, height: 1080 * (props.ratio || 1.77),

    const nodeTypes = useMemo(() => _nodeTypes, []);
    const edgeTypes = useMemo(() => _edgeTypes, []);

    return (
        <Box sx={{flex: 1, display: 'flex'}}>
            <ElectricalNodesProvider
                value={{
                    elements: props.elements
                }}
                >
                <ReactFlowProvider>
                    <ViewportLogger />
                    <ReactFlow 
                        fitView
                        maxZoom={0.8}
                        nodeTypes={nodeTypes}
                        edgeTypes={edgeTypes}
                        nodes={props.nodes || [] }
                        edges={props.edges || []}
                        />
                </ReactFlowProvider>
            </ElectricalNodesProvider>
        </Box>
    )
}