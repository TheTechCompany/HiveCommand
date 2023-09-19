import { nanoid } from "nanoid";
import { Ref, useState } from "react"
import { useReactFlow, useViewport } from 'reactflow';
import { useEditorContext } from "../context";
import { Box } from "@mui/material";
import { OverlayProps } from ".";

export const SymbolToolProps = {
    symbol: 'String',
    rotation: 'Number',
    width: 'Number',
    height: 'Number'
}

export const SymbolTool = (flowWrapper: any, page: any) => {

    const [rotation, setRotation] = useState(0);

    const { project } = useReactFlow();

    const { selectedSymbol, onUpdatePage } = useEditorContext();



    const onClick = (e: MouseEvent) => {

        if (!selectedSymbol) return;

        const wrapperBounds = flowWrapper?.current?.getBoundingClientRect()
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
                symbol: selectedSymbol.name,
                rotation: rotation,
                width: selectedSymbol.component?.metadata?.width,
                height: selectedSymbol.component?.metadata?.height
            },
            type: 'electricalSymbol'
        })

        console.log("Add", n)

        onUpdatePage?.({
            ...page,
            nodes: n
        }, "onClick")

    }

    const onKeyDown = (e: KeyboardEvent) => {
        if (e.key == "Tab") {
            e.preventDefault();
            e.stopPropagation();
            setRotation((rotation) => (rotation + 90) % 360)
        }
    }

    const Overlay = (props: OverlayProps) => {
        const wrapperBounds = flowWrapper?.current?.getBoundingClientRect()
        const { zoom } = useViewport();

        return (
            <Box sx={{
                position: 'absolute',
                transform: `rotate(${rotation}deg)`,
                left: (props.cursorPosition?.x || 0) - (wrapperBounds?.x || 0),
                top: (props.cursorPosition?.y || 0) - (wrapperBounds?.y || 0),
                width: selectedSymbol?.component?.metadata?.width * zoom,
                height: selectedSymbol?.component?.metadata?.height * zoom,
            }}>
                {selectedSymbol?.component()}
            </Box>
        )
    }



    return {
        onClick,
        onKeyDown,
        Overlay
    }

}