import { InfiniteCanvasContext } from '@hexhive/ui';
import { Box } from '@mui/material';
import React, { useContext, useRef } from 'react';
import { ChangeCircle } from '@mui/icons-material';
import { HMIContext } from '../../views/Editor/pages/controls/context';

export const EditorHandles : React.FC<{id: string, active: boolean, scaleX: any, scaleY: any, rotation: number, x: number, y: number}> = (props) => {

    const { getRelativeCanvasPos } = useContext(InfiniteCanvasContext)
    const { updateNode } = useContext(HMIContext)

    const cornerRefs = useRef<{[key: string]: HTMLDivElement}>({})

    const corners = [
        {
            id: 'top-left',
            leftAnchor: 'top-right',
            topAnchor: 'bottom-left',
            top: -5,
            left: -5
        },
        {
            id: 'top-right',
            leftAnchor: 'top-left',
            topAnchor: 'bottom-right',
            left: '100%',
            top: -5
        },
        {
            id: 'bottom-right',
            leftAnchor: 'bottom-left',
            topAnchor: 'top-right',
            left: '100%', 
            top: '100%'
        },
        {
            id: 'bottom-left',
            leftAnchor: 'bottom-right',
            topAnchor: 'top-left',
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
            data-nodeid={props.id}
            onClick={(e) => {
                if(e.currentTarget !== e.target) return;
                selectNode(props.id);
            }}
            onPointerDown={(evt) => {

                if(evt.target !== evt.currentTarget) return;

                selectNode(props.id);

                let { x: startX, y: startY } = getRelativeCanvasPos({x: evt.clientX, y: evt.clientY});

                const host = evt.currentTarget;

                console.log({tgt: evt.target});

                host.setPointerCapture(evt.pointerId);

                const mouseMove = (evt: any) => {

                    const { x, y } = getRelativeCanvasPos({x: evt.clientX, y: evt.clientY})

                    let deltaX = x - startX;
                    let deltaY = y - startY;

                    updateNode(props.id, (data) => ({position: {x: data.position.x + deltaX, y: data.position.y + deltaY}}))

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
                transform: `rotate(${props.rotation || 0}deg) scaleX(${props.scaleX}) scaleY(${props.scaleY})`,
                cursor: 'pointer',
                zIndex: 99,
                pointerEvents: 'all'
            }}>
            <Box sx={{position: 'relative', pointerEvents: 'none'}}>
                <div     
                    onPointerDown={(e) => {
                        e.stopPropagation();

                        const host = e.currentTarget;

                        host.setPointerCapture(e.pointerId);

                        const { x, y, width, height } = containerRef.current?.getBoundingClientRect();

                        const { x: startX, y: startY } = getRelativeCanvasPos({x, y})

                        // let { x: startX, y: startY } = getRelativeCanvasPos({x: e.clientX, y: e.clientY});

                        const onMouseMove = (e: any) => {

                            const { x, y } = getRelativeCanvasPos({x: e.clientX, y: e.clientY});

                            let deltaX = (startX + (width / 2))- x;
                            let deltaY = (startY + (height / 2)) - y;

                            let theta = Math.atan2(deltaY, deltaX);

                            theta *= 180 / Math.PI;

                            if(theta < 0) theta = 360 + theta;

                            console.log({theta});

                            updateNode(props.id, (data) => ({
                                rotation: (Math.floor(theta / 5) * 5) - 90
                            }))

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
                        pointerEvents: 'all',
                        left: 'calc(50% - 12px)'
                    }}>
                    <ChangeCircle />
                </div>
                {corners.map((corner) => (
                    <div 
                        ref={(r) => cornerRefs.current[corner.id] = r}
                        onPointerDown={(e) => {

                            e.stopPropagation();

                            const host = e.currentTarget;

                            host.setPointerCapture(e.pointerId)

                            let { x: lastX, y: lastY } = getRelativeCanvasPos({x: e.clientX, y: e.clientY});

                            const { x, y, width, height } = containerRef.current?.getBoundingClientRect();

                            const { x: leftX, y: leftY } = cornerRefs.current[corner.leftAnchor].getBoundingClientRect();
                            const { x: topX, y: topY } = cornerRefs.current[corner.topAnchor].getBoundingClientRect();
                            // const leftAnchor = corners.find((a) => a.id == corner.leftAnchor)
                            // const topAnchor = corners.find((a) => a.id == corner.topAnchor)

                            // let { left: leftX, top: leftY } = leftAnchor;
                            // let { left: topX, top: topY } = topAnchor;

                            // if(typeof(leftAnchor.top) == 'string'){
                            //     leftY = y + (height / 100 * parseFloat((`${leftAnchor.top}`).match(/(.+)%/)?.[1]))
                            // }else{
                            //     leftY = parseFloat(`${leftY}`) + y;
                            // }

                            // if(typeof(leftAnchor.left) == 'string'){
                            //     leftX = y + (width / 100 * parseFloat((`${leftAnchor.left}`).match(/(.+)%/)?.[1]))
                            // }else{
                            //     leftX = parseFloat(`${leftX}`) + y;
                            // }


                         
                            // if(typeof(topAnchor.top) == 'string'){
                            //     topY = y + (height / 100 * parseFloat((`${topAnchor.top}`).match(/(.+)%/)?.[1]))
                            // }else{
                            //     topY = parseFloat(`${topY}`) + y;
                            // }

                            // if(typeof(topAnchor.left) == 'string'){
                            //     topX = y + (width / 100 * parseFloat((`${topAnchor.left}`).match(/(.+)%/)?.[1]))
                            // }else{
                            //     topX = parseFloat(`${topX}`) + y;
                            // }


                            // containerRef.current
                            
                            const onMouseMove = (e) => {
                                console.log({e})

                                const { x, y } = getRelativeCanvasPos({x: e.clientX, y: e.clientY})


                                const { x:containerX, y:containerY, width, height } = containerRef.current?.getBoundingClientRect();
                                
                                // consy 

                                const { x: leftX, y: leftY } = cornerRefs.current[corner.leftAnchor].getBoundingClientRect();
                                const { x: topX, y: topY } = cornerRefs.current[corner.topAnchor].getBoundingClientRect();
                              

                                const angle = Math.atan2(y - lastY, x - lastX)

                                const len = Math.sqrt(Math.pow(x - lastX, 2) + Math.pow(y - lastY, 2))

                                const newHeight = Math.sin(angle) * len;
                                const newWidth = Math.cos(angle) * len;
                                console.log({angle, width: width + newHeight, height: height + newWidth})

                            // const newWidth = Math.sqrt((Math.pow(x-leftX, 2)) + Math.pow(y - leftY, 2))
                            // const newHeight = Math.sqrt((Math.pow(topX - x, 2)) + Math.pow(topY - y, 2))
                                // const newWidth = width - ((x - leftX) *-1)
                                // const newHeight = height - ((y - topY)* -1)

                                console.log({newWidth, newHeight, leftX, topY, x, y, width, height});

                                updateNode(props.id, (node) => {
                                    console.log("UPDATE", {node})
                                    let position = node.position;

                                    let size = node.size;

                                    if(!size.width) size.width = 0;
                                    if(!size.height) size.height = 0;

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

                                    return {
                                        position,
                                        size
                                    }
                                })

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
                            pointerEvents: 'all',
                            background: "#000",
                            zIndex: 99,
                        }}>

                        </div>
                ))}
                <div style={{zIndex: -1, pointerEvents: 'none'}}>
                    {props.children}
                </div>
            </Box>
        </Box>
    )
}