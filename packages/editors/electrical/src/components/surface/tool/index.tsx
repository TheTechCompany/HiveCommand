import React, { forwardRef, useImperativeHandle, useMemo } from "react";
import { ActiveTool, ToolFactory, Tools } from "../../../tools";
import { useEditor } from "../context";

export interface EditorToolProps {
    clipboard?: any;

    activeTool?: ActiveTool;
    page?: any;

    onUpdate?: (page?: any) => void;
}

export const EditorTool = forwardRef<any, EditorToolProps>((props, ref) => {

    const { surface } = useEditor()

    const instances = Object.keys(Tools).map((toolKey) => {
            return {
                inst: (Tools as any)[toolKey]?.({
                    container: surface, 
                    state: {
                        activeTool: props.activeTool, clipboard: props.clipboard
                    }
                }, 
                props.page,
                props.onUpdate),
                key: toolKey
            }
        }).reduce((prev, curr) => ({...prev, [curr.key]: curr.inst}), {});

    // const factory = useMemo(() => props.activeTool ? (Tools as any)[props.activeTool?.type] as ToolFactory : null, [props.activeTool])
    const activeTool = surface && props.activeTool && (instances as any)[props.activeTool?.type];
    //?.({container: surface, state: { activeTool: props.activeTool, clipboard: props.clipboard }}, props.page, props.onUpdate)

    useImperativeHandle(ref, () => {
        return activeTool ? {
            ...activeTool,

            // onClick: () => alert("Stuff"),
            // onKeyDown: 
            // onMouseDown: 
        } : null
    });


    return null;

})