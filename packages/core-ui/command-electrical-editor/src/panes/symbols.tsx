import { Box, Divider, List, ListItem, Paper, TextField, Typography } from '@mui/material';
import React from 'react';
import { useEditorContext } from '../context';

export const SymbolsPane = () => {

    const { elements, setSelectedSymbol } = useEditorContext();

    return (
        <Paper sx={{ minWidth: '200px', maxHeight: '100%', padding: '6px', display: 'flex', flexDirection: 'column' }}>
            <TextField fullWidth size="small" label="Search" />
            <Divider sx={{ margin: '6px' }} />
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
                <List sx={{ flex: 1 }}>
                    {elements?.map((item) => (
                        <ListItem onClick={() => setSelectedSymbol(item)} sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ height: 'auto', width: '50px' }}>
                                {item.component()}
                            </Box>
                            <Typography>
                                {item.name}
                            </Typography>
                        </ListItem>
                    ))}
                </List>
            </Box>
        </Paper>
    )
}