import { Box } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import {NodeProps, Handle, NodeResizer, useStore, useUpdateNodeInternals } from 'reactflow';
import { drag } from 'd3-drag';
import { select } from 'd3-selection';

export const HMINode = (editor: boolean) => 
    (props: NodeProps) => {

        const [ width, setWidth ] = useState(props.data?.width);
        const [ height, setHeight ] = useState(props.data?.height);

        const rotateControlRef = useRef(null)
        const [ rotation, setRotation ] = useState(props.data?.rotation || 0);

        const updateNodeInternals = useUpdateNodeInternals();

        const Icon = props?.data?.extras?.icon || (() => <div>no component found</div>)

        const onNodesChange : any = useStore((s) => s.onNodesChange)

        useEffect(() => {
            setRotation(props.data?.rotation || 0)
        }, [props.data?.rotation])

        useEffect(() => {
            if (!rotateControlRef.current) {
              return;
            }
        
            const selection = select(rotateControlRef.current);
            let rot = rotation;
            const dragHandler = drag().on('drag', (evt) => {
              const dx = evt.x - 100;
              const dy = evt.y - 100;
              const rad = Math.atan2(dx, dy);
              const deg = rad * (180 / Math.PI);
              

            //   onNodesChange([{type: 'dimensions', id: props.id, rotating: true, dimensions: { rotation: 180 - deg } }])
                rot = 180 -deg;
              setRotation(180 - deg);
              updateNodeInternals(props.id);
            }).on('end', () => {

              onNodesChange([{type: 'dimensions', id: props.id, rotating: true, dimensions: { rotation : rot } }])

            });
        

            selection.call(dragHandler as any);

          }, [props.id, updateNodeInternals]);

        return (
            <Box sx={{
                transform: `rotate(${rotation}deg)`,
                width: props.data?.width || '72px',
                height: props.data?.height || '72px',
                background: props.selected ? 'rgba(0, 89, 220, 0.08)' : undefined,
                border: props.selected ? '1px dotted rgba(0, 89, 220, 0.8)' : undefined,
            }}>
                <NodeResizer isVisible={props.selected && editor} />
                <Box
                    ref={rotateControlRef}
                    sx={{
                        display: props.selected ? 'block' : 'none',
                        position: 'absolute',
                        width: '10px',
                        height: '10px',
                        background: '#3367d9',
                        left: '50%',
                        top: '-30px',
                        borderRadius: '100%',
                        transform: 'translate(-50%, -50%)',
                        cursor: 'alias',
                        '&:after': {
                            content: '""',
                            display: 'block',
                            position: 'absolute',
                            width: '1px',
                            height: '30px',
                            background: '#3367d9',
                            left: '4px',
                            top: '5px',
                        }
                    }}
                    className={`nodrag`}
                    />
                    <Icon
                        // editing={props.building}
                
                        options={props.data?.dataValue}
                        width={props?.data?.width}
                        height={props?.data?.height}
                        // {...props.options}
                        size="medium" />

                        {props.data?.extras?.ports && props.data?.extras?.ports.map((port: any) => (

    // visibility: props.building ? undefined : 'hidden', 
                                    // <Box
                                    //     key={`base-node:${props.id}:port:${port.id}`}
                                    //     sx={{position: 'absolute', width: '6px', height: '6px', left: port.x, top: port.y}}>
                                        <Handle
                                            style={{
                                                position: 'absolute',
                                                left: port.x,
                                                top: port.y
                                            }}
                                            // style={{
                                            //     left: 0,
                                            //     top: 0,
                                            //     transform: 'none'
                                            // }}
                                            id="in"
                                            {...port}
                                            // hidden={!props.building}
                                            scaleX={props.data?.extras?.scaleX}
                                            scaleY={props.data?.extras?.scaleY}
                                            direction="center" />
                                    // </Box>
                        ))}
            </Box>
        )
    }