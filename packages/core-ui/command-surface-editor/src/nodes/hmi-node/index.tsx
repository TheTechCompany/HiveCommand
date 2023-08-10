import React from "react";
import { ErrorBoundary } from 'react-error-boundary';
import { NodeProps, Handle, Position } from 'reactflow';

export const HMINode = (props: NodeProps) => {
    // console.log
    const Icon = props.data.icon;

    console.log("HMI Node", props)

    return Icon ? (
        <ErrorBoundary fallback={<div>Error rendering node</div>}>
            {props.data?.ports?.map((port: any) => (
                <Handle id={port.id} type={port.type || "source"} style={{
                    left: port.x,
                    top: port.y
                }} position={Position.Right} />
            ))}
            {/* <div>
                <label htmlFor="text">Text:</label>
                <input id="text" name="text" className="nodrag" />
            </div> */}
            <div style={{
                width: props.data?.width,
                height: props.data?.height,
                background: props.selected ? 'rgba(0, 0, 127, 0.1)' : undefined,
                border: props.selected ? '1px solid blue' : undefined,
                boxShadow: props.selected ? '0px 5px 10px -5px gray' : undefined,
                pointerEvents: 'none'
            }}>
                <Icon
                    // editing={props.building}

                    // options={props.extras?.dataValue}
                    width={props?.data?.width}
                    height={props?.data?.height}
                    // {...props.options}
                    size="medium" />
            </div>
        </ErrorBoundary>
    ) : <div>Error rendering node</div>
}