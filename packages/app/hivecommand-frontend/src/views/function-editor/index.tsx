import { Box, Divider, IconButton, List, ListItem, ListItemButton, Paper, TextField, Typography } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { FunctionTextEditor } from './editor';
import mermaid from 'mermaid';
import ReactFlow, { Handle, MarkerType, NodeProps, Position, useEdgesState, useNodesState } from 'reactflow';

import dagre from 'dagre'

import 'reactflow/dist/style.css';
import { Add, Delete, DragHandle, Visibility } from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { gql, useQuery, useMutation } from '@apollo/client';
import { SortableList } from '../../components/sortable-list';
import { TreeViewSortableList } from '../../components/sortable-list/tree-view';
import { arrayMove } from '@dnd-kit/sortable'

export const FunctionEditor = () => {


    const { id } = useParams();

    const { data } = useQuery(gql`
        query GetSchematic ($id: ID) {
            commandFunctions(where: {id: $id}){
                id

                pages {
                    id
                    name

                    label

                    parent { 
                        id
                    }
                    
                    children {
                        id
                        name
                        label
                    }

                    rank
                }
            }
        }
    `, {
        variables: {
            id
        }
    })

    const [createPage] = useMutation(gql`
    mutation CreatePage($fd: ID, $name: String, $parent: String) {
        createCommandFunctionPage(fd: $fd, input: {name: $name, parent: $parent}){
            id
        }
    }
`, {
    refetchQueries: ['GetSchematic'],
    awaitRefetchQueries: true
})

    const [updatePageOrder] = useMutation(gql`
    mutation UpdateOrder($fd: ID, $id: ID, $parent: String, $above: String, $below: String) {
        updateCommandFunctionPageOrder(fd: $fd, id: $id, parent: $parent, above: $above, below: $below)
    }
    `, {
    refetchQueries: ['GetSchematic'],
    awaitRefetchQueries: true
    })


    
    const [ editingPage, setEditingPage ] = useState<any>(null);

    const [ value, setValue ] = useState('');

    const [ selected, setSelected ] = useState<any>(null);
    
    const [ nodes, setNodes, onNodesChange ] = useNodesState<any[]>([]);
    const [ edges, setEdges, onEdgesChange] = useEdgesState<any[]>([]);

    useEffect(() => {
        setNodes(editingPage?.children?.map((x, ix) => ({
            id: x?.id, 
            label: x?.name,
            position: {
                x: 50,
                y: ix * 50
            },
            data: {
                label: x?.name
                // label: node.label,
                // width: node.width,
                // height: node.height
            }
        })))
        setEdges(editingPage?.children?.map((x, ix) => ({id: x?.id, source: x?.id, target: editingPage?.children?.[ix + 1]?.id})))

    }, [editingPage])

    useEffect(() => {

        const g = new dagre.graphlib.Graph()

        g.setGraph({})

        // setGraph(g);

        mermaid.initialize({});
    }, [])


    const nodeTypes = useMemo(() => ({ 
        add: AddNode,
        node: EditorNode,
        root: RootNode
     }), []);

     
     
    const fd = data?.commandFunctions?.[0];

    const pages = useMemo(() => {

        let rootPages = fd?.pages?.slice()?.filter((a) => !a.parent?.id)?.sort((a,b) => a.rank.localeCompare(b.rank))

        const getPages = (id: string) => {
            let pages = fd?.pages?.slice()?.filter((a) => a.parent?.id == id)?.sort((a,b) => a.rank.localeCompare(b.rank))
            return pages.map((page) => ({
                ...page,
                children: getPages(page.id)
            }))
        }   
        
        return rootPages?.map((page) => ({
            ...page,
            children: getPages(page.id)
        }))
    }, [fd])
    
    return (
        <Box sx={{flex: 1, display: 'flex'}}>
            <Paper sx={{minWidth: '300px', display: 'flex', flexDirection: 'column'}}>
                
                <Box sx={{display: 'flex', alignItems: 'center'}}>    
                    <Typography sx={{flex: 1, textAlign: 'center'}} fontWeight={"bold"}>Pages</Typography>
                    <IconButton onClick={() => {
                        
                        createPage({variables: {fd: id, name: 'New page'}});

                    }} size="small"><Add /></IconButton>
                </Box>
                <Divider />
                <TreeViewSortableList 
                    onReorderItems={(pageId: string, newIx: number, parent?: string) => {
                        let pages = fd?.pages?.slice()?.sort((a,b) => a.rank.localeCompare(b.rank))
                        
                        let sameParent = pages?.filter((a) => a.parent?.id === parent)

                        sameParent.push(pages?.find((a) => a.id === pageId))
                        
                        let newPages: any[] = arrayMove(sameParent, sameParent.length - 1, newIx);

                        let above = newPages?.[newIx - 1]?.id;
                        let below = newPages?.[newIx + 1]?.id;

                        console.log(pages, above, below)
                        return updatePageOrder({variables: { fd: id, id: pageId, parent, above, below }});
                    }}
                    onItemClick={(item) => {
                        console.log(item)
                        setEditingPage(item)
                    }}
                    onItemAdd={(parent) => {
                        createPage({variables: {fd: id, name: 'New page', parent}});
                    }}
                    getLabel={(item, ix) => `S${ix} - ${item.name}`}
                    items={pages}>
                
                </TreeViewSortableList>
            </Paper>
            <Paper sx={{flex: 1, margin: '6px', display: 'flex', flexDirection: 'column'}}>
                <Box sx={{bgcolor: 'secondary.main', display: 'flex', alignItems: 'center'}}>
                    <Typography sx={{margin: '6px'}}>{editingPage?.label}</Typography>
                    <input style={{background: 'transparent', width: '100%', outline: "none", border: 'none', height: '24px', fontSize: '1rem'}} type="text" value={editingPage?.name || ''} />
                </Box>
                <Box sx={{flex: 1, display :'flex'}}>
                <Box sx={{flex: 1, display: 'flex'}}>
                    <FunctionTextEditor 
                        value={value}
                        onChange={(e) => {
                            setValue(e);
    const mermaidText = `stateDiagram-v2
    ${e}`
                            try{
                                mermaid.parse(mermaidText).then((res) => {
                                    if(res){
                                        
                                        mermaid.mermaidAPI.getDiagramFromText(mermaidText).then((diag: any) => {
                                            diag.db.extract(diag.db.getRootDocV2())
                                            const states = diag.db.getStates();

                                            const relations = diag.db.getRelations();

                                            const g = new dagre.graphlib.Graph()

                                        
                                            g.setGraph({
                                                // align: 'UR'
                                            })

                                            g.setDefaultEdgeLabel(function() { return {}; });
                                            
                                            Object.keys(states).forEach(stateKey => {
                                                let stateItem = states[stateKey];

                                                
                                                g.setNode(stateKey, {width: stateKey == 'root_start' ? 50 : 200, height: 50, label:  stateItem.descriptions || stateItem.id});

                                                // g.setNode(`${stateKey}-add`, {width: 50, height: 50})

                                                // g.setEdge(stateKey, `${stateKey}-add`);
                                            })

                                            relations.forEach((relation) => {
                                                g.setEdge(relation.id1, relation.id2);
                                            })

                                            dagre.layout(g);

                                            let nodes : any[] = g.nodes().map((n, ix) => {
                                                // let stateItem = states[stateKey];
                                                let node = g.node(n);

                                                return {
                                                    id: n,
                                                    type: n == 'root_start' ? 'root' : 'node',
                                                    position: {
                                                        x: node.x + (n == 'root_start' ? 55 : 0),
                                                        y: node.y
                                                    },
                                                    data: {
                                                        label: node.label,
                                                        width: node.width,
                                                        height: node.height
                                                    }
                                                }
                                            });

                                            setNodes(nodes)
                                            

                                            setEdges(g.edges().map((e) => {
                                                let edge = g.edge(e);
                                                // console.log({e})
                                                e.name
                                                return {
                                                    id: `${e.w}-${e.v}`,
                                                    source: e.v,
                                                    target: e.w,
                                                    markerEnd: { type: MarkerType.ArrowClosed, color: 'gray' },
                                                }
                                            }))
            
                                            console.log({states, relations})
                                        })
                                    }
                                }).catch((e) => console.log(e))
                            }catch(e){

                            }
                        }}
                            />
                </Box>
                <Box sx={{flex: 1, display: 'flex'}}>
                    <ReactFlow
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onSelectionChange={(selection) => {
                            // setSelected(selection)
                        }}
                        nodeTypes={nodeTypes}
                        nodes={nodes}
                        edges={edges}
                        />
                </Box>
                </Box>
            </Paper>
        </Box>
    )
}

