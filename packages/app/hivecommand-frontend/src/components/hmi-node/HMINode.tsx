import { Box, Layer, Text } from 'grommet';
import React, { useMemo, useState, useEffect, useContext, useRef } from 'react';
import styled from 'styled-components'
import { RetractingPort } from '@hexhive/ui';
import { getSVGStyle } from '../../hooks/svg';
import { HMIGroup } from './HMIGroup';
import { HMICanvasContext } from '../hmi-canvas/HMICanvasContext';
import * as Icons from '../../assets/hmi-elements';
import { HMIPort } from './HMIPort';

export interface IconNodeProps {
    building?: boolean;
    className?: string;
    extras?: {
        options?: any;

        label?: string;
        color?: string;

        icon?: any;

        iconString?: string;

        devicePlaceholder?: {
            name?: string;
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
    onClick?: () => void;
    children?: (element: JSX.Element) => JSX.Element;
}

const _Icons: any = Icons;

export const BaseIconNode: React.FC<IconNodeProps> = (props) => {

    console.log("base", {props});
    
    const { getDeviceConf, getDeviceOptions } = useContext(HMICanvasContext)

    let options: any = {};
    let conf: any = {};
    if (getDeviceOptions) {
        options = getDeviceOptions(props.extras?.devicePlaceholder?.name);
    }
    if (getDeviceConf) {
        conf = getDeviceConf(props.extras?.devicePlaceholder?.name);
    }
    // const options = getDeviceOptions(props.extras?.devicePlaceholder?.name)

    // const conf = getDeviceConf(props.extras?.devicePlaceholder?.name)


    const Icon = getSVGStyle(props.extras?.icon && typeof (props.extras?.icon) === 'string' ? (_Icons as any)[props.extras.icon] : (props.extras?.icon) ? props.extras?.icon : null, (props) => ({
        stroke: (options?.opening == 'true' || options?.starting == 'true') ? 'yellow' : (options?.open?.trim() == 'true' || options?.on?.trim() == 'true' || parseFloat(options?.speed) > 0) ? 'green' : 'gray'

    }))

    //Array.isArray(props.extras.icon) ?
    //: () => <HMIGroup icons={props.extras.icon} />
    const [rotation, setRotation] = useState<number>(0);

    useEffect(() => {
        setRotation(props?.extras?.rotation)
    }, [props?.extras?.rotation])

    console.log("NODE",{props})
    return (
        <Box
            style={{ position: 'relative', pointerEvents: props.building ? 'none' : undefined }}
            onClick={props.onClick}
            width={props.width || '72px'}
            height={props.height || '72px'}
            round="small"
            className={props.className}>
            {props.children?.(
                <Icon
                    rotation={props.extras.rotation}
                    device={props.extras?.devicePlaceholder}
                    scaleX={props.extras?.scaleX}
                    scaleY={props.extras?.scaleY}
                    conf={conf}
                    options={options}
                    size="medium" />
            )}
        </Box>
    )
}


export const UnstyledIconNode = (props: IconNodeProps) => {
    const [actionsOpen, openActions] = useState<boolean>(false);

    console.log("ICON NODE", {props})
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
            <BaseIconNode
                onClick={!props.building && (() => {
                    console.log("Open")
                    openActions(!actionsOpen)
                })}
                width={props.extras?.label ? '96px' : '55px'}
                height={props.extras?.label ? '42px' : '55px'}
                {...props}>
                {(icon) => (
                    <>
                        <Box
                            flex
                            // style={{ pointerEvents: props.building ? 'all' : undefined}}
                            justify={props.extras?.label ? 'between' : 'center'}
                            align={props.extras?.label ? 'center' : 'center'}
                            direction={props.extras?.label ? 'row' : 'column'}>

                            <div 
                                 style={{ pointerEvents: props.building ? 'all' : undefined}}>
                            {props.extras.ports && props.extras.ports.map((port) => (
                                <RetractingPort
                                    id="in"
                                    {...port}
                                    scaleX={props.extras.scaleX}
                                    scaleY={props.extras.scaleY}
                                    direction="center" />
                            ))}
                            </div>

                            {icon}

                        </Box>
                    </>
                )}

            </BaseIconNode>
            {props.extras?.devicePlaceholder?.name && (
                <Box
                    style={{
                        transform: `
                                    scaleX(${1 / (props.extras?.scaleX || 1)})
                                    scaleY(${1 / (props.extras?.scaleY || 1)})
                                `,
                        textAlign: 'center',
                        position: 'absolute'
                    }}
                    direction="row"
                    justify="center"
                    flex>
                    <Text size="small" color="black">{props.extras?.devicePlaceholder?.name}</Text>
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

    .port-base:first-child{
        top: -6px;
        left: 0;
        right: 0;
        display: flex;
        justify-content: center;
        margin: 0 auto;
        position: absolute;
    }

    .port-base:last-child{
        bottom: -6px;
        left: 0;
        right: 0;
        margin: 0 auto;
        display: flex;
        justify-content: center;
        position: absolute;
    }
`