import { ComponentTool, useInterfaceEditor } from "../../../context";
import React from "react";

export interface ToolOverlayProps {
    activeTool?: ComponentTool | null;
    pointer: { x: number; y : number} | null;
}

export const ToolOverlay : React.FC<ToolOverlayProps> = (props) => {
    
    const { packs } = useInterfaceEditor();

    const PackComponent = packs?.find((a) => a.id == props.activeTool?.pack)?.pack?.find((a) => a.name == props.activeTool?.name)?.component || (() => <div />);

    return (
        <div style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none'
        }}>
            {props.activeTool && props.pointer && (
                <div style={{position: 'absolute', width: (PackComponent as any).metadata.width, height: (PackComponent as any).metadata.height, left: props.pointer?.x, top: props.pointer?.y}}>
                    <PackComponent />
                </div>)}
        </div>
    )
}