export const AddNode = (props: NodeProps) => {
    return (
        <IconButton sx={{bgcolor: 'primary.main'}}>
            <Add />
        </IconButton>
    )
}

export const EditorNode = (props: NodeProps) => {
    return (
        <div style={{background: 'white', width: '150px', borderRadius: '3px', padding: '6px'}}>
            <Handle type='target' position={Position.Top} />
            {props.data.label?.map((x, ix)=> 
                <div style={{color: 'black', borderBottom:  (ix == 0 && props.data?.label?.length > 1) ? '1px solid black' : undefined, textAlign: 'center'}}>
                    {x}
                </div>
            )}
            <Handle type='source' position={Position.Bottom} />

            {props.selected && (
                <Box sx={{position: 'absolute', display: 'flex', flexDirection: 'column', right: -40, top: -27}}>
                    <IconButton size="small" sx={{marginBottom: '3px'}}><Visibility sx={{width: '0.75em', height: '0.75em'}}/></IconButton>
                    
                    <IconButton size="small" sx={{bgcolor: "primary.main", marginTop: '3px', marginBottom: '3px'}}><Add sx={{width: '0.75em', height: '0.75em'}}/></IconButton>
                    <IconButton size="small" sx={{bgcolor: "error.main", marginTop: '3px'}}><Delete sx={{width: '0.75em', height: '0.75em'}} /></IconButton>
                </Box>
            )}
        </div>
    )
}


export const RootNode = (props: NodeProps) => {
    return (
        <div style={{background: 'white', minWidth: '50px', borderRadius: 6, minHeight: '50px'}}>
            <div>Start</div>
            <Handle type='source' position={Position.Bottom} />
        </div>
    )
}