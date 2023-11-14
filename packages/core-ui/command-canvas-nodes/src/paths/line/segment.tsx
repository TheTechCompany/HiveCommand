import React, {MouseEvent} from 'react'

export interface LineSegmentProps {
    d : string;
    selected?: boolean;
    onMouseDown?: (e: MouseEvent) => void;
}
export const LineSegment : React.FC<LineSegmentProps> = (props: any) => {

    const style : any = {};

    const { d } = props;

    return (
          <g 
          onMouseDown={props.onMouseDown}    

            // onContextMenu={props.onContextMenu}
            // className={props.className}
            //  onMouseDown={props.onMouseDown}
             >
            
            <path d={d} style={{ 
                fill: 'none',
                strokeLinejoin: 'round',
                strokeWidth: '6px',
                strokeOpacity: '0.8',
                stroke: props.selected ? 'cyan' : (style?.pathBorderColor || 'rgb(98, 98, 98)')
            }} className={"flow-path__pipe-border"}  />

            <path 
            
            d={d} 
            style={{
                fill: 'none',
                strokeLinejoin: 'round',
                strokeWidth: '4px',
                strokeOpacity: '0.8',
                stroke: style.pathColor || "rgb(147, 147, 147)",
            }} className={"flow-path__pipe"}  />

            <path
            d={d} 
            style={{
                stroke: style?.pathColor || 'rgb(147,147,147)',

             }} className={"flow-path"}  />

            <path d={d} className={"flow-path__highlight"} /> 
          
        </g>
    )
}