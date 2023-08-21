import React, { MouseEventHandler, useState } from 'react';
import { BaseEdge, EdgeProps, getBezierPath, useReactFlow } from 'reactflow';
import { useElectricalNodeContext } from '../context';


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

    const { onEdgePointCreated, onEdgePointChanged } = useElectricalNodeContext();

    // const { onUpdatePage, page } = useEditorContext();

    const directPath = `M ${data?.points?.map((x: any, ix: any) => `${x.x} ${x.y} ${ix < data?.points?.length - 1 ? 'L' : ''}`).join(' ')}`;

    const [draggingPoint, setDraggingPoint] = useState<number | null>(null)
    const [deltaPoint, setDeltaPoint] = useState<{ x: number, y: number } | null>(null);


    /*
        let newEdges = (page?.edges || []).slice();

        let edgeIx = newEdges.findIndex((a: any) => a.id == id);

        let points = [...(data?.points || [])];

        const bounds = wrapper?.current?.getBoundingClientRect();

        points?.splice(ix + 1, 0, project({x: e.clientX - bounds.x, y: e.clientY - bounds.y}) )

                        newEdges[edgeIx] = {
                            ...newEdges?.[edgeIx],
                            data: {
                                ...newEdges?.[edgeIx]?.data,
                                points
                            }
                        }

                        onUpdatePage?.({
                            ...page,
                            edges: newEdges
                        }, "newPoint")

    */
    return (
        <>
            {/* <BaseEdge path={directPath} style={style} /> */}
            {data?.points?.map((point: any, ix: number) => data?.points?.[ix + 1] && (
                <path
                    onClick={(e) => {
                        if (e.metaKey || e.ctrlKey) {

                            onEdgePointCreated?.(id, { x: e.clientX, y: e.clientY })
                        }
                    }}
                    className="react-flow__edge-path"
                    style={{
                        ...style
                    }}
                    d={`M ${point.x} ${point.y} L ${data?.points?.[ix + 1].x} ${data?.points?.[ix + 1].y}`} />

            ))}
            {/* <path 
                    className="react-flow__edge-path"
                    d={directPath} 
                    onClick={(e) => {
                        if(e.metaKey || e.ctrlKey){
                            alert("CTRL")
                        }
                    }}
                    // markerEnd={markerEnd} 
                    
                    style={{
                        // fill: 'none',
                        // stroke: style.stroke || 'black',
                        ...style
                    }} /> */}
            {data?.points?.map((point: any, ix: number) => (
                <circle
                    onMouseDown={(e) => {

                        (e.currentTarget as any).setPointerCapture((e as any).pointerId)

                        setDraggingPoint(ix);
                        setDeltaPoint(project({ x: e.clientX, y: e.clientY }))
                    }}
                    onMouseMove={(e) => {

                        let nextPoint = project({ x: e.clientX, y: e.clientY });

                        if (deltaPoint && draggingPoint != null) {
                            let delta = { x: nextPoint.x - deltaPoint.x, y: nextPoint.y - deltaPoint.y };

                            // let e = (page?.edges || []).slice();

                            // let edgeIx = (page?.edges || []).findIndex((a: any) => a.id == id)

                            // const points = (e[edgeIx].data.points || []).slice();

                            // points[ix] = {
                            //     ...points[ix],
                            //     x: e[edgeIx].data.points[draggingPoint].x + delta.x,
                            //     y: e[edgeIx].data.points[draggingPoint].y + delta.y
                            // }

                            // e[edgeIx] = {
                            //     ...e[edgeIx],
                            //     data: {
                            //         ...e[edgeIx].data,
                            //         points
                            //     }
                            // }

                            // onUpdatePage?.({
                            //     ...page,
                            //     edges: e
                            // }, "mouseMove")

                            onEdgePointChanged?.(id, ix, {
                                x: delta.x,
                                y: delta.y
                            })
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
