import React, { useEffect, useMemo, useState } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';
import { useEditorContext } from '../context';
import { IconButton, TextField } from '@mui/material';
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

    const { onUpdatePage, page } = useEditorContext();

    const [ editText, setEditText ] = useState<any>(null);

    const [ applying, setApplying ] = useState(false);

    useEffect(() => {
        if(applying && props.data.text == editText){
            setApplying(false)

            setTimeout(() => {
                setEditText(null);
            }, 100)
        }
    }, [props.data.text, editText, applying])

    return (
        <div 
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
                <text>
                    {props.data.text}
                </text>
            )}
        </div>
    )
}