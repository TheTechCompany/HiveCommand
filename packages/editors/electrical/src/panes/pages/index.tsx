import { IconButton, Paper, Box, Typography, Divider, List, ListItem, CircularProgress, ListItemButton, Button, TextField } from '@mui/material';
import React, { useMemo, useState } from 'react';
import { Add, DragIndicator, Search, MoreVert, ArrowLeft } from '@mui/icons-material'

import { PageModal } from './modal';
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
import { PageItem } from './item';
import { BasePane } from '@hive-command/editor-panes';

export interface PagePaneProps {
    pages?: any[];
    onReorderPage?: (id: string, above: any, below: any) => void,
    selectedPage?: any;

    onSelectPage?: (page: any) => void;
    onCreatePage?: (page: any) => void;
    onUpdatePage?: (page: any) => void;
    onDeletePage?: (page: any) => void;
}

export const PagesPane : React.FC<PagePaneProps> = (props) => {

    const [ search, setSearch ] = useState<string | null>(null);

    const [modalOpen, openModal] = useState(false);
    const [selected, setSelected] = useState<any | null>(null)

    const [activeId, setActiveId] = useState<any>(null);

    const { pages, onReorderPage, selectedPage } = props; //useEditorContext();

    const sortedPages = useMemo(() => pages?.slice()?.sort((a: any, b: any) => (a.rank || '').localeCompare(b.rank || '')), [pages]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );


    const handleDragEnd = (event: any) => {
        const { active, over } = event;

        if (active.id !== over.id) {

            const oldIndex = pages?.findIndex((a: any) => a.id == active.id);

            const newIndex = (sortedPages || []).findIndex((a: any) => a.id == over.id)

            console.log("OVER", over, newIndex, pages?.[newIndex])

            // let above = sortedPages?.[newIndex - 1]?.id;
            // let below = sortedPages?.[newIndex]?.id;

            if (oldIndex != null && newIndex != null) {
                const p = arrayMove<any>(sortedPages || [], oldIndex, newIndex)

                let above = p?.[newIndex - 1]?.id;
                let below = p?.[newIndex + 1]?.id;

                onReorderPage?.(active.id, above, below)

            }
            // console.log(above, below);

            // onReorderPage?.(active.id, above, below)

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
                items={(sortedPages || []).map((x: any) => x.id)}
                strategy={verticalListSortingStrategy}
            >

                <BasePane>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        {search != null ? ( 
                            <>
                                <IconButton onClick={() => setSearch(null)} size="small">
                                    <ArrowLeft fontSize="inherit" />
                                </IconButton>
                                <input type="text" placeholder='Search...' value={search} onChange={(e) => setSearch(e.target.value)} />
                            </>
                        ) : (
                            <>
                                <IconButton 
                                    onClick={() => setSearch('')}
                                    size="small">
                                    <Search fontSize='inherit' />
                                </IconButton>

                                <Typography>Pages</Typography>

                                <IconButton size="small">
                                    <Add fontSize='inherit' />
                                </IconButton>
                            </>
                        )}
                    </Box>
                    <Divider />
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
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
                            onSubmit={(page: any) => {
                                if (selected) {
                                    props.onUpdatePage?.(page);
                                } else {
                                    props.onCreatePage?.(page);
                                }
                                openModal(false);
                            }}
                        />
        
                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
                            <List>
                                {sortedPages?.map((page: any) => (
                                    <PageItem
                                        selected={selectedPage?.id == page.id}
                                        key={page.id}
                                        onEdit={() => onEdit(page)}
                                        onSelectPage={props.onSelectPage}
                                        page={page} />

                                ))}
                            </List>
                        </Box>

                        <DragOverlay>
                            {activeId ? (
                                <Paper sx={{ display: 'flex', flex: 1 }}>
                                    <IconButton>
                                        <DragIndicator />
                                    </IconButton>
                                    <ListItemButton>{sortedPages?.find((a: any) => a.id == activeId?.id)?.name}</ListItemButton>
                                </Paper>
                            ) : null}
                        </DragOverlay>
                    </Box>

                </BasePane>

            </SortableContext>
        </DndContext>
    )
}
