import { nanoid } from "nanoid";
import { Ref, useCallback, useMemo, useState } from "react"
import { useReactFlow } from 'reactflow';
import { useEditorContext } from "../context";
import { OverlayProps } from ".";

export const WireTool = (flowWrapper: any, page: any) => {

    // const [ startPoin, setStartPoint ] = useState<any>(null)

    const { project } = useReactFlow();

    const { onUpdatePage } = useEditorContext();

    const [isWiring, setIsWiring] = useState(false);

    const [points, setPoints] = useState<any[]>([]);

    const onClick = (e: MouseEvent) => {

        e.stopPropagation();

        console.log("OnMouseDown");

        const wrapperBounds = flowWrapper?.current?.getBoundingClientRect()

        if (!isWiring) {
            setIsWiring(true);


            let startPoint = project({
                x: (e.clientX || 0) - (wrapperBounds?.x || 0),
                y: (e.clientY || 0) - (wrapperBounds?.y || 0)
            });

            // (e.currentTarget as HTMLElement).setPointerCapture((e as PointerEvent).pointerId)

            setPoints([startPoint])

      
        } else {

            let nextPoint = project({
                x: (e.clientX || 0) - (wrapperBounds?.x || 0),
                y: (e.clientY || 0) - (wrapperBounds?.y || 0)
            });

            setPoints([...points, nextPoint]);

          
        }



        // const mouseMove = () => {

        // }

        // const mouseUp = () => {
        //     (e.currentTarget as HTMLElement).removeEventListener('mousemove', mouseMove);
        //     (e.currentTarget as HTMLElement).removeEventListener('mouseup', mouseUp);
        // }

        // (e.currentTarget as HTMLElement).addEventListener('mousemove', mouseMove);
        // (e.currentTarget as HTMLElement).addEventListener('mouseup', mouseUp);



        // setPoints((points) => {
        //     let p = points.slice();

        //     if(!p[0]) p.push({});
        //     p[0].x = e.clientX;
        //     p[0].y = e.clientY;

        //     return p;
        // })

        // const symbolPosition =  project({
        //     x: (e.clientX || 0) - (wrapperBounds?.x || 0),
        //     y: (e.clientY || 0) - (wrapperBounds?.y || 0)
        // })



        // onUpdatePage?.({
        //     ...page,
        //     nodes: n
        // })


    }

    const onKeyDown = useCallback((e: KeyboardEvent) => {
        console.log("onKeyDown", points)
        if (e.key == 'Enter') {
            onUpdatePage?.({
                ...page,
                edges: [...(page?.edges || []), { id: nanoid(), type: 'wire', source: 'canvas', target: 'canvas', data: { points: points.slice() } }]
            }, "onKeyDown")
            setPoints([])
        }
    }, [page, points])

    const Overlay = (props: OverlayProps) => {
        const wrapperBounds = flowWrapper?.current?.getBoundingClientRect();
        
        const realPoints = useMemo(() => [...points].concat(props.cursorPosition ? [{x: props.cursorPosition?.x - wrapperBounds?.x, y: props.cursorPosition?.y - wrapperBounds?.y}] : []), [points, props.cursorPosition])

        return realPoints?.length > 0 ? (
            <svg style={{width: '100%', height: '100%', pointerEvents: 'none'}}>
                <path style={{fill: 'none'}} stroke="black" d={`M ${realPoints?.map((x: any, ix: any) => `${x.x} ${x.y} ${ix < (realPoints?.length - 1) ? 'L' : ''}`).join(' ')}`} />
            </svg>
        ) : null;
    }


    return {
        onClick,
        onKeyDown,
        Overlay
    }
}