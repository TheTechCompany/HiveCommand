import { nanoid } from "nanoid";
import { Ref, useState, MouseEvent, KeyboardEvent, forwardRef, useImperativeHandle } from "react"
import { useReactFlow, useViewport } from 'reactflow';
import { OverlayProps, ToolFactory, ToolFactoryProps, ToolInstance, ToolOverlay } from "./shared";
import { Box, Typography } from "@mui/material";

export const TextToolProps = {
    text: 'String',
    rotation: 'Number',
    fontSize: 'Number'
}

//ToolFactory
const BaseTextTool : ToolFactory<{}> = forwardRef<ToolInstance, ToolFactoryProps>((props: any, ref) => {

    const {flowWrapper, page, onUpdate} = props;

    const [rotation, setRotation] = useState(0);

    const { project } = useReactFlow();

    const { zoom } = useViewport();

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

    }


    const onKeyDown = (e: KeyboardEvent, origin?: string) => {
        if (e.key == "Tab") {
            setRotation((r) => (r + 90) % 360)
        }
    }


    const Overlay = (props: OverlayProps) => {
        const { zoom } = useViewport();

        return props.cursorPosition?.x && props.cursorPosition?.y && (
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

    useImperativeHandle(ref, () => ({
        onClick,
        onKeyDown,
        Overlay
    }))


    console.log({props})

    return (props.cursorPosition?.x && props.cursorPosition?.y) ? (
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
    ) : null;
})

export const TextTool : ToolFactory<{}>  = forwardRef<ToolInstance, ToolFactoryProps>((props, ref) => {
    return <BaseTextTool {...props} ref={ref} />;
})
