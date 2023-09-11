import React, { useState } from 'react';
import {CSS} from '@dnd-kit/utilities';

import { 
    DndContext,
    KeyboardSensor,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors
} from '@dnd-kit/core'

import { 
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
    sortableKeyboardCoordinates
} from '@dnd-kit/sortable'
import { List, ListItem } from '@mui/material';
import { DragHandle } from '@mui/icons-material';

export interface SortableListProps {
    items?: {id: string}[],
    onReorderItems?: (oldIx: number, newIx: number) => void,
    onItemClick?: (item: any) => void,
    children?: (item: any, ix: number) => JSX.Element

}

export const SortableList : React.FC<SortableListProps> = (props) => {


    const [ activeId, setActiveId ] = useState(null);


    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );


    const handleDragEnd = (event: any) => {
        const { active, over } = event;

        if (active.id !== over.id) {

            const oldIndex = props.items?.findIndex((a) => a.id == active.id);
            const newIndex = props.items?.findIndex((a) => a.id == over.id);

            props?.onReorderItems?.(oldIndex, newIndex)

        }

        setActiveId(null);
    }

    const handleDragStart = (event: any) => {
        const { active } = event;

        setActiveId(active);
    }

    return (
        <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
    >
        <SortableContext
            items={(props.items || []).map((x) => x.id)}
            strategy={verticalListSortingStrategy}
        >   
            <List>
            {props.items?.map((item, ix) => (
                <SortableItem 
                    onClick={() => props.onItemClick?.(item)}
                    id={item.id}>
                    {props.children?.(item, ix)}
                </SortableItem> 
            ))}
            </List>
        </SortableContext>

        </DndContext>
    )
}

export const SortableItem : React.FC<{id: string, onClick: any}> = (props) => {
    const { transform, transition, setNodeRef, listeners, attributes } = useSortable({ id: props?.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition
    }
    
    return (
        <ListItem 
            ref={setNodeRef} 
            style={style}
            onClick={props.onClick}
            {...attributes} >
            <DragHandle {...listeners} />

            {props.children}
        </ListItem> 
    )
}