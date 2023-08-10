import React from "react";
import { useMemo } from "react";
import { EdgeProps } from "reactflow";
import styled from "styled-components";

export const createLine = (path: {x: number, y: number}[]) => {
    let string = ''

    path.forEach((p, ix) => {
        let k = ix == 0 ? 'M' : 'L'
        string += `${k}${p.x} ${p.y} `
    })
    return string;
}

export const BaseFlowPathSegment = (props: any) => {

    const d = useMemo(() => {
        if(props.d) return props.d;
        if(props.points) return createLine(props.points)
    }, [props.d, props.points])

    const style = {
        pathBorderColor: 'white',
        pathColor: props.selected ? 'green' : 'black',
    }
    
    return (
        <g 
        onContextMenu={props.onContextMenu}
        className={props.className}
         onMouseDown={props.onMouseDown}>
        
        <path d={d} style={{ stroke: style?.pathBorderColor }} className={"flow-path__pipe-border"}  />
        <path d={d} style={{stroke: style?.pathColor }} className={"flow-path__pipe"}  />
        <path d={d} style={{stroke: style?.pathColor }} className={"flow-path"} {...{"marker-end": "url(#head)"}} />

        <path d={d} className={"flow-path__highlight"} /> 
      
    </g>
    )
}

export const LinePath = (props: EdgeProps) => {
    const { sourceX, sourceY, targetX, targetY } = props;

    return (
        <FlowPathSegment 
            selected={props.selected}
            points={[{x: sourceX, y: sourceY}, ...(props.data?.points || []), {x: targetX, y: targetY}]} />
    )   
}


export const FlowPathSegment = styled(BaseFlowPathSegment)`

    cursor: pointer;

    .flow-path{
        stroke: blue;
        stroke-opacity: 0;
        stroke-linecap: round;
        stroke-linejoin: round;
        fill: none;
        stroke-width: 2px;
    }

    .flow-path__pipe, .flow-path__pipe-border{
        fill: none;
        stroke-linejoin: round;
        stroke-width: 4px;
        stroke-opacity: 0.8;
        stroke: #dfdfdf;
    }

    .flow-path__pipe-border{
        stroke-width: 6px;
        stroke: black;
    }

    .flow-path__highlight {
        fill: none;
        stroke-linejoin: round;
        stroke-width: 8px;
        stroke-opacity: 0;
        stroke: cyan;
    }

    @keyframes marching {
        to{
            stroke-dashoffset: 0;
        }
    }

    
    &.active .flow-path__highlight {
        stroke-opacity: 0;
    }

    &.active .flow-path{
        stroke: #F99C1C;
        stroke-opacity: 1;
        stroke-dasharray: 4px;
        stroke-dashoffset: 8px;
        animation: marching 1s linear infinite;
    }
`
