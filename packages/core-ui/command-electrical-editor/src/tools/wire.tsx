import { nanoid } from "nanoid";
import { Ref, useCallback, useState } from "react"
import { useReactFlow } from 'reactflow';
import { useEditorContext } from "../context";

export const WireTool = (flowWrapper: any, page: any) => {

    // const [ startPoin, setStartPoint ] = useState<any>(null)

    const { project } = useReactFlow();

    const { onUpdatePage, setDraftWire } = useEditorContext();

    const [ isWiring, setIsWiring ] = useState(false);

    const [ points, setPoints ] = useState<any[]>([]);

    const onClick = (e: MouseEvent) => {

        e.stopPropagation();

        console.log("OnMouseDown");

        const wrapperBounds = flowWrapper?.current?.getBoundingClientRect()

        if(!isWiring){
            setIsWiring(true);


            let startPoint = project({
                x: (e.clientX || 0) - (wrapperBounds?.x || 0),
                y: (e.clientY || 0) - (wrapperBounds?.y || 0)
            });

            // (e.currentTarget as HTMLElement).setPointerCapture((e as PointerEvent).pointerId)

            setPoints([startPoint])

            setDraftWire({
                    points: [startPoint]
            })
        }else{

            let nextPoint = project({
                x: (e.clientX || 0) - (wrapperBounds?.x || 0),
                y: (e.clientY || 0) - (wrapperBounds?.y || 0)
            });

            setPoints([...points, nextPoint]);

            setDraftWire({
                    points: [...points, nextPoint]
            })
        }

        console.log({points})


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
        if(e.key == 'Enter'){
            onUpdatePage?.({
                ...page,
                edges: [...(page?.edges || []), {id: nanoid(), type: 'wire', source: 'canvas', target: 'canvas', data: { points: points.slice() } } ]
            }, "onKeyDown")
            setPoints([])
            setDraftWire(null)
        }
    }, [page, points])
    

    return {
        onClick,
        onKeyDown
    }
}