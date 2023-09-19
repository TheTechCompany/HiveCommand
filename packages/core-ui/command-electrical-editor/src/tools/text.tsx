import { nanoid } from "nanoid";
import { Ref, useState } from "react"
import { useReactFlow, useViewport } from 'reactflow';
import { useEditorContext } from "../context";
import { OverlayProps } from ".";
import { Box, Typography } from "@mui/material";

export const TextToolProps = {
    text: 'String',
    rotation: 'Number',
    fontSize: 'Number'
}

const BaseTextTool = (flowWrapper?: any, page?: any) => {
    // const [ startPoin, setStartPoint ] = useState<any>(null)


    const [rotation, setRotation] = useState(0);

    const { project } = useReactFlow();

    const { onUpdatePage } = useEditorContext();


    //    const [ text, setText ] = useState<any>(null);

    const onClick = (e: MouseEvent) => {

        const wrapperBounds = flowWrapper?.current?.getBoundingClientRect()
        const symbolPosition = project({
            x: (e.clientX || 0) - (wrapperBounds?.x || 0),
            y: (e.clientY || 0) - (wrapperBounds?.y || 0)
        })



        // if(!startPoint){
        //    setStartPoint(symbolPosition);

        // }else{

        //     console.log(startPoint, symbolPosition)

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


        onUpdatePage?.({
            ...page,
            nodes: n
        }, "onClick")

        //    setStartPoint(null);
        // }


    }


    const onKeyDown = (e: KeyboardEvent) => {
        if (e.key == "Tab") {
            e.preventDefault();
            e.stopPropagation();
            console.log("ROT", rotation)
            setRotation((r) => (r + 90) % 360)
        }
    }


    const Overlay = (props: OverlayProps) => {
        const wrapperBounds = flowWrapper?.current?.getBoundingClientRect()
        const { zoom } = useViewport();

        return (
            <Box sx={{
                position: 'absolute',
                transform: `rotate(${rotation}deg) scale(${zoom})`,
                left: (props.cursorPosition?.x || 0) - (wrapperBounds?.x || 0),
                top: (props.cursorPosition?.y || 0) - (wrapperBounds?.y || 0)
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

export const TextTool = (flowWrapper: any, page: any) => {
    return BaseTextTool(flowWrapper, page);
}
