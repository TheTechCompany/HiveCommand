import ReactFlow, { Background, Node, Edge, ConnectionMode, ReactFlowProvider, Connection, ReactFlowProps} from 'reactflow'
import { Box, Collapse, IconButton } from '@mui/material';
import { nodeTypes } from '@hive-command/canvas-nodes'

// import 'reactflow/dist/style.css';
import { useMemo, useState, KeyboardEvent, useEffect } from 'react';
import { Sidebar } from "./sidebar";
import { ComponentPack, ComponentTool, InterfaceEditorProvider } from './context';
import { InterfaceConnection, InterfaceEditorSurface } from './components/surface';
import { HMIType, HMITag, HMITemplate } from '@hive-command/interface-types';

export {InterfaceEditorSurface}

export interface InterfaceSelection {
    nodes: Node[]
    edges: Edge[];
}

export interface WorldOptions {
    grid?: [number, number, boolean];
}


export interface InterfaceEditorProps {

    flowProps?: ReactFlowProps;

    selected?: InterfaceSelection
    onSelectionChange?: (selection: InterfaceSelection) => void;

    nodes: Node[],
    edges: Edge[],

    tags: HMITag[];
    types: HMIType[];
    templates: HMITemplate[];

    packs: ComponentPack[]

    world?: WorldOptions;
    onWorldChange?: (world: WorldOptions) => void;

    onNodeCreate?: (node: Node) => void;
    onNodeUpdate?: (node: Node) => void;
    onNodeDelete?: (node: Node | Node[]) => void;

    onEdgeCreate?: (connection: InterfaceConnection) => void;
    onEdgeUpdate?: (edge: Partial<InterfaceConnection>) => void;
    onEdgeDelete?: (edge: Edge | Edge[]) => void;
}

export const InterfaceEditor : React.FC<InterfaceEditorProps> = (props) => {

    const defaultGrid : [number, number, boolean] = [5, 5, false];

    const [ worldOptions, setWorldOptions ] = useState<WorldOptions>({
        grid: defaultGrid,
        ...props.world
    })

    const [ selected, setSelected ] = useState<InterfaceSelection | undefined>(undefined)

    const [ toolRotation, setRotation ] = useState(0)
    const [ activeTool, _setActiveTool ] = useState<ComponentTool | null>(null)

    const setActiveTool = (tool: ComponentTool | null) => {
        _setActiveTool(tool);
        setRotation(0)
    }   

    const onKeyDown = (e: KeyboardEvent) => {
        if(e.key == 'Escape') {
            e.preventDefault();
            setActiveTool(null);
        }

        if(e.key == 'Tab'){
            setRotation((r) => (r + 90) % 360)
        }
    }

    useEffect(() => {
        setSelected(props.selected)
    }, [props.selected])

    const node_ids = useMemo(() => (props.nodes || []).map((x) => x.id), [props.nodes])
    const edge_ids = useMemo(() => (props.edges || []).map((x) => x.id), [props.edges])

    const updateWorld = (key: string, value: any) => {
        let world = Object.assign({}, props.world);
        (world as any)[key] = value;
        setWorldOptions(world);
        props.onWorldChange?.(world)
    }

    useEffect(() => {
        setWorldOptions(props.world || {})
    }, [props.world])

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
            toolRotation,
            changeTool: (tool: ComponentTool | null) => setActiveTool(tool),
            grid: worldOptions?.grid,
            onChangeGrid: (grid) => {
                updateWorld('grid', grid)
            }
        }}>
            <Box 
                tabIndex={0} 
                onKeyDown={onKeyDown} 
                sx={{flex: 1, display: 'flex'}}>
                <ReactFlowProvider>
                    <InterfaceEditorSurface 
                        flowProps={props.flowProps}
                        nodes={props.nodes}
                        edges={props.edges}
                        selected={selected}
                        onSelectionChange={(selected) => {

                            //Bad setState on startup
                            setSelected({
                                edges: (selected?.edges || []).filter((a) => edge_ids.includes(a.id)),
                                nodes: (selected?.nodes || []).filter((a) => node_ids.includes(a.id))
                            })

                            if(selected) props.onSelectionChange?.(selected)

                        }}
                        onNodeCreate={props.onNodeCreate}
                        onNodeUpdate={props.onNodeUpdate}
                        onNodeDelete={(nodes) => {
                            if(props.onNodeDelete){

                                    let n_ids = Array.isArray(nodes) ? nodes.map((x) => x.id) : [nodes.id];

                                    let newSelection = {
                                        edges: selected?.edges || [],
                                        nodes: (selected?.nodes || []).filter((a) => {
                                            return n_ids.indexOf(a.id) < 0;
                                        })
                                    }

                                    setSelected(newSelection);

                                    props.onSelectionChange?.(newSelection)

                                    props.onNodeDelete?.(nodes);
                            }
                        }}
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