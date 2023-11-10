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

        console.log("POINTS", props, props.data)

        const sourcePoint = props.data?.sourcePoint || {x: props.sourceX, y: props.sourceY + (width / 2)}
        const targetPoint = props.data?.targetPoint || {x: props.targetX, y: props.targetY + (width / 2)}

        const all_points = [sourcePoint, ...(props.data?.points || []), targetPoint];

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
                        selected={props.selected}
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

                       if (draggingPoint != null) {
                           setDeltaPoint(nextPoint)
                       }
                   }}
                   onPointerUp={(e) => {
                       (e.currentTarget as any).releasePointerCapture((e as any).pointerId)

                       onEdgesChange([{ id: props.id, type: 'points-changed', ix: ix - 1, point: points[ix] }])

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
                        selected={props.selected}
                             d={d} />)
        }

    }