import { IconButton, Paper, Box, Typography, Divider, List, ListItem, ListItemButton } from '@mui/material';
import React, { useState } from 'react';
import { Add } from '@mui/icons-material'
import { PageModal } from '../components/page-modal';
import { useEditorContext } from '../context';

export const PagesPane = (props: any) => {
    const [ modalOpen, openModal ] = useState(false);

    const { pages } = useEditorContext();

    return (
        <Paper sx={{ minWidth: '200px', padding: '6px' }}>
            <PageModal
                open={modalOpen} 
                onClose={() => {openModal(false)}}
                onSubmit={(page) => {
                    props.onCreatePage?.(page);
                    openModal(false);
                }}
                />
            <Box sx={{display: 'flex', alignItems: 'center'}}>
                <Box sx={{flex: 1}}></Box>
                <Box sx={{flex: 1}}>
                    <Typography>Pages</Typography>
                </Box>
                <Box sx={{flex: 1, display: 'flex', justifyContent: 'flex-end'}}>
                    <IconButton onClick={() => openModal(true)}>
                        <Add />
                    </IconButton>
                </Box>
            </Box>
            <Divider />

            <List>
                {pages?.map((page) => (
                    <ListItem onClick={() => {
                        props.onSelectPage?.(page)
                    }}>
                        <ListItemButton>{page.name}</ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Paper>
    )
}