import { InfiniteCanvasContext } from '@hexhive/ui';
import { Box } from '@mui/material';
import React, { useContext, useRef } from 'react';
import { ChangeCircle } from '@mui/icons-material';

// import { HMIContext } from '../../views/Editor/pages/controls/context';

export const EditorHandles : React.FC<{id: string, active: boolean, rotation: number, x: number, y: number, children?: any}> = (props) => {

    const { getRelativeCanvasPos = (opts: {x?: number, y?: number}) => ({x: 0, y: 0}) } = useContext(InfiniteCanvasContext)
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
            ref={containerRef}
            onClick={() => {
                selectNode?.(props.id);
            }}
            onPointerDown={(evt) => {

                let { x: startX, y: startY } = getRelativeCanvasPos?.({x: evt.clientX, y: evt.clientY});

                const host = evt.currentTarget;

                host.setPointerCapture(evt.pointerId);

                const mouseMove = (evt: any) => {

                    const { x, y } = getRelativeCanvasPos?.({x: evt.clientX, y: evt.clientY})

                    let deltaX = x - startX;
                    let deltaY = y - startY;

                    // updateNode(props.id, (data) => ({position: {x: data.position.x + deltaX, y: data.position.y + deltaY}}))

                    startX = x
                    startY = y;
                }

                const mouseUp = (evt: any) => {

                    host.releasePointerCapture(evt.pointerId);

                    host.removeEventListener('mousemove', mouseMove)
                    host.removeEventListener('mouseup', mouseUp)
                }

                host.addEventListener('mousemove', mouseMove)
                host.addEventListener('mouseup', mouseUp)

            }}
            sx={{
                position: 'absolute',
                top: props.y, 
                left: props.x,
                transform: `rotate(${props.rotation || 0}deg)`,
                cursor: 'pointer',
                pointerEvents: 'all'
            }}>
            <Box sx={{position: 'relative'}}>
                <div 
                    onPointerDown={(e) => {
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

                            // updateNode(props.id, (data) => ({
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

                            e.stopPropagation();

                            const host = e.currentTarget;

                            host.setPointerCapture(e.pointerId)

                            let { x: lastX, y: lastY } = getRelativeCanvasPos?.({x: e.clientX, y: e.clientY});

                            // containerRef.current
                            
                            const onMouseMove = (e: any) => {

                                const { x, y } = getRelativeCanvasPos?.({x: e.clientX, y: e.clientY})
                                

                                const newWidth = x - lastX
                                const newHeight = y - lastY

                                console.log({newWidth, newHeight});

                                // updateNode(props.id, (node) => {
                                //     console.log("UPDATE", {node})
                                //     let position = node.position;

                                //     let size = node.size;

                                //     if(!size.width) size.width = 0;
                                //     if(!size.height) size.height = 0;

                                //     switch(corner.id){
                                //         case 'top-right':
                                //             position.y += newHeight;

                                //             size.width += newWidth;
                                //             size.height += newHeight * -1;
                                //             break;
                                //         case 'bottom-left':
                                //             position.x += newWidth;

                                //             size.width += newWidth * -1;
                                //             size.height += newHeight;
                                //             break;
                                //         case 'top-left':
                                //             position.x += newWidth
                                //             position.y += newHeight;

                                //             size.width += newWidth * -1;
                                //             size.height += newHeight * -1;
                                            
                                //             break;
                                //         default:
                                //             size.width += newWidth;
                                //             size.height += newHeight;
                                //             break;
                                //     }

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
                            left: corner.left, 
                            width: 5, 
                            height: 5, 
                            cursor: 'pointer',
                            background: "#000",
                            zIndex: 99,
                        }}>

                        </div>
                ))}
                {props.children}
            </Box>
        </Box>
    )
}