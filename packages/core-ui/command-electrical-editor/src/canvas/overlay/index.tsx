import { Box } from '@mui/material';
import React, { useMemo, useState } from 'react';
import { useEditorContext } from '../../context';
import { CursorCrosshairs } from './cursor-crosshairs';
import { useReactFlow } from 'reactflow';
import { nanoid } from 'nanoid';

export interface CanvasOverlayProps {
    cursorPosition?: {x: number, y: number} | null;

    wrapper?: any;
    page?: any;
    onCursorMoved?: (pos: any) => void;

    tool?: any;
}

export const CanvasOverlay : React.FC<CanvasOverlayProps> = (props) => {
      
    const { project } = useReactFlow();

    const { selectedSymbol } = useEditorContext();

    const Overlay = props.tool ? props.tool?.Overlay : () => <div />;

    return (
        <Box 
            sx={{position: 'absolute', pointerEvents: 'none', left: 0, top: 0, width: '100%', height: '100%'}}>
            
            <Overlay cursorPosition={props.cursorPosition} />
{/*             
            <SymbolOverlay 
                wrapper={props.wrapper}
                cursorPosition={props.cursorPosition} 
                selectedSymbol={selectedSymbol} /> */}
            {/* <WireOverlay
                wrapper={props.wrapper}
                cursorPosition={props.cursorPosition} 
                selectedSymbol={selectedSymbol} />
                 */}

            <CursorCrosshairs 
                cursorPosition={props.cursorPosition}
                wrapper={props.wrapper} />
        </Box>
    )
}