import { EditorCanvas, EditorCanvasSelection } from "@hive-command/editor-canvas";
import { Box } from "@mui/material";
import React, {KeyboardEvent, useEffect, useMemo, useRef, useState} from "react";
import { EditorOverlay } from "./overlay";
import { Node, Edge } from 'reactflow';
import { nodeTypes, edgeTypes } from "@hive-command/electrical-nodes";
import { EditorTool } from "./tool";
import { EditorProvider } from "./context";
import { ActiveTool, ToolProps } from "../../tools";
import { NodePropsModal } from "../node-props";

export interface ElectricalPage {
    id?: string;
    nodes?: Node[]
    edges?: Edge[]
}

export interface ElectricalSurfaceProps {
    page?: ElectricalPage
   
    onUpdate?: (page?: ElectricalPage) => void;

    selection?: EditorCanvasSelection;
    onSelect?: (selection: EditorCanvasSelection) => void;

    clipboard?: any;
    activeTool?: ActiveTool;
}

export const ElectricalSurface : React.FC<ElectricalSurfaceProps> = (props) => {

    const surfaceRef = React.useRef<HTMLDivElement>(null);
    const canvasRef = React.useRef<HTMLDivElement>(null);

    const toolRef = useRef<any>(null);

    const [ cursorPosition, setCursorPosition ] = useState<{x: number, y: number} | null>(null)

    const realCursorPosition = useMemo(() => {
        let b = surfaceRef?.current?.getBoundingClientRect?.();

        return {
            x: (cursorPosition?.x || 0) - (b?.x || 0),
            y: (cursorPosition?.y || 0) - (b?.y || 0)
        }
    }, [cursorPosition, surfaceRef.current])


    const [editNode, setEditNode] = useState<any>(null);

    const onKeyDown = (e: KeyboardEvent) => {
        // switch(e.key){
        //     case "c":
        //         setClipboard({cut: false, items: selected});
        //         return;
        //     case "v":
        //         // copyClipboard(clipboard)
        //         //if cut
        //         props.onPaste?.()
        //         return;
        //     case "x":
        //         setClipboard({cut: true, items: selected});
        //         //temp cut from board finish when pasted
        //         return;
        // }
      
        toolRef?.current?.onKeyDown?.(e);

    }

    useEffect(() => {
        let listener = (ev: MouseEvent) => {
            ev.stopPropagation();

            setCursorPosition({ x: ev.clientX, y: ev.clientY })

        }

        const mouseDown = (ev: MouseEvent) => {
            // ev.stopPropagation();

            // console.log("PointerDown");

            // surfaceRef?.current?.setPointerCapture((ev as any).pointerId)


            //---
            // console.log("CURRENT TARGET", ev.currentTarget)
            // // console.log("MouseDown", ev, surfaceRef.current, canvasRef.current);
            // if(!(ev as any).fake && ev.target && canvasRef.current?.contains(ev.target as any)){
            //     ev.stopPropagation();
            //     // ev.preventDefault();

            //     console.log("MouseDown", ev, ev.view);

            //     let event : any = new UIEvent('mousedown', {
            //         // clientX: ev.clientX, 
            //         // clientY: ev.clientY, 
            //         bubbles: true,
            //         view: window
            //         // relatedTarget: ev.target,
            //         // composed: true
            //     });
            //     event.clientX = ev.clientX;
            //     event.clientY = ev.clientY;

            //     // event = Object.assign({currentTarget: document.getElementsByClassName('react-flow__renderer')[0] }, event)

            //     // Object.defineProperty(event, 'currentTarget',  document.getElementsByClassName('react-flow__renderer')[0]);
                
            //     // console.log(event, document.getElementsByClassName('react-flow__renderer')[0])

            //     event.fake = true;
            //     // event.pointerId = ev + 1;

            //     surfaceRef?.current?.setPointerCapture((ev as any).pointerId)

            //     surfaceRef?.current?.removeEventListener('mousedown', mouseDown, true);

            //     document.getElementsByClassName('react-flow__renderer')[0]?.dispatchEvent(event)


            // }else{
            //     console.log(ev.target, ev.currentTarget, (ev as any).fake)
            // }

        }

        const mouseUp = (ev: MouseEvent) => {
            // surfaceRef?.current?.releasePointerCapture((ev as any).pointerId)
        }

        surfaceRef?.current?.addEventListener('pointerdown', mouseDown, true)
        surfaceRef?.current?.addEventListener('pointerup', mouseUp)

        surfaceRef?.current?.addEventListener('pointermove', listener, true);

        return () => {
            surfaceRef?.current?.removeEventListener('pointerdown', mouseDown, true);
            surfaceRef?.current?.removeEventListener('pointerup', mouseUp)

            surfaceRef?.current?.removeEventListener('pointermove', listener, true);
        }
    }, [])

    const canvas = useMemo(() => {
        const ratio = 210/297 //A4;

        const width = 1080;
        const height = 1080 * ratio;

        return (
            <EditorCanvas 
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            translateExtent={[[0, 0], [width, height]]}
            wrapper={surfaceRef.current}
            // selection={props.selection}
            onSelect={props.onSelect}
            nodes={[
                {id: 'page', type: 'page', draggable: false, selectable: false, position: { x: 0, y: 0 }, data: { width, height } } as any,
                {id: 'canvas', type: 'canvasNode', draggable: false, selectable: false, position: {x: 0, y: 0}, data: {} }
            ].concat(props?.page?.nodes || [])}
            edges={props?.page?.edges}
            onNodeDoubleClick={(node) => {
                const { props }: any = ToolProps.find((a) => a.id == node.type) || {}

                if (props) {
                    setEditNode({
                        ...node,
                        props: Object.keys(props).map((key) => ({ key, type: props[key], value: node?.data?.[key] }))
                    })
                }
            }} />
        )
    }, [props.page])

    return (
        <Box
            tabIndex={0}
            className="surface-container"
            ref={surfaceRef}
            sx={{flex: 1, display: 'flex', position: 'relative'}}
            onKeyDown={onKeyDown}
            onClick={(e) => {
                e.stopPropagation();

                let b = surfaceRef?.current?.getBoundingClientRect();

                e.clientX = e.clientX - (b?.x || 0);
                e.clientY = e.clientY - (b?.y || 0);
               
                toolRef?.current?.onClick(e);
            }}
            // onMouseDown={(e) => {
            //     e.stopPropagation();
            //     console.log("Mouse", e)
            // }}
            onMouseEnter={(e) => {
                e.stopPropagation();
                setCursorPosition({x: e.clientX, y: e.clientY});

                // let event : any = new Event('MouseEnter');
                // event.clientX = e.clientX;
                // event.clientY = e.clientY;
                // canvasRef.current?.dispatchEvent(event)
            }}
            onMouseLeave={(e) => {
                e.stopPropagation();

                setCursorPosition(null);

                // let event : any = new Event('MouseLeave');
                // // event.clientX = e.clientX;
                // // event.clientY = e.clientY;
                // canvasRef.current?.dispatchEvent(event)
            }}>
            <Box 
                className={`canvas-container ${props.activeTool ? 'active-tool' : ''}`} 
                ref={canvasRef}
                sx={{
                    flex: 1, 
                    display: 'flex',
                    backgroundColor: '#dfdfdf'
                }}>
                <EditorProvider value={{surface: surfaceRef}}>
                <NodePropsModal
                    open={Boolean(editNode)}
                    options={editNode?.props}
                    onSubmit={(options: any[]) => {
                        let values = options.reduce((prev, curr) => {
                            return {
                                ...prev,
                                [curr.key]: curr.value
                            }
                        }, {})

                        let n = (props.page?.nodes || []).slice();
                        const ix = n?.findIndex((a) => a.id == editNode?.id);

                        n[ix] = {
                            ...n[ix],
                            data: {
                                ...n[ix].data,
                                ...values
                                // text: editText
                            }
                        }


                        props.onUpdate?.({
                            ...props.page,
                            nodes: n
                        });

                        setEditNode(null);

                    }}
                    onClose={() => {
                        setEditNode(null);
                    }} />
                    {canvas}
                    
                    <EditorOverlay 
                        wrapper={surfaceRef}
                        tool={toolRef.current}
                        cursorPosition={realCursorPosition} />

                
                        <EditorTool 
                            ref={toolRef} 
                            clipboard={props.clipboard} 
                            page={{nodes: props.page?.nodes, edges: props.page?.edges}} 
                            onUpdate={(page) => {
                                console.log("onUpdate")
                                props.onUpdate?.({
                                    id: props.page?.id,
                                    ...page
                                })
                            }}
                            activeTool={props.activeTool} />
                </EditorProvider>
            </Box>
        </Box>

    )
}