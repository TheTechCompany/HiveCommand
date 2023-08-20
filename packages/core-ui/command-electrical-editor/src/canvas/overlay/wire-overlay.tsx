import { Box } from '@mui/material';
import React from 'react';
import { useEditorContext } from '../../context';

export interface WireOverlayProps {
    wrapper?: any;
    cursorPosition?: {x: number, y: number} | null;
    selectedSymbol?: any;
}

export const WireOverlay : React.FC<WireOverlayProps> = (props) => {
    const wrapperBounds = props.wrapper?.current?.getBoundingClientRect();

    const { draftWire } = useEditorContext()

    console.log({draftWire});

    return draftWire ? (
        <path stroke="black" d={`M ${draftWire.data?.points?.map((x: any, ix: any) => `${x.x} ${x.y} ${ix < draftWire.data?.points?.length -1 ? 'L' : 'Z'}`).join(' ')}`} />
    ) : null;
}