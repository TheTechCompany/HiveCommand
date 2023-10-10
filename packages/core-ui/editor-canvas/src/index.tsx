import React, {MouseEvent, useEffect, useState} from 'react';
import { Box } from '@mui/material';
import { ReactFlow, MiniMap, Controls, Background, Node, Edge, NodeTypes, EdgeTypes, useOnSelectionChange, useNodesState, useEdgesState, CoordinateExtent, ConnectionMode, useViewport, useReactFlow } from 'reactflow';

export interface EditorCanvasSelection {
    nodes?: Node[];
    edges?: Edge[];
}

export interface EditorCanvasProps {
    nodes?: Node[],
    edges?: Edge[],

    nodeTypes?: NodeTypes,
    edgeTypes?: EdgeTypes

    fitView?: boolean;
    translateExtent?: CoordinateExtent

    selection?: EditorCanvasSelection;
    onSelect?: (selection: EditorCanvasSelection) => void;
    onNodeDoubleClick?: (node: Node) => void;

    wrapper?: any;
}

export const EditorCanvas : React.FC<EditorCanvasProps> = (props) => {

    const [ nodes, setNodes, onNodesChange ] = useNodesState(props.nodes || [])
    const [ edges, setEdges, onEdgesChange ] = useEdgesState(props.edges || [])

    const [ selection, setSelection ] = useState<EditorCanvasSelection>({});

    const [ selectionZone, setSelectionZone ] = useState<{start?: {x: number, y: number}} | null>(null);

    const { project } = useReactFlow();

    const { x, y, zoom }  = useViewport()

    const onSelectionStart = (e: MouseEvent) => {
        let bounds = props.wrapper?.getBoundingClientRect();

        setSelectionZone({
            start: project({
                x: e.clientX - (bounds.x || 0),
                y: e.clientY - (bounds.y || 0)
            })
        })
    }

    const onSelectionEnd = (e: MouseEvent) => {
        let bounds = props.wrapper?.getBoundingClientRect();

        let zone = {
            ...selectionZone,
            end: project({
                x: e.clientX - (bounds.x || 0),
                y: e.clientY - (bounds.y || 0)
            })
        }

        let zoneOrientationX = (zone?.start?.x || 0) < (zone.end?.x || 0)
        let zoneOrientationY = (zone?.start?.y || 0) < (zone.end?.y || 0)

        let currentSelection = Object.assign({}, selection);

        let selectEdges = props.edges?.filter((edge) => {
            if((currentSelection?.edges || []).findIndex((a) => a.id == edge.id) > -1){
                return false;
            }
            return edge.data?.points?.filter((point: {x: number, y: number}) => {

                let xIn = zoneOrientationX ? point.x > (zone.start?.x || 0) && point.x < (zone.end?.x || 0) : point.x > (zone.end?.x || 0) && point.x < (zone.start?.x || 0)
                let yIn = zoneOrientationY ? point.y > (zone.start?.y || 0) && point.y < (zone.end?.y || 0) : point.y > (zone.end?.y || 0) && point.y < (zone.start?.y || 0)

                return xIn && yIn
            })?.length > 0;
        })

        currentSelection.edges = currentSelection.edges?.concat(selectEdges || [])
        
        setSelection(currentSelection);

        props.onSelect?.(currentSelection);
        
        setSelectionZone(null);
    }

    useOnSelectionChange({
        onChange: (params) => {
            setSelection(params);
            props.onSelect?.(params)
        }
    })

    useEffect(() => {
        setNodes(
            (props.nodes || []).map((e) => ({
                ...e,
                selected: selection?.nodes?.find((a) => a.id == e.id) != null
            }))
        )
    }, [props.nodes, selection])

    useEffect(() => {
        setEdges(
            (props.edges || []).map((e) => ({
                ...e,
                selected: selection?.edges?.find((a) => a.id == e.id) != null
            }))
        )
    }, [props.edges, selection])


    return (
        <Box sx={{flex: 1, display: 'flex'}}>
            <ReactFlow
                nodeTypes={props.nodeTypes}
                edgeTypes={props.edgeTypes}
                nodes={nodes || []}
                edges={edges || []}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView={props.fitView}
                minZoom={0.8}
                translateExtent={props.translateExtent}
                onSelectionStart={onSelectionStart}
                onSelectionEnd={onSelectionEnd}
                // onSelectionDrag={()}
                onNodeDoubleClick={(ev, node) => props.onNodeDoubleClick?.(node)}
                connectionMode={ConnectionMode.Loose}
                >
                <Background />
                <Controls />
                <MiniMap />
                {props.children}
            </ReactFlow>
        </Box>
    )
}