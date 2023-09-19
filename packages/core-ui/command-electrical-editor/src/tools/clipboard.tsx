import { nodeTypes } from "@hive-command/electrical-nodes";
import { useCanvasContext } from "../canvas/context"
import { useEditorContext } from "../context";
import { OverlayProps } from ".";

export const ClipboardTool = () => {


    const Overlay = (props: OverlayProps) => {
        const { clipboard } = useEditorContext();

        console.log({clipboard: clipboard.items});

        const { nodes, edges } = clipboard?.items || {};

        const renderedNodes = nodes?.map((x: any) => {
            return (<div style={{position: 'absolute', left:x.position.x, top: x.position.y}}>
                {(nodeTypes as any)[x.type]({ ...x })}
                </div>
            )
            // switch(x.type){
            //     case 'box':
            //         return (<BoxNode)
            // }
        });

        return (
            <div style={{position: 'absolute', left: props.cursorPosition?.x, top: props.cursorPosition?.y}}>
                <div style={{position: 'relative'}}>
                {renderedNodes}
                </div>
            </div>
        )
    }

    return {
        onClick: () => {},
        Overlay
    }
}