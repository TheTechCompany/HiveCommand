import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";

import { Background, Controls, MiniMap, ReactFlow, SelectionMode, Transform, Viewport, XYPosition, useNodesState, useOnSelectionChange, useOnViewportChange, useReactFlow } from 'reactflow'
import { ElectricalSymbol } from './node';

import 'reactflow/dist/style.css';
import { useEditorContext } from "../context";
import { Box } from "@mui/material";
import { nanoid } from 'nanoid'
import { CanvasOverlay } from "./overlay";
import { CanvasSurface } from "./surface";
import { SymbolTool } from "../tools/symbol";
import { WireTool, BoxOutlineTool, BoxTool, TextTool } from "../tools";
import { CanvasProvider } from "./context";

const cursorImport = require('./cursor.svg');

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
}

export const Canvas : React.FC<CanvasProps> = (props) => {
  
    const flowWrapper = useRef<HTMLDivElement>(null);

    const { selectedSymbol, symbolRotation } = props;

    const { pages, selectedPage  } = useEditorContext();

    const { project, getViewport } = useReactFlow()

    const page = pages?.find((a) => a.id == selectedPage)

    const [cursorActive, setCursorActive] = useState(false);
    const [cursorPosition, setCursorPosition] = useState<{ x: number, y: number } | null>(null)

    const tools = { 
        symbol: SymbolTool(flowWrapper, page),
        wire: WireTool(flowWrapper, page),
        box: BoxTool(flowWrapper, page),
        boxOutline: BoxOutlineTool(flowWrapper, page),
        text: TextTool(flowWrapper, page)
    } //].map((tool) => tool(flowWrapper, page))

    const symbolPosition = useMemo(() => {
        const wrapperBounds = flowWrapper.current?.getBoundingClientRect()
        return cursorActive ? project({
            x: (cursorPosition?.x || 0) - (wrapperBounds?.x || 0),
            y: (cursorPosition?.y || 0) - (wrapperBounds?.y || 0)
        }) : null;
    }, [ cursorActive, cursorPosition, selectedSymbol ])


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

    const surface = useMemo(() => <CanvasSurface />, [])

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


    // useEffect(() => {
    //     const listener = (e: KeyboardEvent) => {
    //      console.log("KeyDown")

    //         if(props.activeTool)
    //         (tools as any)[props.activeTool]?.onKeyDown?.(e)
    //     }
        
    //     window.addEventListener('keydown', listener);

    //     return () => {
    //         window.removeEventListener('keydown', listener);
    //     }
    // }, [props.activeTool])

    return (
        <CanvasProvider value={{wrapper: flowWrapper}}>
        <Box
            tabIndex={0}
            ref={flowWrapper}
            onMouseDown={(e) => {
                // (e.currentTarget as HTMLElement).setPointerCapture((e as any).pointerId);

                if(props.activeTool) (tools as any)[props.activeTool]?.onMouseDown?.(e)
            }}
            onKeyDown={(e) => {
                console.log({key: e.key});

                if(props.activeTool) (tools as any)[props.activeTool]?.onKeyDown?.(e);
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
                
                if(props.activeTool) (tools as any)[props.activeTool]?.onClick?.(e);

              
            }}
            sx={{ display: 'flex', flex: 1, position: 'relative'}}>
          
            {surface}

            <CanvasOverlay 
                cursorPosition={cursorActive ? cursorPosition : null}
                page={pages?.find((a) => a.id == selectedPage)}
                wrapper={flowWrapper}
                />
        </Box>
        </CanvasProvider>
    )
}