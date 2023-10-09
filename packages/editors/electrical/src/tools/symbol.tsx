import { nanoid } from "nanoid";
import { Ref, useState, KeyboardEvent, MouseEvent } from "react"
import { useReactFlow, useViewport } from 'reactflow';
import { Box } from "@mui/material";
import { OverlayProps, ToolFactory } from "./shared";

export const SymbolToolProps = {
    symbol: 'String',
    rotation: 'Number',
    width: 'Number',
    height: 'Number'
}

export const SymbolTool : ToolFactory = (flowWrapper, page, onUpdate) => {

    const [rotation, setRotation] = useState(0);

    const { project } = useReactFlow();

    const { symbol } = flowWrapper?.state?.activeTool?.data || {symbol: null};

    const onClick = (e: MouseEvent) => {

        if (!symbol) return;

        const wrapperBounds = flowWrapper?.container?.current?.getBoundingClientRect()
        const symbolPosition = project({
            x: (e.clientX || 0) - (wrapperBounds?.x || 0),
            y: (e.clientY || 0) - (wrapperBounds?.y || 0)
        })


        let n = (page?.nodes || []).slice();
        n.push({
            id: nanoid(),
            position: {
                x: symbolPosition.x,
                y: symbolPosition.y,

            },
            data: {
                symbol: symbol?.name,
                rotation: rotation,
                width: symbol?.component?.metadata?.width,
                height: symbol?.component?.metadata?.height
            },
            type: 'electricalSymbol'
        })


        onUpdate?.({
            ...page,
            nodes: n
        })

    }

    const onKeyDown = (e: KeyboardEvent) => {
        if (e.key == "Tab") {
            e.preventDefault();
            e.stopPropagation();
            setRotation((rotation) => (rotation + 90) % 360)
        }
    }

    const Overlay = (props: OverlayProps) => {
        const wrapperBounds = flowWrapper?.container?.current?.getBoundingClientRect()
        const { zoom } = useViewport();

        return (
            <Box sx={{
                position: 'absolute',
                transform: `rotate(${rotation}deg)`,
                left: (props.cursorPosition?.x || 0),
                top: (props.cursorPosition?.y || 0),
                width: symbol?.component?.metadata?.width * zoom,
                height: symbol?.component?.metadata?.height * zoom,
            }}>
                {symbol?.component()}
            </Box>
        )
    }



    return {
        onClick,
        onKeyDown,
        Overlay
    }

}