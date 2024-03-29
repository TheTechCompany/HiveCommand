import React, { forwardRef, memo, useImperativeHandle, useMemo } from "react";
import { ActiveTool, ToolFactory, Tools } from "../../../tools";
import { useEditor } from "../context";
import { isEqual } from 'lodash';

export interface EditorToolProps {
    clipboard?: any;

    activeTool?: ActiveTool;
    page?: any;

    cursorPosition?: {x: number, y: number} | null;
    onUpdate?: (page?: any) => void;
}

export const EditorTool = forwardRef<any, EditorToolProps>((props, ref) => {

    const { surface } = useEditor()



    // const instances = Object.keys(Tools).map((toolKey) => {
    //         return {
    //             inst: (Tools as any)[toolKey]?.(
    //                 {
    //                     container: surface, 
    //                     state: {
    //                         activeTool: props.activeTool, 
    //                         // clipboard: props.clipboard
    //                     }
    //                 }, 
    //                 props.page,
    //                 props.onUpdate
    //             ),
    //             key: toolKey
    //         }
    // }).reduce((prev, curr) => ({...prev, [curr.key]: curr.inst}), {});

    // const factory = useMemo(() => props.activeTool ? (Tools as any)[props.activeTool?.type] as ToolFactory : null, [props.activeTool])

    // const activeTool = surface && props.activeTool && (instances as any)[props.activeTool?.type];

    //?.({container: surface, state: { activeTool: props.activeTool, clipboard: props.clipboard }}, props.page, props.onUpdate)

    const Tool = surface && props.activeTool && (Tools as any)[props.activeTool?.type] || forwardRef(() => <div />)

    // useImperativeHandle(ref, () => {
    //     return activeTool ? {
    //         ...activeTool,

    //         // onClick: () => alert("Stuff"),
    //         // onKeyDown: 
    //         // onMouseDown: 
    //     } : null
    // });

    return (props.cursorPosition?.x && props.cursorPosition?.y) ? <Tool
        page={props.page}
        onUpdate={props.onUpdate}
        cursorPosition={props.cursorPosition}
        surface={{
            container: surface,
            state: {
                activeTool: props.activeTool,
                // clipboard: props.clipboard
            }
        }}
        ref={ref} /> : null;

})

// , (prev, next) => {
//     // console.log("SEQUAL", prev, next, !isEqual({page: prev.page, activeTool: prev.activeTool}, {page: next.page, activeTool: next.activeTool}));
//     return !isEqual({page: prev.page, activeTool: prev.activeTool}, {page: next.page, activeTool: next.activeTool})
// })