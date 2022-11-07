import { CommandSurface } from '@hive-command/command-surface';
import { Box } from '@mui/material';
import React, { useContext } from 'react';
import { useRemoteCache } from '../../integrations/remote-cache';
import { DataContext } from '../../data';

export const Controller = () => {
    
    const { globalState } = useContext(DataContext);

    const { controlLayout, networkLayout } = globalState;

    const [packs, setPacks] = useRemoteCache('remote-components.json');

    // deviceValueData?.commandDevices?.[0]?.deviceSnapshot || []
    console.log({controlLayout})
    return (
        <Box sx={{flex: 1, display: 'flex'}}>

            <CommandSurface 
                values={{}}
                cache={[packs, setPacks] as any}
                program={controlLayout} />

        </Box>
    )
}