import { IconButton, Paper, Box, Typography, Divider, List, ListItem, CircularProgress, ListItemButton, Button } from '@mui/material';
import React, { useState } from 'react';
import { Add, DragIndicator, MoreVert } from '@mui/icons-material'

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
    const [ selected, setSelected ] = useState<any | null>(null)

    const [ activeId, setActiveId ] = useState(null);

    const { pages, onReorderPage, selectedPage } = useEditorContext();

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

    const onEdit = (page: any) => {
        openModal(true);
        setSelected(page);

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
                <Paper sx={{ minWidth: '200px', display: 'flex', flexDirection: 'column', padding: '6px' }}>
                    <PageModal
                        open={modalOpen}
                        selected={selected}
                        onDelete={() => {
                            props.onDeletePage?.(selected)

                            openModal(false) 
                            setSelected(null);
                        }}
                        onClose={() => { 
                            openModal(false) 
                            setSelected(null);
                        }}
                        onSubmit={(page) => {
                            if(selected){
                                props.onUpdatePage?.(page);
                            }else{
                                props.onCreatePage?.(page);
                            }
                            openModal(false);
                        }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ flex: 1 }}>
                            <Button size="small" disabled={props.exporting} variant='contained' onClick={props.onExport}>
                                {props.exporting ? <CircularProgress size={'20px'} sx={{marginRight: '6px'}} /> : null} Export
                            </Button>
                        </Box>
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
                    <Box sx={{flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto'}}>
                        <List>
                            {pages?.slice()?.sort((a,b) => (a.rank || '').localeCompare(b.rank || ''))?.map((page) => (
                                <PageItem  
                                    selected={selectedPage == page.id}
                                    key={props.id}
                                    onEdit={() => onEdit(page)}
                                    onSelectPage={props.onSelectPage} 
                                    page={page} />

                            ))}
                        </List>
                    </Box>

                    <DragOverlay>
                        {activeId ? (
                            <Paper sx={{display: 'flex', flex: 1}}>
                            <IconButton>
                                <DragIndicator />
                            </IconButton>
                            <ListItemButton>{pages?.find((a) => a.id == activeId)?.name}</ListItemButton>
                            </Paper>
                        ) : null}
                    </DragOverlay>
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
            <ListItem sx={{'&:hover .edit-button': {opacity: 1}, background: props.selected ? '#dfdfdf' : undefined}} >
                <IconButton  size="small" {...listeners}>
                    <DragIndicator fontSize="inherit" />
                </IconButton>
                <ListItemButton onClick={() => {
                    props.onSelectPage?.(props.page)
                }}>
                    {props.page?.name}
                </ListItemButton>
                <IconButton onClick={props.onEdit} sx={{opacity: 0}} className="edit-button" size="small">
                    <MoreVert fontSize="inherit" />
                </IconButton>
            </ListItem>
        </div>
    )
}