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
// width: 1080, height: 1080 * (props.ratio || 1.77),

console.log(props.edges)
    // const { fitView } = useReactFlow();

    const ratio = 210/297;
    const width = 1080;
    const height = 1080 * ratio;

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
                            proOptions={{ hideAttribution: true }}
                            minZoom={0.1}
                            maxZoom={1}
                            connectionMode={ConnectionMode.Loose}
                            nodeTypes={nodeTypes}
                            edgeTypes={edgeTypes}
                            nodes={[
                                {
                                    id: 'page', 
                                    type: 'page', 
                                    draggable: false, 
                                    selectable: false, 
                                    position: { x: 0, y: 0 }, 
                                    data: { 
                                        width,
                                        height,
                                        project: props.info?.project,
                                        // {
                                        //     name: props.project?.name,
                                        //     version: `v${props.project?.version} - ${props.project?.versionDate}`
                                        // },
                                        page: props.info?.page
                                        //  {
                                        //     name: props.page?.name, 
                                        //     number: props.page?.number != null ? `Page: ${props.page?.number + 1}` : ''
                                        // }
                                    } 
                                },
                                { id: 'canvas', type: 'canvasNode', position: { x: pageMiddle.x, y: pageMiddle.y }, data: {} }
                            ].concat(props.nodes as any[] || [])}
                            edges={props.edges || []}
                            />
                </Box>
            </ElectricalNodesProvider>
        </Box>
    )
}