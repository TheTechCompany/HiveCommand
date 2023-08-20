import React, { MouseEventHandler, useState } from 'react';
import { BaseEdge, EdgeProps, getBezierPath, useReactFlow } from 'reactflow';
import { useEditorContext } from '../context';


export const WireEdge = ({
    id,
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    markerEnd,
    style = {},
    data
}: EdgeProps) => {

    const { project } = useReactFlow()

    const { onUpdatePage, page } = useEditorContext();

    const directPath = `M ${data?.points?.map((x: any, ix: any) => `${x.x} ${x.y} ${ix < data?.points?.length - 1 ? 'L' : ''}`).join(' ')}`;

    const [draggingPoint, setDraggingPoint] = useState<number | null>(null)
    const [deltaPoint, setDeltaPoint] = useState<{ x: number, y: number } | null>(null);


    return (
        <>
            <BaseEdge path={directPath} markerEnd={markerEnd} style={style} />
            {data?.points?.map((point: any, ix: number) => (
                <circle
                    onMouseDown={(e) => {

                        console.log(ix, point);
                        (e.currentTarget as any).setPointerCapture((e as any).pointerId)

                        setDraggingPoint(ix);
                        setDeltaPoint(project({ x: e.clientX, y: e.clientY }))
                    }}
                    onMouseMove={(e) => {

                        let nextPoint = project({ x: e.clientX, y: e.clientY });

                        if (deltaPoint && draggingPoint != null) {
                            let delta = { x: nextPoint.x - deltaPoint.x, y: nextPoint.y - deltaPoint.y };
                            console.log({ delta });

                            let e = (page?.edges || []).slice();

                            let edgeIx = (page?.edges || []).findIndex((a) => a.id == id)

                            const points = (e[edgeIx].data.points || []).slice();

                            points[ix] = {
                                ...points[ix],
                                x: e[edgeIx].data.points[draggingPoint].x + delta.x,
                                y: e[edgeIx].data.points[draggingPoint].y + delta.y
                            }

                            e[edgeIx] = {
                                ...e[edgeIx],
                                data: {
                                    ...e[edgeIx].data,
                                    points
                                }
                            }
                            // e[edgeIx].data.points[ix].x = e[edgeIx].data.points[ix].x + delta.x;
                            // e[edgeIx].data.points[ix].y = e[edgeIx].data.points[ix].y + delta.y;

                            console.log({ e });
                            onUpdatePage?.({
                                ...page,
                                edges: e
                            }, "mouseMove")
                        }

                        if (draggingPoint != null) {
                            setDeltaPoint(nextPoint)
                        }
                    }}
                    onMouseUp={(e) => {
                        (e.currentTarget as any).releasePointerCapture((e as any).pointerId)

                        setDraggingPoint(null)
                        setDeltaPoint(null);
                    }}
                    style={{ cursor: 'pointer', pointerEvents: 'all' }}
                    r={2}
                    cx={point.x}
                    cy={point.y}
                    fill='black' />
            ))}
        </>
        // <path d='M 10 10 L 10 10 Z' stroke="black" /> 
    )
}