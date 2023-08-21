import React, { useEffect, useMemo } from 'react';
import { Background, ConnectionMode, Controls, MiniMap, ReactFlow, SelectionMode, useEdgesState, useNodesState } from 'reactflow';
import { useEditorContext } from '../context';
import { BoxNode, CanvasNode, ElectricalSymbol, TextNode } from './node';
import { WireEdge } from './edge';
import { isEqual } from 'lodash'

export const CanvasSurface = () => {

    const { pages, selectedPage, onUpdatePage, draftWire } = useEditorContext();
    
    const flowNodes = useMemo(() => pages?.find((a: any) => a.id == selectedPage)?.nodes || [], [selectedPage, pages])

    const [ nodes, setNodes, onNodesChange ] = useNodesState(flowNodes || [])
    const [ edges, setEdges, onEdgesChange ] = useEdgesState(flowNodes || [])

    useEffect(() => {
        console.log('SetNodes')
        setNodes(pages?.find((a: any) => a.id == selectedPage)?.nodes || [])
        setEdges(pages?.find((a: any) => a.id == selectedPage)?.edges || [])
    }, [selectedPage, pages])
  
    const nodeTypes = useMemo(() => ({
        electricalSymbol: ElectricalSymbol,
        canvasNode: CanvasNode,
        box: BoxNode,
        text: TextNode,
    }), [])

    const edgeTypes = useMemo(() => ({
        wire: WireEdge
    }), [])

    const nodeMap = (item: any) => {
        return {
            id: item.id,
            position: item.position,
            data: item.data,
            
        }
    }
    
    return (
        <ReactFlow
            snapGrid={[5, 5]}
            snapToGrid
            connectionMode={ConnectionMode.Loose}
            onSelectionChange={(selection) => {
                // console.log({selection})
            }}
            onNodesChange={(changes) => {

                let oldNodes = nodes.slice();

                onNodesChange(changes);

                if(!isEqual((oldNodes || []).map(nodeMap), (nodes || []).map(nodeMap))){
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
            nodes={nodes.concat([{ id: 'canvas', type: 'canvasNode', position: {x: 10, y: 10}, data: {} }])}
            edges={edges.concat([
                {id: '1', type: 'wire', data: {points: draftWire?.points || []}, source: "canvas", target: "canvas"}
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
    )
}