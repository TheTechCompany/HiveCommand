import { Box } from '@mui/material';
import React from 'react';
import { ECadEditor } from '@hive-command/electrical-editor'

export const SchematicEditor = () => {
    return (
        <Box sx={{flex: 1, display: 'flex', flexDirection: 'column'}}>
            <ECadEditor />
        </Box>
    )
}