import React, {useEffect, useMemo, useRef} from "react";

import { Background, Controls, MiniMap, ReactFlow, SelectionMode, useNodesState, useReactFlow } from 'reactflow'
import { ElectricalSymbol } from './node';

import 'reactflow/dist/style.css';
import { useEditorContext } from "../context";
import { Box } from "@mui/material";
import { CursorCrosshairs } from "./cursor-crosshairs";
import { nanoid } from 'nanoid'

export const Canvas = () => {
    

    const flowWrapper = useRef<HTMLDivElement>(null);

    const { cursorPosition, selectedSymbol, pages, selectedPage, onUpdatePage, symbolRotation } = useEditorContext();

    const { project } = useReactFlow()

    const nodeTypes = useMemo(() => ({
        electricalSymbol: ElectricalSymbol
    }), [])

    const wrapperBounds = useMemo(() => {
        return flowWrapper.current?.getBoundingClientRect()
    }, [flowWrapper.current])

    const symbolPosition = useMemo(() => {
        return project({
            x: (cursorPosition?.x || 0) - (wrapperBounds?.x || 0),
            y: (cursorPosition?.y || 0) - (wrapperBounds?.y || 0)
        })
    }, [cursorPosition, selectedSymbol, wrapperBounds])

    const flowNodes = useMemo(() => pages?.find((a: any) => a.id == selectedPage)?.nodes || [], [selectedPage, pages])

    const [ nodes, setNodes, onNodesChange ] = useNodesState(flowNodes || [])

    useEffect(() => {
        setNodes(pages?.find((a: any) => a.id == selectedPage)?.nodes || [])
    }, [selectedPage, pages])

    return (
        <Box
            onClick={(e) => {
                if(symbolPosition && selectedSymbol){

                    let n = nodes.slice();
                    n.push({
                        id: nanoid(),
                        position: {
                            x: symbolPosition.x,
                            y: symbolPosition.y,
                           
                        },
                        data: { 
                            symbol: selectedSymbol.name, 
                            rotation: symbolRotation,
                            width: selectedSymbol.component?.metadata?.width, 
                            height: selectedSymbol.component?.metadata?.height 
                        },
                        type: 'electricalSymbol'
                    })
                    console.log({pages, selectedPage})
                    onUpdatePage?.({
                        ...pages?.find((a) => a.id == selectedPage),
                        nodes: n
                    })
                   
                }
            }}
            ref={flowWrapper} 
            sx={{display: 'flex', flex: 1, position: 'relative'}}>
            <ReactFlow
                snapGrid={[5, 5]}
                snapToGrid
                selectionMode={SelectionMode.Partial}
                onSelectionChange={(selection) => {
                    console.log({selection})
                }}
                onNodesChange={(changes) => {
                    onNodesChange(changes);

                    onUpdatePage?.({
                        ...pages?.find((a) => a.id == selectedPage),
                        nodes: nodes
                    })
                }}
                nodes={((nodes || []) as any[]).concat(cursorPosition && selectedSymbol ? [
                    {
                        id: '1', 
                        position: {x: symbolPosition.x , y: symbolPosition.y }, 
                        data: {
                            symbol: selectedSymbol?.name, 
                            rotation: symbolRotation, 
                            width: selectedSymbol.component?.metadata?.width, 
                            height: selectedSymbol.component?.metadata?.height
                        }, 
                        type: 'electricalSymbol'
                    }
                ] : [])}
                nodeTypes={nodeTypes}    
            >
                <Background gap={10} />
                <Controls />
                <MiniMap />
            </ReactFlow>
            <CursorCrosshairs wrapperBounds={wrapperBounds} />
        </Box>
    )
}