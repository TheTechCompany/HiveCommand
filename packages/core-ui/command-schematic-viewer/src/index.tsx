import React, {useMemo} from 'react';
import { Box, Typography } from '@mui/material';
import { ReactFlow, ReactFlowProvider, Node, Edge, ConnectionMode } from 'reactflow';
import 'reactflow/dist/style.css';
import { ViewportLogger } from './viewport';
import { nodeTypes as _nodeTypes, edgeTypes as _edgeTypes, ElectricalNodesProvider } from '@hive-command/electrical-nodes'
import { InfoFooter } from './info-footer';

export interface SchematicViewerProps {
    ratio: number,
    elements: any[],

    nodes: Node[],
    edges: Edge[],
    info?: any;
}

export const SchematicViewer : React.FC<SchematicViewerProps> = (props) => {
    console.log("RATIO", props, _edgeTypes);
// width: 1080, height: 1080 * (props.ratio || 1.77),

    const nodeTypes = useMemo(() => _nodeTypes, []);
    const edgeTypes = useMemo(() => _edgeTypes, []);

    return (
        <Box sx={{flex: 1, display: 'flex', flexDirection: 'column'}}>
            <ElectricalNodesProvider
                value={{
                    elements: props.elements,
                    printMode: true
                }}
                >
                <ReactFlowProvider>
                    <ViewportLogger />
                    <ReactFlow 
                        fitView
                        maxZoom={0.8}
                        connectionMode={ConnectionMode.Loose}
                        nodeTypes={nodeTypes}
                        edgeTypes={edgeTypes}
                        nodes={(props.nodes || []).concat([{ id: 'canvas', type: 'canvasNode', position: { x: 10, y: 10 }, data: {} }])}
                        edges={props.edges || []}
                        />
                </ReactFlowProvider>
                <Box sx={{display: 'flex'}}>
                    <InfoFooter info={props.info} />
                </Box>
            </ElectricalNodesProvider>
        </Box>
    )
}