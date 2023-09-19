import { nanoid } from "nanoid";
import { Ref, useState } from "react"
import { useReactFlow, useViewport } from 'reactflow';
import { useEditorContext } from "../context";
import { OverlayProps } from ".";


export const BoxToolProps = {
    width: 'Number',
    height: 'Number'
}

const BaseBoxTool = (flowWrapper?: any, page?: any, border?: any) => {
    const [startPoint, setStartPoint] = useState<any>(null)

    const { project } = useReactFlow();

    const { onUpdatePage } = useEditorContext();

    const [ clickPoint, setClickPoint ] = useState<any>(null);


    const onClick = (e: MouseEvent) => {

        const wrapperBounds = flowWrapper?.current?.getBoundingClientRect()
        const symbolPosition = project({
            x: (e.clientX || 0) - (wrapperBounds?.x || 0),
            y: (e.clientY || 0) - (wrapperBounds?.y || 0)
        })


        if (!startPoint) {
            setClickPoint({x: e.clientX, y: e.clientY});

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


            onUpdatePage?.({
                ...page,
                nodes: n
            }, "onClick")

            setStartPoint(null)
        }


    }


    const Overlay = (props: OverlayProps) => {
        const { x, y, zoom } = useViewport();

        const wrapperBounds = flowWrapper?.current?.getBoundingClientRect()

        const pos = project({
            x: (props.cursorPosition?.x || 0) - wrapperBounds.x,
            y: (props.cursorPosition?.y || 0) - wrapperBounds.y
        })

        return startPoint && (
            <div style={{
                position: 'absolute',
                left: clickPoint?.x - wrapperBounds.x,
                top: clickPoint?.y - wrapperBounds.y,
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

export const BoxTool = (flowWrapper: any, page: any) => {
    return BaseBoxTool(flowWrapper, page, '1px solid black');
}


export const BoxOutlineTool = (flowWrapper: any, page: any) => {
    return BaseBoxTool(flowWrapper, page, '1px dashed black');
}