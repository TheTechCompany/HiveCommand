import React, { useEffect, useMemo, useState } from 'react';
import { Background, ConnectionMode, Controls, MiniMap, ReactFlow, SelectionMode, useEdgesState, useNodesState, useOnSelectionChange, useReactFlow } from 'reactflow';
import { useEditorContext } from '../context';
import { nodeTypes as _nodeTypes, edgeTypes as _edgeTypes, ElectricalNodesProvider } from '@hive-command/electrical-nodes';
import { WireEdge } from './edge';
import { isEqual } from 'lodash'
import { useCanvasContext } from './context';

export const CanvasSurface = () => {

    const { pages, selectedPage, onUpdatePage, draftWire, elements } = useEditorContext();

    const { wrapper } = useCanvasContext();

    const { project } = useReactFlow()

    const page = useMemo(() => pages?.find((a: any) => a.id == selectedPage) || { edges: [], nodes: [] }, [selectedPage, pages])
    const { nodes: flowNodes, edges: flowEdges } = page;

    const [selected, setSelected] = useState<any>({ nodes: [], edges: [] })

    const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes || [])
    const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges || [])

    useEffect(() => {
        console.log('SetNodes')
        setNodes(pages?.find((a: any) => a.id == selectedPage)?.nodes || [])
        setEdges(pages?.find((a: any) => a.id == selectedPage)?.edges || [])
    }, [selectedPage, pages])

    const nodeTypes = useMemo(() => _nodeTypes, [])

    const edgeTypes = useMemo(() => _edgeTypes, [])

    const nodeMap = (item: any) => {
        return {
            id: item.id,
            type: item.type,
            position: item.position,
            data: item.data
        }
    }

    const finalNodes = useMemo(() => (nodes.map((x) => ({ ...x, selected: selected.nodes.findIndex((a: any) => a.id == x.id) > -1 })) as any[]), [nodes, selected])
    const finalEdges = useMemo(() => (edges.map((x) => ({ ...x, selected: selected.edges.findIndex((a: any) => a.id == x.id) > -1 })) as any[]), [edges, selected])

    const onEdgePointCreated = (id: string, ix: number, pos: {x: number, y: number}) => {
        let newEdges = (edges).slice();

        let edgeIx = newEdges.findIndex((a) => a.id == id);

        let points = [...(newEdges[edgeIx]?.data?.points || [])];

        const bounds = wrapper?.current?.getBoundingClientRect();

        points?.splice(ix + 1, 0, project({x: pos.x - bounds.x, y: pos.y - bounds.y}) )

        newEdges[edgeIx] = {
            ...newEdges?.[edgeIx],
            data: {
                ...newEdges?.[edgeIx]?.data,
                points
            }
        }

        onUpdatePage?.({
            ...page,
            edges: newEdges
        })
    }

    const onEdgePointChanged = (id: string, ix: number, change: {x: number, y: number}) => {
        let e = (edges).slice();

        let edgeIx = (e).findIndex((a) => a.id == id)

        const points = (e[edgeIx]?.data?.points || []).slice();

        points[ix] = {
            ...points[ix],
            x: change.x,
            y: change.y
        }

        console.log({change})

        e[edgeIx] = {
            ...e[edgeIx],
            data: {
                ...e[edgeIx].data,
                points
            }
        }

        onUpdatePage?.({
            ...page,
            edges: e
        })
    }

    return (
        <ElectricalNodesProvider
            value={{
                elements: elements,
                onEdgePointCreated,
                onEdgePointChanged
            }}>
            <ReactFlow
                snapGrid={[5, 5]}
                snapToGrid
                connectionMode={ConnectionMode.Loose}
                onSelectionChange={(selection) => {

                    if (!isEqual(selected, selection)) {
                        console.log({ selection })
                        setSelected(selection)

                    }

                }}
                onNodesChange={(changes) => {

                    let oldNodes = nodes.slice();

                    onNodesChange(changes);


                    if (!isEqual((flowNodes || []).map(nodeMap), (nodes || []).map(nodeMap))) {

                        console.log("NODES CHANGED", { changes })

                        console.log("update page");

                        onUpdatePage?.({
                            ...pages?.find((a) => a.id == selectedPage),
                            nodes: nodes
                        }, "onNodesChanged")
                    }


                }}
                onNodesDelete={(deleted_nodes) => {
                    onUpdatePage?.({
                        ...pages?.find((a) => a.id == selectedPage),
                        nodes: nodes.filter((a) => deleted_nodes.findIndex((b) => b.id == a.id) < 0)
                    })
                }}
                onEdgesChange={(changes) => {
                    onEdgesChange(changes)
                }}
                onEdgesDelete={(deleted_edges) => {
                    onUpdatePage?.({
                        ...pages?.find((a) => a.id == selectedPage),
                        edges: edges.filter((a) => deleted_edges.findIndex((b) => b.id == a.id) < 0)
                    })
                }}
                nodes={nodes.concat([{ id: 'canvas', type: 'canvasNode', position: { x: 10, y: 10 }, data: {} }])}
                edges={edges.concat([
                    { id: '1', type: 'wire', data: { points: draftWire?.points || [] }, source: "canvas", target: "canvas" }
                ])}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}

            // onNodeClick={undefined}
            // onPaneClick={undefined}
            >

                <Background gap={10} />
                <Controls />
                <MiniMap />
            </ReactFlow>
        </ElectricalNodesProvider>
    )
}