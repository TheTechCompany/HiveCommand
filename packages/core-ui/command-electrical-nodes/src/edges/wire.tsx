import React, { MouseEventHandler, useState, useMemo, useEffect } from 'react';
import { BaseEdge, EdgeProps, getBezierPath, useReactFlow,useStore, useStoreApi } from 'reactflow';
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

    const store = useStoreApi()

    const onEdgesChange : any = useStore((s) => s.onEdgesChange)

    const updateEdge = (id: string, ix: number, pos: any) => {
        let edges = store.getState()?.edges || [];
        let main = edges?.findIndex((a) => a.id == id);

        let points = edges[main].data.points?.slice();

        points[ix] = pos;

        edges[main] = {
            ...edges[main],
            data: {
                ...edges[main].data,
                points
            }
        }

        onEdgesChange([{id: id, type: 'points-changed', item: {ix, pos} }])
    }

    const createEdge = (id: string, ix: number, pos: any) => {
        let edges = store.getState()?.edges || [];

        let edgeIx = edges.findIndex((a) => a.id == id);

        let points = [...(edges[edgeIx]?.data?.points || [])];

        points?.splice(ix + 1, 0, {x: pos.x, y: pos.y} )

        edges[edgeIx] = {
            ...edges?.[edgeIx],
            data: {
                ...edges?.[edgeIx]?.data,
                points
            }
        }


        onEdgesChange([{id: id, type: 'points-create', item: {ix, pos} }])
     
    }

    const { project } = useReactFlow()

    const [ points, setPoints ] = useState<any[]>(data?.points || []);
    
    const { onEdgePointCreated, onEdgePointChanged, printMode } = useElectricalNodeContext();

    const directPath = useMemo(() => `M ${points?.map((x: any, ix: any) => `${x.x} ${x.y} ${ix < points?.length - 1 ? 'L' : ''}`).join(' ')}`, [points]);

    const [draggingPoint, setDraggingPoint] = useState<number | null>(null)

    const [startPoint, setStartPoint] = useState<{ x: number, y: number } | null>(null);

    const [deltaPoint, setDeltaPoint] = useState<{ x: number, y: number } | null>(null);

    useEffect(() => {
        setPoints(data?.points);
    }, [data?.points])
  
    return (
        <>
            {/* <BaseEdge path={directPath} style={style} /> */}
            {points?.map((point: any, ix: number) => points?.[ix + 1] && (
                <path   
                    key={`edge-${id}-point${ix}`}
                    onClick={(e) => {
                        if (e.metaKey || e.ctrlKey) {
                            createEdge(id, ix, {x: e.clientX, y: e.clientY});

                            // onEdgePointCreated?.(id, ix, { x: e.clientX, y: e.clientY })
                        }
                    }}
                    onPointerDown={(e) => {
                        setDeltaPoint(project({x: e.clientX, y: e.clientY}))
                    }}
                    onPointerMove={(e) => {
                        let nextPoint = project({x: e.clientX, y: e.clientY})
                        let delta = {
                            x: nextPoint.x - (deltaPoint?.x || 0),
                            y: nextPoint.y - (deltaPoint?.y || 0)
                        }
                        
                        onEdgesChange?.([{ id, type: 'position', position: delta }])

                        setDeltaPoint(delta);
                    }}
                    onPointerUp={() => {
                        setStartPoint(null)
                        setDeltaPoint(null);
                    }}
                    className="react-flow__edge-path"
                    style={{
                        ...style
                    }}
                    d={`M ${point.x} ${point.y} L ${points?.[ix + 1].x} ${points?.[ix + 1].y}`} />

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
            {points?.map((point: any, ix: number) => !printMode && (
                <circle
                    key={`edge-${id}-circle${ix}`}
                    onPointerDown={(e) => {

                        (e.target as any).setPointerCapture((e as any).pointerId)

                        // console.log("CIRLCE CLICK", e);

                        setDraggingPoint(ix);
                        setStartPoint(project({x: e.clientX, y: e.clientY}))
                        setDeltaPoint(project({ x: e.clientX, y: e.clientY }))
                    }}
                    onPointerMove={(e) => {

                        // console.log("MOVING", draggingPoint, points)
                        let nextPoint = project({ x: e.clientX, y: e.clientY });

                        if(deltaPoint && draggingPoint != null){
                            setPoints((points: any[]) => {
                                let p = points.slice();

                                p[ix] = {
                                    x: p[ix].x + (nextPoint.x - deltaPoint.x), //nextPoint.x,
                                    y: p[ix].y + (nextPoint.y - deltaPoint.y) //nextPoint.y
                                }
                                return p;
                            })
                        }

                        // if (deltaPoint && draggingPoint != null) {
                        //     let delta = { x: nextPoint.x - deltaPoint.x, y: nextPoint.y - deltaPoint.y };

                        //     // let e = (page?.edges || []).slice();

                        //     // let edgeIx = (page?.edges || []).findIndex((a: any) => a.id == id)

                        //     // const points = (e[edgeIx].data.points || []).slice();

                        //     // points[ix] = {
                        //     //     ...points[ix],
                        //     //     x: e[edgeIx].data.points[draggingPoint].x + delta.x,
                        //     //     y: e[edgeIx].data.points[draggingPoint].y + delta.y
                        //     // }

                        //     // e[edgeIx] = {
                        //     //     ...e[edgeIx],
                        //     //     data: {
                        //     //         ...e[edgeIx].data,
                        //     //         points
                        //     //     }
                        //     // }

                        //     // onUpdatePage?.({
                        //     //     ...page,
                        //     //     edges: e
                        //     // }, "mouseMove")

                        //     onEdgePointChanged?.(id, ix, {
                        //         x: delta.x,
                        //         y: delta.y
                        //     })
                        // }

                        if (draggingPoint != null) {
                            setDeltaPoint(nextPoint)
                        }
                    }}
                    onPointerUp={(e) => {
                        (e.currentTarget as any).releasePointerCapture((e as any).pointerId)

                        // let nextPoint = project({ x: e.clientX, y: e.clientY });

                        console.log({
                            xDelta: ((startPoint?.x || 0) - (deltaPoint?.x || 0)), 
                            yDelta: ((startPoint?.y || 0) - (deltaPoint?.y || 0)), 
                            startPoint,
                            deltaPoint, 
                            point: points[ix]
                        })
                        
                        updateEdge(id, ix, {
                            x: points[ix].x, // + ((deltaPoint?.x || 0) - (startPoint?.x || 0)),
                            y: points[ix].y, // + ((deltaPoint?.y || 0) - (startPoint?.y || 0))
                        })

                        // onEdgePointChanged?.(id, ix, {
                        //             x: points[ix].x,  //- (deltaPoint?.x || 0),
                        //             y: points[ix].y // - (deltaPoint?.y || 0)
                        //     })

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
