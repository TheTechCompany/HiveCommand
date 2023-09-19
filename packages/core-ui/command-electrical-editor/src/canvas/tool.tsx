import React, { forwardRef, useImperativeHandle } from "react";
import { SymbolTool, WireTool, ClipboardTool, BoxTool, BoxOutlineTool, TextTool } from "../tools";
import { useCanvasContext } from "./context";

export interface CanvasToolProps {
    activeTool: string;
    page?: any;
}

export const CanvasTool = forwardRef<any, CanvasToolProps>((props, ref) => {

    const { wrapper } = useCanvasContext()

    const tools = { 
        clipboard: ClipboardTool,
        symbol: SymbolTool, //(flowWrapper, page),
        wire: WireTool, //(flowWrapper, page),
        box: BoxTool, //(flowWrapper, page),
        boxOutline: BoxOutlineTool, //(flowWrapper, page),
        text: TextTool //(flowWrapper, page)
    } 

    const activeTool = (tools as any)[props.activeTool]?.(wrapper, props.page)

    useImperativeHandle(ref, () => {
        return {
            ...activeTool,

            // onClick: () => alert("Stuff"),
            // onKeyDown: 
            // onMouseDown: 
        }
    });


    return null;

})

export const CanvasToolProvider = () => {

}