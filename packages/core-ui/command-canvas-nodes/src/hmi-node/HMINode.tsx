import React, { useMemo, useState, useEffect, useContext, useRef } from 'react';
import styled from 'styled-components'
import { Box, Typography as Text } from '@mui/material'
import { PortWidget } from '@hexhive/ui';
import { InfiniteCanvasContext } from '@hexhive/ui'
export interface IconNodeProps {
    id?: string;
    x: number;
    y: number;

    building?: boolean;
    className?: string;
    extras?: {
        options?: any;
        dataValue?: any;

        label?: string;
        color?: string;

        icon?: any;

        iconString?: string;

        devicePlaceholder?: {
            tag?: string;

            type: {
                tagPrefix?: string;
            }
        }

        configuration?: any;

        ports?: any[];

        showTotalizer?: boolean;
        rotation?: number;
        scaleX?: number;
        scaleY?: number;
    },
    width?: any;
    height?: any
    options?: any;
    onClick?: () => void;
    children?: (element: JSX.Element) => JSX.Element;
}

// const _Icons: any = Icons;

export const BaseIconNode: React.FC<IconNodeProps> = (props) => {

    
    // const { getDeviceConf, getDeviceOptions } = useContext(HMICanvasContext)

    // let options: any = props.extras?.options || {};
    let conf: any = {};

    // const tag = `${props?.extras?.devicePlaceholder?.tag}`
    // if (getDeviceOptions && tag) {
    //     options = getDeviceOptions(tag);
    // }
    // if (getDeviceConf && tag) {
    //     conf = getDeviceConf(tag);
    // }

    // const options = getDeviceOptions(props.extras?.devicePlaceholder?.name)

    // const conf = getDeviceConf(props.extras?.devicePlaceholder?.name)


    const Icon = props?.extras?.icon || (() => <div>no component found</div>)

    const [rotation, setRotation] = useState<number>(0);

    useEffect(() => {
        setRotation(props?.extras?.rotation || 0)
    }, [props?.extras?.rotation])

    console.log({id: props.id, extras: props.extras, dataValue: props.extras?.dataValue});

    return (
        <Box
            style={{ 
                position: 'relative',
                // pointerEvents: 'none', // props.building ? 'none' : undefined,
                width: props.width || '72px',
                height: props.height || '72px',
                display :'flex',
                borderRadius: "3px"
            }}
            onClick={props.onClick ? props.onClick : undefined}
            className={props.className}>
            {props.children?.(
                <Icon
                    editing={props.building}
                    rotation={props.extras?.rotation}
                    device={props.extras?.devicePlaceholder}
                    scaleX={props.extras?.scaleX}
                    scaleY={props.extras?.scaleY}
                    conf={conf}
                    options={props.extras?.dataValue}
                    {...props.options}
                    size="medium" />
            )}
        </Box>
    )
}


export const UnstyledIconNode = (props: IconNodeProps) => {

    const [ hovering, setHovering ] = useState(false);

    const [ port, setPort ] = useState<any>();

    const { selected, selectNode } = useContext(InfiniteCanvasContext)

    return (
        <>
            {/* {props.extras?.showTotalizer && (
            <Box 
                background="light-1"
                align="center"
                justify="center"
                style={{borderRadius: '100%', width: 33, height: 33, position: 'absolute', top: -50, left: 0, right: 0}}>
                Total
            </Box>
        )} */}

            {/* <EditorHandles 
                id={props.id}
                x={props.x}
                y={props.y}
                active={selected?.map((x) => x.id).indexOf(props.id) > -1}> */}
            <BaseIconNode

               
                width={props.extras?.label ? '96px' : '55px'}
                height={props.extras?.label ? '42px' : '55px'}
                {...props}>
                {(icon) => (
                    <>
                        <Box
                            onClick={(evt) => {
                                evt.stopPropagation()
                                selectNode?.(props.id || '')
                            }}
                            onMouseLeave={(e) => {
                                setHovering(false);
                                setPort(null)
                            }}
                          
                            sx={{ 
                                // pointerEvents: 'all',
                                // background: 'red',
                                cursor: 'pointer',
                                flex: 1, 
                                display: 'flex', 
                                border: props.building ? ( (selected || []).map((x) => x.id)?.indexOf(props.id) > -1  ?  '1px solid black' : undefined ): undefined,
                                justifyContent: props.extras?.label ? 'space-between' : 'center',
                                alignItems: props.extras?.label ? 'center' : 'center',
                                flexDirection: props.extras?.label ? 'row' : 'column'
                            }}
                            // style={{ pointerEvents: props.building ? 'all' : undefined}}
                          
                            >
                            <div 
                                 style={{ pointerEvents: props.building ? 'all' : undefined}}>

                            {/* {port && (
                                <div style={{
                                    width: 5, 
                                    height: 5, 
                                    background: 'green', 
                                    left: port.x - props.x,
                                    top: port.y - props.y, 
                                    position: 'absolute'
                                }} />
                            )} */}
                            
                            {props.extras?.ports && props.extras?.ports.map((port) => (
                                <Box sx={{visibility: props.building ? undefined : 'hidden', position: 'absolute', width: '12px', height: '12px', left: port.x, top: port.y}}>
                                    <PortWidget
                                        id="in"
                                        {...port}
                                        hidden={!props.building}
                                        scaleX={props.extras?.scaleX}
                                        scaleY={props.extras?.scaleY}
                                        direction="center" />
                                </Box>
                            ))}
                            </div>

                            {icon}

                        </Box>
                    </>
                )}

            </BaseIconNode>
            {/* </EditorHandles> */}
            {props.extras?.devicePlaceholder?.tag && (
                <Box
                    style={{
                        transform: `
                                    scaleX(${1 / (props.extras?.scaleX || 1)})
                                    scaleY(${1 / (props.extras?.scaleY || 1)})
                                `,
                        textAlign: 'center',
                        position: 'absolute',
                        display: 'flex',
                        flex: 1,
                        flexDirection: 'row',
                        justifyContent: 'center'
                    }}>
                    <Text fontSize="small">{props.extras?.devicePlaceholder?.tag}</Text>
                </Box>
            )}

        </>
    )
}


export const HMINode = styled(UnstyledIconNode)`
    .port{
        border-radius: 7px;
        height: 12px;
        width: 12px;
    }

`