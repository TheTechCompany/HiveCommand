import React, {useEffect, useMemo} from 'react';
import { Box, Typography } from '@mui/material';
import { useReactFlow, ReactFlow, ReactFlowProvider, Node, Edge, ConnectionMode } from 'reactflow';
import 'reactflow/dist/style.css';
import { ViewportLogger } from './viewport';
import { nodeTypes as _nodeTypes, edgeTypes as _edgeTypes, ElectricalNodesProvider } from '@hive-command/electrical-nodes'
import { InfoFooter } from './info-footer';

export * from './context';

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

    // const { fitView } = useReactFlow();

    const nodeTypes = useMemo(() => _nodeTypes, []);
    const edgeTypes = useMemo(() => _edgeTypes, []);

    const pageMiddle = useMemo(() => {
        let minX = Math.min(...props.nodes?.map((x) => x.position?.x))
        let maxX = Math.max(...props.nodes?.map((x) => x.position?.x))

        let minY = Math.min(...props.nodes?.map((x) => x.position?.y))
        let maxY = Math.max(...props.nodes?.map((x) => x.position?.y))

        return {
            x: minX + ((maxX - minX) / 2),
            y: minY + ((maxY - minY) / 2)
        }
    }, [props.nodes])

    // useEffect(() => {
        
    //     fitView?.();

    // }, [JSON.stringify(props.nodes), JSON.stringify(props.edges)])


    return (
        <Box sx={{flex: 1, display: 'flex', flexDirection: 'column'}}>
            <ElectricalNodesProvider
                value={{
                    elements: props.elements,
                    printMode: true
                }}
                >
                <Box sx={{flex: 1, display: 'flex'}}>
                        <ViewportLogger />
                        <ReactFlow 
                            // fitView
                            // maxZoom={0.5}
                            minZoom={0.1}
                            maxZoom={1}
                            connectionMode={ConnectionMode.Loose}
                            nodeTypes={nodeTypes}
                            edgeTypes={edgeTypes}
                            nodes={(props.nodes || []).concat([{ id: 'canvas', type: 'canvasNode', hidden: true, position: { x: pageMiddle.x, y: pageMiddle.y }, data: {} }])}
                            edges={props.edges || []}
                            />
                </Box>
                <Box sx={{display: 'flex'}}>
                    <InfoFooter info={props.info} />
                </Box>
            </ElectricalNodesProvider>
        </Box>
    )
}