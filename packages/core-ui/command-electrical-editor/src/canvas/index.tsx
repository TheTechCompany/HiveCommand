import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";

import { Background, Controls, MiniMap, ReactFlow, SelectionMode, Transform, Viewport, XYPosition, useNodesState, useOnSelectionChange, useOnViewportChange, useReactFlow } from 'reactflow'

import 'reactflow/dist/style.css';
import { useEditorContext } from "../context";
import { Box } from "@mui/material";
import { nanoid } from 'nanoid'
import { CanvasOverlay } from "./overlay";
import { CanvasSurface } from "./surface";
import { SymbolTool } from "../tools/symbol";
import { WireTool, BoxOutlineTool, BoxTool, TextTool } from "../tools";
import { CanvasProvider } from "./context";
import { CanvasTool } from "./tool";

export const rendererPointToPoint = ({ x, y }: XYPosition, [tx, ty, tScale]: Transform): XYPosition => {
    return {
      x: x * tScale + tx,
      y: y * tScale + ty,
    };
};

export interface CanvasProps {
    activeTool?: string;
    symbolRotation?: number;
    selectedSymbol?: any;

    onEdit?: (elem: any) => void;
    onPaste?: () => void;
}

export const Canvas : React.FC<CanvasProps> = (props) => {
  
    const flowWrapper = useRef<HTMLDivElement>(null);

    const { pages, selectedPage, selected, clipboard, setClipboard  } = useEditorContext();

    const { project, getViewport } = useReactFlow()

    const page = pages?.find((a) => a.id == selectedPage)

    const [cursorActive, setCursorActive] = useState(false);
    const [cursorPosition, setCursorPosition] = useState<{ x: number, y: number } | null>(null)

    // const tools = { 
    //     symbol: SymbolTool(flowWrapper), //(flowWrapper, page),
    //     wire: WireTool(flowWrapper), //(flowWrapper, page),
    //     box: BoxTool(flowWrapper), //(flowWrapper, page),
    //     boxOutline: BoxOutlineTool(flowWrapper), //(flowWrapper, page),
    //     text: TextTool(flowWrapper) //(flowWrapper, page)
    // } //].map((tool) => tool(flowWrapper, page))


    // const finalFlowNodes = useMemo(() => ((nodes || []) as any[]).concat(cursorPosition && selectedSymbol ? [
    //     {
    //         id: '1', 
    //         position: {x: symbolPosition.x , y: symbolPosition.y }, 
    //         data: {
    //             symbol: selectedSymbol?.name, 
    //             rotation: symbolRotation, 
    //             width: selectedSymbol.component?.metadata?.width, 
    //             height: selectedSymbol.component?.metadata?.height
    //         }, 
    //         type: 'electricalSymbol'
    //     }
    // ] : []), [cursorPosition, selectedSymbol, symbolRotation])

    const surface = useMemo(() => <CanvasSurface onEdit={props.onEdit} />, [])

    let [ viewportDatum, setViewportDatum ] = useState<{x: number, y: number, zoom: number} | null>(null)

    useOnViewportChange({
        onStart: useCallback((viewport: Viewport) => {
            setViewportDatum(viewport)
        }, []),
        onChange: useCallback((viewport: Viewport) => {
            if(viewportDatum){
                const {x, y} = viewport //()

                const deltaX = x - (viewportDatum?.x || 0);
                const deltaY = y - (viewportDatum?.y || 0);

                setCursorPosition((pos) => ({x: (pos?.x || 0) + (deltaX), y: (pos?.y || 0) + (deltaY) }) )
            }

            setViewportDatum(viewport)

        }, [viewportDatum]),
        onEnd: useCallback((viewport: Viewport) => {
            setViewportDatum(null)
        }, []),
    });

    useEffect(() => {
        let listener = (ev: MouseEvent) => {
            if(cursorActive){
                setCursorPosition({ x: ev.clientX, y: ev.clientY })
            }
        }

        document.addEventListener('mousemove', listener);

        return () => {
            document.removeEventListener('mousemove', listener);
        }
    })

    const toolRef = useRef<any>(null);

    useEffect(() => {
        const listener = (e: KeyboardEvent) => {
           
            toolRef?.current?.onKeyDown?.(e);
             
        }

        window.addEventListener('keydown', listener);

        return () => {
            window.removeEventListener('keydown', listener);
        }
    }, [])


    return (
        <CanvasProvider value={{wrapper: flowWrapper}}>
        <Box
            className={`canvas-wrapper ${props.activeTool ? 'active-tool' : ''}`}
            tabIndex={0}
            ref={flowWrapper}
            onPointerDown={(e) => {
                // (e.currentTarget as HTMLElement).setPointerCapture((e as any).pointerId);
                // e.preventDefault();

                toolRef?.current?.onMouseDown?.(e);
                // if(activeTool) activeTool?.onMouseDown?.(e)
            }}
            onKeyDown={(e) => {

                switch(e.key){
                    case "c":
                        setClipboard({cut: false, items: selected});
                        return;
                    case "v":
                        // copyClipboard(clipboard)
                        //if cut
                        props.onPaste?.()
                        return;
                    case "x":
                        setClipboard({cut: true, items: selected});
                        //temp cut from board finish when pasted
                        return;
                }
                // toolRef?.current?.onKeyDown?.(e);
                // if(activeTool) activeTool?.onKeyDown?.(e);
            }}
            onMouseEnter={(e) => { 
                setCursorActive(true);

            }}
            // onMouseMove={() => console.log("move")}
            onMouseLeave={(e) => {
                console.log("Leave")

                setCursorActive(false);
                setCursorPosition(null);

                // (e.currentTarget as HTMLElement).exitPointerLock()

            }}
            onClick={(e) => {
                
                toolRef?.current?.onClick(e);
                // if(activeTool) activeTool?.onClick?.(e);

              
            }}
            sx={{ display: 'flex', cursor: props.activeTool ? 'crosshair !important' : undefined, flex: 1, position: 'relative'}}>
            
            {surface}

            {props.activeTool && <CanvasTool 
                ref={toolRef}
                activeTool={props.activeTool} 
                page={page} />}

            <CanvasOverlay
                tool={toolRef.current} 
                cursorPosition={cursorActive ? cursorPosition : null}
                page={pages?.find((a) => a.id == selectedPage)}
                wrapper={flowWrapper}
                />
        </Box>
        </CanvasProvider>
    )
}