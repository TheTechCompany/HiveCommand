import { IconButton, Paper, Box, Typography, Divider, List, ListItem, ListItemButton, Button } from '@mui/material';
import React, { useState } from 'react';
import { Add, DragHandle } from '@mui/icons-material'
import { PageModal } from '../components/page-modal';
import { useEditorContext } from '../context';
import {CSS} from '@dnd-kit/utilities';
import { DragOverlay } from '@dnd-kit/core';

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    useSortable,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';

export const PagesPane = (props: any) => {
    const [modalOpen, openModal] = useState(false);

    const [ activeId, setActiveId ] = useState(null);

    const { pages, onReorderPage } = useEditorContext();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );


    const handleDragEnd = (event: any) => {
        const { active, over } = event;

        if (active.id !== over.id) {

            const oldIndex = pages?.findIndex((a) => a.id == active.id);
            const newIndex = pages?.findIndex((a) => a.id == over.id);

            onReorderPage?.(oldIndex, newIndex)

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
                items={(pages || []).map((x) => x.id)}
                strategy={verticalListSortingStrategy}
            >
                <Paper sx={{ minWidth: '200px', padding: '6px' }}>
                    <PageModal
                        open={modalOpen}
                        onClose={() => { openModal(false) }}
                        onSubmit={(page) => {
                            props.onCreatePage?.(page);
                            openModal(false);
                        }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ flex: 1 }}><Button size="small" variant='contained' onClick={props.onExport}>Export</Button></Box>
                        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                            <Typography>Pages</Typography>
                        </Box>
                        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                            <IconButton onClick={() => openModal(true)}>
                                <Add />
                            </IconButton>
                        </Box>
                    </Box>
                    <Divider sx={{margin: '6px'}}/>
                    
                    <List>
                        {pages?.slice()?.sort((a,b) => (a.rank || '').localeCompare(b.rank || ''))?.map((page) => (
                            <PageItem  
                                key={props.id}
                                onSelectPage={props.onSelectPage} 
                                page={page} />

                        ))}
                    </List>
{/* 
                    <DragOverlay>
                        {activeId ? (
                            <Paper sx={{display: 'flex', flex: 1}}>
                            <IconButton>
                                <DragHandle />
                            </IconButton>
                            <ListItemButton>{pages?.find((a) => a.id == activeId)?.name}</ListItemButton>
                            </Paper>
                        ) : null}
                    </DragOverlay> */}
                </Paper>
            </SortableContext>
        </DndContext>
    )
}

export const PageItem = (props: any) => {
    const { transform, transition, setNodeRef, listeners, attributes } = useSortable({ id: props.page?.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition
    }

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            <ListItem onClick={() => {
                props.onSelectPage?.(props.page)
            }}>
                <IconButton {...listeners}>
                    <DragHandle />
                </IconButton>
                <ListItemButton>{props.page?.name}</ListItemButton>
            </ListItem>
        </div>
    )
}