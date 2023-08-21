import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';
import { useEditorContext } from '../context';
import { IconButton, TextField, Typography } from '@mui/material';
import { Done } from '@mui/icons-material'

export const ElectricalSymbol = (props: NodeProps) => {

    const { elements } = useEditorContext();

    const { component } = useMemo(() => elements?.find((a) => a.name == props.data.symbol), [props.data.symbol]);

    const ports = component?.metadata?.ports || [];

    return (
        <div style={{
            background: props.selected ? 'rgba(0, 89, 220, 0.08)' : undefined,
            border: props.selected ? '1px dotted rgba(0, 89, 220, 0.8)' : undefined,
            transform: `rotate(${props.data.rotation}deg)`,
            width: props.data.width || '100px',
            height: props.data.height || 'auto'
        }}>
            {props.data.symbol ? component() : "no icon found"}
            <Handle type={"target"} id={props.id} position={Position.Left} style={{ position: "absolute" }} />
            <Handle type={"source"} id={props.id} position={Position.Left} style={{ position: "absolute" }} />

            {ports.map((port: any) => (
                <Handle type={"target"} id={port.id} position={Position.Left} style={{ position: "absolute", left: port.x, top: port.y }} />
            ))}
        </div>
    )
}

export const CanvasNode = (props: NodeProps) => {
    return (
        <div style={{ width: 50, height: 50, opacity: 0 }}>
            <Handle type="target" id={"canvas-target"} position={Position.Left} />
            <Handle type="source" id={"canvas-source"} position={Position.Left} />
        </div>
    )
}


export const BoxNode = (props: NodeProps) => {
    return (
        <div style={{
            background: props.selected ? 'rgba(0, 89, 220, 0.08)' : undefined,
            border: props.selected ? '1px dotted rgba(0, 89, 220, 0.8)' : undefined,
        }}>
            <div style={{

                width: props.data.width || 50,
                height: props.data.height || 50,
                border: props.data.border
            }}>

            </div>
        </div>
    )
}

export const TextNode = (props: NodeProps) => {

    const nodeRef = useRef<any>(null);

    const { onUpdatePage, page } = useEditorContext();

    const [ editText, setEditText ] = useState<any>(null);

    const [ applying, setApplying ] = useState(false);

    useEffect(() => {
        if(applying && props.data.text == editText){
            setApplying(false);

            // setEditText(null);
            // (async () => {

            // })();

            setTimeout(() => {
                setEditText(null);

            }, 100)
        }
    }, [props.data.text, editText, applying])

    // useEffect(() => {
 
    //     if(nodeRef.current){

    //         let oldBounds : any = {};

    //         let timer = setInterval(() => {
    //             const bounds = nodeRef.current?.getBoundingClientRect()

    //             if(oldBounds.width != bounds.width || oldBounds.height != bounds.height){
    //                 console.log(bounds.width, bounds.height);
    //             }

    //             oldBounds = bounds;
    //         }, 10)

    //         // const ro = new ResizeObserver(entries => {
    //         //     for (let entry of entries) {
    //         //       const cr = entry.contentRect;
    //         //       console.log('Element:', entry.target);
    //         //       console.log(`Element size: ${cr.width}px x ${cr.height}px`);
    //         //       console.log(`Element padding: ${cr.top}px ; ${cr.left}px`);
    //         //     }
    //         // });
    
    //         // const elem = nodeRef.current;

    //         // ro.observe(elem);

    //         return () => {
    //             // ro.unobserve(elem)
    //             clearInterval(timer)
    //         }
    //     }
    // }, [nodeRef.current])

    return (
        <div 
        ref={nodeRef}
        onDoubleClick={() => {
            setEditText(props.data.text)
        }}
        style={{
            background: props.selected ? 'rgba(0, 89, 220, 0.08)' : undefined,
            border: props.selected ? '1px dotted rgba(0, 89, 220, 0.8)' : undefined,
        }}>
            {editText != null ? (
                <div style={{display: 'flex', alignItems: 'center'}}>
                    <TextField 
                        size="small" 
                        onChange={(e) => setEditText(e.target.value)} 
                        value={editText} />
                    <IconButton onClick={() => {
                        let n = (page?.nodes || []).slice();
                        const ix = n?.findIndex((a) => a.id == props.id);

                        n[ix] = {
                            ...n[ix],
                            data: {
                                ...n[ix].data,
                                text: editText
                            }
                        }

                        console.log("new text")

                        setApplying(true)

                        onUpdatePage?.({
                            ...page,
                            nodes: n
                        });


                    }}>
                        <Done />
                    </IconButton>
                </div>
            ) : (
                <Typography>
                    {props.data.text}
                </Typography>
            )}
        </div>
    )
}