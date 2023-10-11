import { nanoid } from "nanoid";
import { Ref, useState, MouseEvent, KeyboardEvent } from "react"
import { useReactFlow, useViewport } from 'reactflow';
import { OverlayProps, ToolFactory } from "./shared";
import { Box, Typography } from "@mui/material";

export const TextToolProps = {
    text: 'String',
    rotation: 'Number',
    fontSize: 'Number'
}

const BaseTextTool : ToolFactory = (flowWrapper, page, onUpdate) => {
    // const [ startPoin, setStartPoint ] = useState<any>(null)


    const [rotation, setRotation] = useState(0);

    const { project } = useReactFlow();



    //    const [ text, setText ] = useState<any>(null);

    const onClick = (e: MouseEvent) => {

        const wrapperBounds = flowWrapper?.container?.current?.getBoundingClientRect()
        const symbolPosition = project({
            x: e.clientX,
            y: e.clientY
        })

        let n = (page?.nodes || []).slice();
        n.push({
            id: nanoid(),
            position: {
                x: symbolPosition.x,
                y: symbolPosition.y
            },
            data: {
                text: 'Text',
                rotation
            },
            type: 'text'
        })

        onUpdate?.({
            ...page,
            nodes: n
        })

        //    setStartPoint(null);
        // }


    }


    const onKeyDown = (e: KeyboardEvent) => {
        if (e.key == "Tab") {
            e.preventDefault();
            e.stopPropagation();
            setRotation((r) => (r + 90) % 360)
        }
    }


    const Overlay = (props: OverlayProps) => {
        const wrapperBounds = flowWrapper?.container?.current?.getBoundingClientRect()
        const { zoom } = useViewport();

        return props.cursorPosition && (
            <Box sx={{
                pointerEvents: 'none',
                position: 'absolute',
                transformOrigin: 'left top',
                transform: `rotate(${rotation}deg) scale(${zoom})`,
                left: (props.cursorPosition?.x || 0) ,
                top: (props.cursorPosition?.y || 0)
            }}>
                <Typography sx={{fontSize: '12px'}}>Text</Typography>
            </Box>
        )
    }



    return {
        onClick,
        onKeyDown,
        Overlay
    }
}

export const TextTool : ToolFactory = (flowWrapper, page, onUpdate) => {
    return BaseTextTool(flowWrapper, page, onUpdate);
}
