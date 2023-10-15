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
import { StyledOption } from './type-selector/components';
import { TypeSelector } from './type-selector';
import { useModal } from '../../hooks/useModal';

export interface PagePaneProps {
    pages?: any[];
    templates?: any[];

    onReorderPage?: (id: string, above: any, below: any) => void,
    selectedPage?: any;

    onSelectPage?: (page: any) => void;
    onCreatePage?: (page: any) => void;
    onUpdatePage?: (page: any) => void;
    onDeletePage?: (page: any) => void;

    onCreateTemplate?: (page: any) => void;
    onUpdateTemplate?: (page: any) => void;
    onDeleteTemplate?: (page: any) => void;
}

export const PagesPane : React.FC<PagePaneProps> = (props) => {

    const [ view, setView ] = useState<'templates' | 'pages'>('pages');

    const [ search, setSearch ] = useState<string | null>(null);

    const [ modalOpen, openModal, selected, setSelected ] = useModal();
    
    const [activeId, setActiveId] = useState<any>(null);

    const { pages, templates, onReorderPage, selectedPage } = props; //useEditorContext();

    const sortedPages = useMemo(() => pages?.slice()?.sort((a: any, b: any) => (a.rank || '').localeCompare(b.rank || '')), [pages]);

    const sortedTemplates = useMemo(() => templates?.slice()?.sort((a: any, b: any) => (a.rank || '').localeCompare(b.rank || '')), [templates])

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
        openModal(true, page);

    }

    const items = useMemo(() => {

        if(view == 'pages'){
            return sortedPages?.map((page: any) => (
                <PageItem
                    selected={selectedPage?.id == page.id}
                    key={page.id}
                    onEdit={() => onEdit(page)}
                    onSelectPage={props.onSelectPage}
                    page={page} />

            ));
        }else{
            return sortedTemplates?.map((template: any) => (
                <PageItem
                    selected={selectedPage?.id == template.id}
                    key={template.id}
                    onEdit={() => onEdit(template)}
                    onSelectPage={props.onSelectPage}
                    page={template} />
            ))
        }
    }, [view, sortedPages, sortedTemplates, selectedPage])

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
                                <input 
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        outline: 'none',
                                        border: 'none'
                                    }}
                                    type="text" 
                                    placeholder='Search' 
                                    value={search} 
                                    onChange={(e) => setSearch(e.target.value)} />
                            </>
                        ) : (
                            <>
                                <IconButton 
                                    onClick={() => setSearch('')}
                                    size="small">
                                    <Search fontSize='inherit' />
                                </IconButton>

                                <TypeSelector 
                                    options={[
                                        {id: 'pages', label: "Pages"},
                                        {id: 'templates', label: "Templates"},
                                    ]}
                                    value={view}
                                    onChange={(e: any, value) => {
                                        setView(value as any)
                                    }} />
                                   

                                <IconButton onClick={() => openModal(true)} size="small">
                                    <Add fontSize='inherit' />
                                </IconButton>
                            </>
                        )}
                    </Box>
                    <Divider />
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <PageModal
                            open={modalOpen}
                            view={view}
                            selected={selected}
                            templates={sortedTemplates}
                            onDelete={() => {
                                if(view == 'pages'){
                                    props.onDeletePage?.(selected)
                                }else{
                                    props.onDeleteTemplate?.(selected)
                                }

                                openModal(false)
                                setSelected(null);
                            }}
                            onClose={() => {
                                openModal(false)
                                setSelected(null);
                            }}
                            onSubmit={(page: any) => {
                                if (selected?.id) {
                                    if(view == 'pages'){
                                        props.onUpdatePage?.({id: page?.id, name: page?.name});
                                    }else{
                                        props.onUpdateTemplate?.({id: page?.id, name: page?.name})
                                    }
                                } else {
                                    if(view == 'pages'){
                                        props.onCreatePage?.({id: page?.id, name: page?.name});
                                    }else{
                                        props.onCreateTemplate?.({id: page?.id, name: page?.name});
                                    }
                                }
                                openModal(false);
                                setSelected(null);
                            }}
                        />
        
                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
                            <List>
                                {items}
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
