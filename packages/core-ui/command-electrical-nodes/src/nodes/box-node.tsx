import React from 'react';
import { NodeProps } from 'reactflow';

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
