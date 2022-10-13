import { Box } from '@mui/material'
import React from 'react';
import { InfiniteCanvas } from '@hexhive/ui';

// import { CommandSurface } from '@hive-command/command-surface'
export const HMIView = () => {

    return (
        <Box sx={{flex: 1, display: 'flex', flexDirection: 'column'}}>
            <InfiniteCanvas />
            {/* <CommandSurface /> */}
        </Box>
    )
}