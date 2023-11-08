import React, { useEffect, useState } from 'react';
import { EdgeProps, useStore, useReactFlow } from 'reactflow';
import { LineSegment } from './segment';

export const LinePath = (editor: boolean) => 
    (props: EdgeProps) => {

        const { project } = useReactFlow();

        const width = 6;

        const [ startPoint, setStartPoint ] = useState<any>(null);
        const [ deltaPoint, setDeltaPoint ] = useState<any>(null);
        const [ draggingPoint, setDraggingPoint ] = useState<any>(null);

        const onEdgesChange : any = useStore((s) => s.onEdgesChange)

        const all_points = [{x: props.sourceX, y: props.sourceY +( width / 2)}, ...(props.data?.points || []), {x: props.targetX, y: props.targetY + (width /2)}];

        const [ points, setPoints ] = useState<any[]>(all_points || []);

        useEffect(() => {
            setPoints(all_points)
        }, [ JSON.stringify(all_points) ])

        if(editor){
            const line = points.map((point, ix) => {
                if(points[ix + 1] == null) return;
                
                let d = `M ${point.x} ${point.y} L ${points[ix + 1].x} ${points[ix + 1].y}`
                return (<>
                    <LineSegment 
                            onMouseDown={(e) => {
                                if(e.ctrlKey || e.metaKey){
                                    onEdgesChange([{ id: props.id, type: 'points-created', ix: ix, point: { x: e.clientX, y: e.clientY } }])
                                }
                            }} d={d} />
                        </>)
            });

            const handles = points.map((point, ix) => {
                return ix > 0 && <circle 
                    onPointerDown={(e) => {
                        console.log("Handle pointerdown");
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
                       onEdgesChange([{ id: props.id, type: 'points-changed', ix: ix - 1, point: points[ix] }])
                       

                       // onEdgePointChanged?.(id, ix, {
                       //             x: points[ix].x,  //- (deltaPoint?.x || 0),
                       //             y: points[ix].y // - (deltaPoint?.y || 0)
                       //     })

                       setDraggingPoint(null)
                       setDeltaPoint(null);
                   }}
                   style={{cursor: 'crosshair', stroke: 'white', strokeWidth: '1px', pointerEvents: 'visible'}}

                       cx={point.x} 
                       cy={point.y} 
                       r={3}
                        />
            })
            return (<>{line}{handles} </>)
        }else{
            const d = 'M ' + points.map((point) => `${point.x} ${point.y}`).join(' L ')
            return (<LineSegment 
                             d={d} />)
        }

    }