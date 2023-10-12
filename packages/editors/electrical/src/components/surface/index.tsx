import { EditorCanvas, EditorCanvasSelection } from "@hive-command/editor-canvas";
import { Box } from "@mui/material";
import React, { useCallback, KeyboardEvent, useEffect, useMemo, useRef, useState, RefObject, forwardRef, MutableRefObject } from "react";
import { EditorOverlay } from "./overlay";
import { Node, Edge } from 'reactflow';
import { nodeTypes, edgeTypes } from "@hive-command/electrical-nodes";
import { EditorTool } from "./tool";
import { EditorProvider } from "./context";
import { ActiveTool, ToolInstance, ToolProps } from "../../tools";
import { NodePropsModal } from "../node-props";
import { ElectricalPage } from "../../types";


export interface ElectricalSurfaceProps {
    page?: ElectricalPage
    project?: { name: string, versionDate?: string, version?: number };

    onUpdate?: (page?: ElectricalPage) => void;

    selection?: EditorCanvasSelection;
    onSelect?: (selection: EditorCanvasSelection) => void;

    clipboard?: any;

    // toolRef?: RefObject<ToolInstance>;
    activeTool?: ActiveTool;

    onCopy?: () => void;
    onCut?: () => void;
    onPaste?: () => void;

    onDelete?: () => void;

    onEditorEnter?: () => void;
    onEditorLeave?: () => void;

    keyRng?: number;
}

