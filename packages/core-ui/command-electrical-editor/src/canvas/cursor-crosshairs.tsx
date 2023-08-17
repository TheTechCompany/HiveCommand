import React from 'react';
import { useEditorContext } from '../context';

export const CursorCrosshairs = (props: {wrapperBounds?: any}) => {

    const { cursorPosition } = useEditorContext();
    
    return cursorPosition ? (<div style={{position: 'absolute', pointerEvents: 'none', left: 0, top: 0, width: '100%', height: '100%'}} className="cursor-crosshairs">
                    <div style={{top : (cursorPosition?.y || 0) - (props.wrapperBounds?.y || 0), position: 'absolute', left: 0, width: '100%', height: '1px', background: 'black'}} className="crosshair-horizontal" />
                    <div style={{ left: (cursorPosition?.x || 0) - (props.wrapperBounds?.x || 0), position: 'absolute', top: 0, height: '100%', width: '1px', background: 'black'}} className="crosshair-vertical" />
                </div>) : null
}