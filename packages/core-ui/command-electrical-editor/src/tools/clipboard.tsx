import { nodeTypes } from "@hive-command/electrical-nodes";
import { useCanvasContext } from "../canvas/context"
import { useEditorContext } from "../context";
import { OverlayProps } from ".";
import { useReactFlow, useViewport } from "reactflow";
import { nanoid } from "nanoid";

export const ClipboardTool = (flowWrapper: any, page: any) => {

    const { zoom } = useViewport();

    const { project } = useReactFlow();

    const { clipboard, onUpdatePage } = useEditorContext();

    const onClick = (e: MouseEvent) => {

        const wrapperBounds = flowWrapper?.current?.getBoundingClientRect()
        const position = project({
            x: (e.clientX || 0) - (wrapperBounds?.x || 0),
            y: (e.clientY || 0) - (wrapperBounds?.y || 0)
        })

        const minX = Math.min(...clipboard?.items?.nodes.map((n: any) => n.position.x)) //+ wrapperBounds.x 
        const minY = Math.min(...clipboard?.items?.nodes.map((n: any) => n.position.y)) //+ wrapperBounds.y=

        // const { nodes, edges } = clipboard?.items || {};


        let nodes = (page?.nodes || []).slice();
        let edges = (page?.edges || []).slice();

        nodes = nodes.concat(clipboard?.items?.nodes?.map((item: any) => ({
            id: nanoid(),
            type: item.type,
            position: {
                x: position.x + (item.position.x - minX),
                y: position.y + (item.position.y - minY)
            },
            data: {
                ...item.data
            }
        })))

        edges = edges.concat(clipboard?.items?.edges?.map((item: any) => ({
            id: nanoid(),
            type: 'wire', 
            source: 'canvas', 
            target: 'canvas', 
            data: {
                points: item.data?.points?.map((point: any) => ({
                    x: position.x + (point.x - minX),
                    y: position.y + (point.y - minY)
                }))
            }
        })))

        if(clipboard.cut){
            nodes = nodes.filter((a: any) => clipboard.items?.nodes?.findIndex((b: any) => a.id == b.id) < 0)
            edges = edges.filter((a: any) => clipboard.items?.edges?.findIndex((b: any) => a.id == b.id) < 0)
        }
   
        onUpdatePage?.({
            ...page,
            nodes,
            edges
        }, "onClick")



    }

    const Overlay = (props: OverlayProps) => {

        const wrapperBounds = flowWrapper?.current?.getBoundingClientRect()



        const { nodes, edges } = clipboard?.items || {};

        const minX = Math.min(...nodes.map((n: any) => n.position.x)) //+ wrapperBounds.x 
        const minY = Math.min(...nodes.map((n: any) => n.position.y)) //+ wrapperBounds.y

        const width = Math.max(...nodes.map((n: any) => n.position.x + n.width)) - minX;
        const height = Math.max(...nodes.map((n: any) => n.position.y + n.height)) - minY;

      
        const renderedNodes = nodes?.map((x: any) => {
           
            return (<div style={{position: 'absolute', left: (x.position.x - minX), top: (x.position.y - minY) }}>
                {(nodeTypes as any)[x.type]({ ...x, id: `tmp-${nanoid()}` })}
                </div>
            )
            // switch(x.type){
            //     case 'box':
            //         return (<BoxNode)
            // }
        });

        return (
            <div style={{
                position: 'absolute', 
                width: Math.abs(width), 
                height: Math.abs(width), 
                transformBox: 'fill-box', 
                transformOrigin: 'top left', 
                transform: `scale(${zoom})`, 
                left: (props.cursorPosition?.x  ||0 )- wrapperBounds.x, 
                top: (props.cursorPosition?.y  || 0)- wrapperBounds.y
            }}>
                <div style={{position: 'relative'}}>
                {renderedNodes}
                </div>
            </div>
        )
    }

    return {
        onClick,
        Overlay
    }
}