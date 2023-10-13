import React, {useState} from 'react';
import { EdgeChange, useEdgesState, Edge, EdgeSelectionChange } from 'reactflow';

export const useEdgeState = (initialEdges: Edge[]) : [
    Edge[], 
    React.Dispatch<React.SetStateAction<Edge<any>[]>>,
    string[], 
    React.Dispatch<React.SetStateAction<string[]>>,
    (changes: EdgeChange[]) => void
]=> {

    const [ selectedEdges, setSelectedEdges ] = useState<string[]>([])
    const [ edges, setEdges, onEdgesChange ] = useEdgesState(initialEdges || []);

    const onEdgesChanged = (changes: EdgeChange[]) => {

        let selectionEvents : any[] = changes?.filter((a) => a.type == 'select');

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

        onEdgesChange?.(changes?.filter((a) => {
            return a.type != 'select'
        }))
    }

    const addSelect = (edge: Edge) => {
        return {
            ...edge,
            selected: (selectedEdges || []).indexOf(edge.id) > -1
        }
    }

    return [edges.map(addSelect), setEdges, selectedEdges, setSelectedEdges, onEdgesChanged]

}