export const ElectricalSurface = forwardRef<any, ElectricalSurfaceProps>((props, ref) => {
    const toolRef = useRef<ToolInstance | null>(null);

    // useEffect(() => {
    //     const node = myRef.current;
    //     const listen = (): void => console.log("foo");
    
    //     if (node) {
    //       node.addEventListener("mouseover", listen);
    //       return () => {
    //         node.removeEventListener("mouseover", listen);
    //       };
    //     }
    //   }, [ref]);
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

    const surfaceRef = React.useRef<HTMLDivElement>(null);
    const canvasRef = React.useRef<HTMLDivElement>(null);


    const [cursorPosition, setCursorPosition] = useState<{ x: number, y: number } | null>(null)

    const realCursorPosition = useMemo(() => {
        let b = surfaceRef?.current?.getBoundingClientRect?.();

        return {
            x: (cursorPosition?.x || 0) - (b?.x || 0),
            y: (cursorPosition?.y || 0) - (b?.y || 0)
        }
    }, [cursorPosition, surfaceRef.current])


    const [editNode, setEditNode] = useState<any>(null);

    const [keyCounter, setKeyCounter] = useState<number>(0);

    // const onKeyDown = (e: KeyboardEvent) => {
    //     toolRef?.current?.onKeyDown?.(e);


    //     if (e.ctrlKey || e.metaKey) {
    //         switch (e.key) {
    //             case "c":
    //                 props.onCopy?.();
    //                 // setClipboard({cut: false, items: selected});
    //                 return;
    //             case "v":
    //                 // copyClipboard(clipboard)
    //                 //if cut
    //                 props.onPaste?.()
    //                 return;
    //             case "x":
    //                 props.onCut?.();
    //                 // setClipboard({cut: true, items: selected});
    //                 //temp cut from board finish when pasted
    //                 return;
    //         }
    //     } else {
    //         switch (e.key) {
    //             case 'Tab':
    //                 e.preventDefault();

    //                 break;
    //             case 'Delete':
    //             case 'Backspace':
    //                 props.onDelete?.();
    //                 break;
    //         }
    //     }

    //     setTimeout(() => {

    //         setKeyCounter((k) => (k + 1) % 10)

    //     }, 0)

    // }

    useEffect(() => {
        let listener = (ev: MouseEvent) => {
            ev.stopPropagation();

            // cursorPosition.current = {x: ev.clientX, y: ev.clientY};

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

    const onNodesChange = useCallback((nodes: Node[]) => {
        props.onUpdate?.({
            ...props.page,
            nodes
        })
    }, [JSON.stringify(props.page)])

    const canvas = useMemo(() => {
        const ratio = 210 / 297 //A4;

        const width = 1080;
        const height = 1080 * ratio;

        const page = props.page;

        return (
            <EditorCanvas
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
                translateExtent={[[0, 0], [width, height]]}
                nodeExtent={[[0, 0], [width, height - 55]]}
                wrapper={surfaceRef.current}
                selection={props.selection}
                onSelect={props.onSelect}
                nodes={[
                    {
                        id: 'page',
                        type: 'page',
                        draggable: false,
                        selectable: false,
                        position: { x: 0, y: 0 },
                        data: {
                            width,
                            height,
                            project: {
                                name: props.project?.name,
                                version: props.project?.version ? `Revision ${props.project?.version} - ${props.project?.versionDate}` : 'Draft'
                            },
                            page: {
                                name: props.page?.name,
                                number: props.page?.number != null ? `Page: ${props.page?.number + 1}` : ''
                            }
                        }
                    } as any,
                    { id: 'canvas', type: 'canvasNode', draggable: false, selectable: false, position: { x: 0, y: 0 }, data: {} }
                ].concat(props?.page?.nodes || [])}
                edges={props?.page?.edges}
                onPageChanged={(newPage) => {
                    props.onUpdate?.({
                        ...page,
                        ...newPage
                    })
                }}
                onNodesChanged={onNodesChange}
                onEdgesChanged={(edges) => {
                    props.onUpdate?.({
                        ...page,
                        edges
                    })
                }}
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
    }, [props.page, props.selection, props.project, onNodesChange])

    const onSubmitNodeProps = (options: any[]) => {
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

    }


    return (
        <Box
            tabIndex={0}
            className="surface-container"
            ref={surfaceRef}
            sx={{ flex: 1, display: 'flex', position: 'relative' }}
            // onKeyDown={onKeyDown}
            onClick={(e) => {
                e.stopPropagation();

                let b = surfaceRef?.current?.getBoundingClientRect();

                e.clientX = e.clientX - (b?.x || 0);
                e.clientY = e.clientY - (b?.y || 0);

                toolRef?.current?.onClick?.(e);
            }}
            // onMouseDown={(e) => {
            //     e.stopPropagation();
            //     console.log("Mouse", e)
            // }}
            onMouseEnter={(e) => {
                e.stopPropagation();
                // cursorPosition.current = {x: e.clientX, y: e.clientY};

                props.onEditorEnter?.();

                setCursorPosition({ x: e.clientX, y: e.clientY });

                // let event : any = new Event('MouseEnter');
                // event.clientX = e.clientX;
                // event.clientY = e.clientY;
                // canvasRef.current?.dispatchEvent(event)
            }}
            onMouseLeave={(e) => {
                e.stopPropagation();

                props.onEditorLeave?.();

                setCursorPosition(null);
                // cursorPosition.current = null


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
                <EditorProvider value={{ surface: surfaceRef }}>
                    <NodePropsModal
                        open={Boolean(editNode)}
                        options={editNode?.props}
                        onSubmit={onSubmitNodeProps}
                        onClose={() => {
                            setEditNode(null);
                        }} />

                    {canvas}

                    <EditorOverlay
                        wrapper={surfaceRef}
                        tool={toolRef.current}
                        keyCounter={props.keyRng}
                        cursorPosition={realCursorPosition} />

                    <EditorTool
                        ref={(r) => {
                            toolRef.current = r;
                            (ref as any).current = r;
                        }}
                        page={{ nodes: props.page?.nodes, edges: props.page?.edges }}
                        onUpdate={(page) => {
                            props.onUpdate?.({
                                id: props.page?.id,
                                ...page
                            })
                        }}
                        activeTool={props.activeTool}
                    />
                </EditorProvider>
            </Box>
        </Box>

    )
})