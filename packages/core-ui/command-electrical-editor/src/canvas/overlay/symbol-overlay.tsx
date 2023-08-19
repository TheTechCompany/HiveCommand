import { Box } from '@mui/material';
import React from 'react';
import { useEditorContext } from '../../context';

export interface SymbolOverlayProps {
    wrapper?: any;
    cursorPosition?: {x: number, y: number} | null;
    selectedSymbol?: any;
}

export const SymbolOverlay : React.FC<SymbolOverlayProps> = (props) => {
    const wrapperBounds = props.wrapper?.current?.getBoundingClientRect();

    const { symbolRotation } = useEditorContext()

    return props.cursorPosition && props.selectedSymbol ? (
        <Box sx={{
            position: 'absolute',
            transform: `rotate(${symbolRotation}deg)`,
            left: (props.cursorPosition?.x || 0) - (wrapperBounds?.x || 0),
            top: (props.cursorPosition?.y || 0) - (wrapperBounds?.y || 0),
            width: props.selectedSymbol?.component?.metadata?.width,
            height: props.selectedSymbol?.component?.metadata?.height,
        }}>
            {props.selectedSymbol?.component()}
        </Box>
    ) : null;
}