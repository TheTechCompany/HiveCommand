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

    const Icon = props?.extras?.icon || (() => <div>no component found</div>)

    const [rotation, setRotation] = useState<number>(0);

    useEffect(() => {
        setRotation(props?.extras?.rotation || 0)
    }, [props?.extras?.rotation])

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
              
                    options={props.extras?.dataValue}
                    width={props?.width}
                    height={props?.height}
                    // {...props.options}
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
        
            <BaseIconNode
                key={`base-node:${props.id}`}
               
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
                                // justifyContent: props.extras?.label ? 'space-between' : 'center',
                                // alignItems: props.extras?.label ? 'center' : 'center',
                                flexDirection: props.extras?.label ? 'row' : 'column'
                            }}
                            // style={{ pointerEvents: props.building ? 'all' : undefined}}
                          
                            >
                            <div 
                                 style={{ pointerEvents: props.building ? 'all' : undefined}}>

                            
                            {props.extras?.ports && props.extras?.ports.map((port) => (
                                <Box
                                    key={`base-node:${props.id}:port:${port.id}`}
                                    sx={{visibility: props.building ? undefined : 'hidden', position: 'absolute', width: '12px', height: '12px', left: port.x, top: port.y}}>
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