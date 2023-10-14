import React, {useState} from 'react';
import { EdgeChange, useEdgesState, Edge, EdgeSelectionChange, useReactFlow, XYPosition } from 'reactflow';

export type EdgePointsChange<EdgeData = any> = {
    item: Edge<EdgeData>;
    type: 'points-changed';
};

export type EdgePointsCreated<EdgeData = any> = {
    item: Edge<EdgeData>;
    type: 'points-create';
};

export type EdgePositionChanged = {
    id: string;
    type: 'position';
    position?: XYPosition;
    dragging?: boolean;
};

export type EdgeChanged = EdgeChange | EdgePointsChange | EdgePointsCreated | EdgePositionChanged

export const useEdgeState = (initialEdges: Edge[], current: any, onChange?: (edges: Edge[]) => void) : [
    Edge[], 
    React.Dispatch<React.SetStateAction<Edge<any>[]>>,
    string[], 
    React.Dispatch<React.SetStateAction<string[]>>,
    (changes: EdgeChanged[]) => void
]=> {


    const { project } = useReactFlow();
    const [ selectedEdges, setSelectedEdges ] = useState<string[]>([])
    const [ edges, setEdges, onEdgesChange ] = useEdgesState(initialEdges || []);

    const onEdgesChanged = (changes: EdgeChanged[]) => {

        let realChanges = (changes as any[])?.filter((a) => {
            return a.type != 'select' && a.type != 'points-changed' && a.type != 'points-create' && a.type != 'remove'
        });

        let totalChanges = (changes as any[])?.filter((a) => {
            return a.type != 'select' && a.type != 'remove'
        });


        let bounds = current?.getBoundingClientRect?.();

        let selectionEvents : any[] = changes?.filter((a) => a.type == 'select');

        let pointEvents : any[] = changes?.filter((a) => a.type == 'points-changed');

        let pointCreateEvents : any[] = changes?.filter((a) => a.type == 'points-create')

        let positionEvents : any[] = changes?.filter((a) => a.type == 'position')

        if(positionEvents?.length > 0){
            let e = edges.slice()

            pointEvents.forEach((event) => {
                let mainIx = e.findIndex((a) => a.id == event.id)
                let points = e[mainIx]?.data?.points?.map((x: any) => ({
                    x: x.x + event?.position?.x,
                    y: x.y + event?.psotion?.y
                }));

                // points[event.item?.ix] = {
                //     // ...event?.item?.pos,
                //     x: points[event?.item?.ix] + event?.
                //     // ...project({
                //     //     x: event?.item?.pos?.x - bounds.x,
                //     //     y: event?.item?.pos?.y - bounds.y
                //     // })
                // }
                e[mainIx].data = {
                    ...e[mainIx]?.data,
                    points
                }
                
            })

            setEdges(e)
        }

        if(selectionEvents?.length > 0){
            let selection = (selectedEdges || []).slice();
            selectionEvents.forEach((event: EdgeSelectionChange) => {
                if(event.selected){
                    selection.push(event.id)
                }else{
                    selection = selection?.filter((a) => a !== event.id)
                }
            })
            setSelectedEdges([...new Set(selection)])
        }

        if(pointCreateEvents?.length > 0){
            let e = edges.slice()

            pointCreateEvents.forEach((event) => {
                let mainIx = e.findIndex((a) => a.id == event.id)
                let points = e[mainIx]?.data?.points?.slice();

                points?.splice(event?.item?.ix + 1, 0, project({
                    x: event?.item?.pos?.x - bounds?.x,
                    y: event?.item?.pos?.y - bounds?.y
                }))
             
                // points[event.item?.ix] = {
                //     ...event?.item?.pos,

                //     // ...project({
                //     //     x: event?.item?.pos?.x - bounds.x,
                //     //     y: event?.item?.pos?.y - bounds.y
                //     // })
                // }

                e[mainIx].data = {
                    ...e[mainIx]?.data,
                    points
                }
                
            })

            setEdges(e)
        }

        if(pointEvents?.length > 0){
            let e = edges.slice()

            pointEvents.forEach((event) => {
                let mainIx = e.findIndex((a) => a.id == event.id)
                let points = e[mainIx]?.data?.points?.slice();

                points[event.item?.ix] = {
                    ...event?.item?.pos,

                    // ...project({
                    //     x: event?.item?.pos?.x - bounds.x,
                    //     y: event?.item?.pos?.y - bounds.y
                    // })
                }
                e[mainIx].data = {
                    ...e[mainIx]?.data,
                    points
                }
                
            })

            setEdges(e)

        }

        onEdgesChange?.(realChanges)

        console.log("Changes", edges, changes)

        if(totalChanges?.length > 0){
            onChange?.(edges)
        }
    }

    const addSelect = (edge: Edge) => {
        return {
            ...edge,
            selected: (selectedEdges || []).indexOf(edge.id) > -1
        }
    }

    return [edges.map(addSelect), setEdges, selectedEdges, setSelectedEdges, onEdgesChanged]

}