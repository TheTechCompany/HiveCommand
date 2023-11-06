import ReactFlow, {Background, Node, Edge} from 'reactflow'
import { Box } from '@mui/material';
import { nodeTypes } from '@hive-command/canvas-nodes'

import 'reactflow/dist/style.css';
import { useMemo } from 'react';

export interface InterfaceEditorProps {
    nodes: Node[],
    edges: Edge[]
}

export const InterfaceEditor : React.FC<InterfaceEditorProps> = (props) => {

    const _nodeTypes = useMemo(() => nodeTypes, [])

    return (
        <Box sx={{flex: 1}}>
            <ReactFlow
                nodes={props.nodes || []}
                edges={props.edges || []}
                nodeTypes={_nodeTypes}>
                <Background />
            </ReactFlow>
        </Box>
    )
}