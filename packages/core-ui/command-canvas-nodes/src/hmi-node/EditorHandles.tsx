import { InfiniteCanvasContext } from '@hexhive/ui';
import { Box } from '@mui/material';
import React, { useContext, useRef } from 'react';
import { ChangeCircle } from '@mui/icons-material';

// import { HMIContext } from '../../views/Editor/pages/controls/context';
export interface HMINodeData {
    position?: {x: number, y: number};
    size?: {width: number, height: number};
    rotation?: number;
}

export interface EditorHandleProps {
    id: string;
    extraProps: any;
    active: boolean;
    scaleX: number;
    scaleY: number;
    
    width?: number;
    height?: number;

    rotation: number;
    x: number;
    y: number;
    children?: any

    // onEditBounds?: (id: string, updateFn: (node: HMINodeData) => HMINodeData) => void;
}

export const EditorHandles : React.FC<EditorHandleProps> = (props) => {

    const { getRelativeCanvasPos = (opts: {x?: number, y?: number}) => ({x: 0, y: 0}), updateNodeBounds, updateNode } = useContext(InfiniteCanvasContext)
    // const { updateNode } = useContext(HMIContext)

    const corners = [
        {
            id: 'top-left',
            top: -5,
            left: -5
        },
        {
            id: 'top-right',
            left: '100%',
            top: -5
        },
        {
            id: 'bottom-right',
            left: '100%', 
            top: '100%'
        },
        {
            id: 'bottom-left',
            left: -5,
            top: '100%'
        }
    ]

    const {
        selectNode,
    } = useContext(InfiniteCanvasContext)


    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <Box 
            {...props.extraProps}
            // onClick={() => {
            //     selectNode?.(props.id);
            // }}
          >
            <Box 
                ref={containerRef}
                sx={{position: 'relative', pointerEvents: 'none'}}>
                <div 
                    onPointerDown={(e) => {
                        console.log("Pointer down - editor")
                        e.stopPropagation();

                        const host = e.currentTarget;

                        host.setPointerCapture(e.pointerId);

                        const { x, y, width, height } = containerRef.current?.getBoundingClientRect() || {x: 0, y: 0, width: 0, height: 0};

                        const { x: startX, y: startY } = getRelativeCanvasPos?.({x, y})
                        // let { x: startX, y: startY } = getRelativeCanvasPos({x: e.clientX, y: e.clientY});

                        const onMouseMove = (e: any) => {

                            const { x, y } = getRelativeCanvasPos?.({x: e.clientX, y: e.clientY});

                            let deltaX = (startX + (width / 2))- x;
                            let deltaY = (startY + (height / 2)) - y;

                            let theta = Math.atan2(deltaY, deltaX);

                            theta *= 180 / Math.PI;

                            if(theta < 0) theta = 360 + theta;

                            console.log({theta});

                            updateNodeBounds?.(props.id, (node) => {
                                node.rotation = (Math.floor(theta / 5) * 5) - 90
                                return node;
                                // return {
                                // width,
                                // height,
                                // rotation: (Math.floor(theta / 5) * 5) - 90    
                            })
                            // (data) => ({
                            //     rotation: (Math.floor(theta / 5) * 5) - 90
                            // }))

                            // startX = x;
                            // startY = y;
                        }

                        const onMouseUp = () => {

                            host.releasePointerCapture(e.pointerId);

                            host.removeEventListener('mousemove', onMouseMove);
                            host.removeEventListener('mouseup', onMouseUp)
                        }

                        host.addEventListener('mousemove', onMouseMove);
                        host.addEventListener('mouseup', onMouseUp)

                    }}
                    style={{
                        display: !props.active ? 'none' : undefined,
                        position: 'absolute',
                        top: -24,
                        left: 'calc(50% - 12px)'
                    }}>
                    <ChangeCircle />
                </div>
                {corners.map((corner) => (
                    <div 
                        onPointerDown={(e) => {
                            console.log("Pointer down corner")
                            e.stopPropagation();
                            e.preventDefault();

                            const host = e.currentTarget;

                            host.setPointerCapture(e.pointerId)

                            let { x: lastX, y: lastY } = getRelativeCanvasPos?.({x: e.clientX, y: e.clientY});

                            const { x, y, width, height } = containerRef.current?.getBoundingClientRect() || {x: 0, y: 0, width: 0, height: 0};

                            // containerRef.current
                            
                            const onMouseMove = (e: any) => {

                                const { x, y } = getRelativeCanvasPos?.({x: e.clientX, y: e.clientY})
                                

                                const newWidth = x - lastX
                                const newHeight = y - lastY

                                console.log({newWidth, newHeight});

                                let position = {x: props.x || 0, y: props.y || 0};
                                let size = {width: props.width || 0, height: props.height || 0};


                                
                                console.log({position, size, rotation: props.rotation})
                                // updateNode?.(props.id, {
                                //     x: position.x,
                                //     y: position.y
                                // })
                                updateNodeBounds?.(props.id, (node) => {

                                    let position = {x: node.x, y: node.y} || {x: 0, y: 0};

                                    let size = {width: node.width, height: node.height} || {width: 0, height: 0};
    
                                    if(!size.height) size.height = 0;
                                    if(!size.width) size.width = 0;

                                    switch(corner.id){
                                        case 'top-right':
                                            position.y += newHeight;
    
                                            size.width += newWidth;
                                            size.height += newHeight * -1;
                                            break;
                                        case 'bottom-left':
                                            position.x += newWidth;
    
                                            size.width += newWidth * -1;
                                            size.height += newHeight;
                                            break;
                                        case 'top-left':
                                            position.x += newWidth
                                            position.y += newHeight;
    
                                            size.width += newWidth * -1;
                                            size.height += newHeight * -1;
                                            
                                            break;
                                        default:
                                            size.width += newWidth;
                                            size.height += newHeight;
                                            break;
                                    }
                                  
                                    node.width = size.width;
                                    node.height = size.height;

                                    node.x = position.x;
                                    node.y = position.y;
                                    
                                    return node;
                                });


                                // (node) => {
                                //     console.log("UPDATE", {node})
                                //   
                                //     if(!size.width) size.width = 0;
                                //     if(!size.height) size.height = 0;


                                //     return {
                                //         position,
                                //         size
                                //     }
                                // })

                                lastX = x;
                                lastY = y;

                            }

                            const onMouseUp = () => {
                                host.releasePointerCapture(e.pointerId)
                                host.removeEventListener('pointermove', onMouseMove)
                                host.removeEventListener('pointerup', onMouseUp)
                            }
                            host.addEventListener('pointermove', onMouseMove)
                            host.addEventListener('pointerup', onMouseUp)

                            console.log(`Corner ${corner.id} clicked`)
                        }}
                        style={{
                            position: 'absolute', 
                            display: !props.active ? 'none' : undefined, 
                            top: corner.top, 
                            pointerEvents: 'all',
                            left: corner.left, 
                            width: 5, 
                            height: 5, 
                            cursor: 'pointer',
                            background: "#000",
                            zIndex: 99,
                        }}>

                        </div>
                ))}
                <div    
                    style={{pointerEvents: 'none'}}>
                    {props.children}
                </div>
            </Box>
        </Box>
    )
}