import { nanoid } from "nanoid";
import { MouseEvent, Ref, useState } from "react"
import { useReactFlow, useViewport } from 'reactflow';
import { OverlayProps, ToolFactory, useViewportExtras } from "./shared";


export const BoxToolProps = {
    width: 'Number',
    height: 'Number'
}

const BaseBoxTool : ToolFactory = (flowWrapper, page, onUpdate, border?: any) => {
    const [startPoint, setStartPoint] = useState<any>(null)

    const { project } = useReactFlow();

    const [ clickPoint, setClickPoint ] = useState<any>(null);


    const onClick = (e: MouseEvent) => {

        const wrapperBounds = flowWrapper?.container?.current?.getBoundingClientRect()
        const symbolPosition = project({
            x: (e.clientX || 0),
            y: (e.clientY || 0)
        })


        if (!startPoint) {
            setClickPoint(project({x: e.clientX, y: e.clientY}));

            setStartPoint(symbolPosition);
        } else {

            console.log(startPoint, symbolPosition)

            let n = (page?.nodes || []).slice();
            n.push({
                id: nanoid(),
                position: {
                    x: startPoint.x,
                    y: startPoint.y
                },
                data: {
                    border: border,
                    width: Math.abs(startPoint.x - symbolPosition.x), //selectedSymbol.component?.metadata?.width, 
                    height: Math.abs(startPoint.y - symbolPosition.y) //selectedSymbol.component?.metadata?.height 
                },
                type: 'box'
            })


            onUpdate?.({
                ...page,
                nodes: n
            })

            setStartPoint(null)
        }


    }


    const Overlay = (props: OverlayProps) => {
        const { x, y, zoom } = useViewport();

        const { unproject } = useViewportExtras();

        const wrapperBounds = flowWrapper?.container?.current?.getBoundingClientRect()

        const pos = project({
            x: (props.cursorPosition?.x || 0),
            y: (props.cursorPosition?.y || 0)
        })

        const xy  : any=  clickPoint ? unproject(clickPoint) : {}

        return startPoint && (
            <div style={{
                position: 'absolute',
                left: xy?.x,
                top: xy?.y,
                width: (pos.x - startPoint?.x) * zoom, //props.data.width || 50,
                height: (pos.y - startPoint?.y) * zoom, //props.data.height || 50,
                border: border
            }}>

            </div>
        )

    }



    return {
        onClick,
        Overlay
    }
}

export const BoxTool : ToolFactory = (flowWrapper, page, onUpdate) => {
    return BaseBoxTool(flowWrapper, page, onUpdate, '1px solid black');
}


export const BoxOutlineTool : ToolFactory = (flowWrapper, page, onUpdate) => {
    return BaseBoxTool(flowWrapper, page, onUpdate, '1px dashed black');
}