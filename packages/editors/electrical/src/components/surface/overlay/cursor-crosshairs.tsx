import React from 'react';

export const CursorCrosshairs = (props: {wrapper?: any, cursorPosition?: any}) => {

    const wrapperBounds = {x: 0, y: 0} //props.wrapper?.current?.getBoundingClientRect();
    
    return props.cursorPosition ? (<div style={{position: 'absolute', pointerEvents: 'none', left: 0, top: 0, width: '100%', height: '100%'}} className="cursor-crosshairs">
                    <div style={{top : (props.cursorPosition?.y || 0) - (wrapperBounds?.y || 0), position: 'absolute', left: 0, width: '100%', height: '1px', background: 'black'}} className="crosshair-horizontal" />
                    <div style={{ left: (props.cursorPosition?.x || 0) - (wrapperBounds?.x || 0), position: 'absolute', top: 0, height: '100%', width: '1px', background: 'black'}} className="crosshair-vertical" />
                </div>) : null
}