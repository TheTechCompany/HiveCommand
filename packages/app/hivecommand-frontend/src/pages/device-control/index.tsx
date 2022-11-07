import React from 'react';
import { Box } from '@mui/material';
import { CommandSurface } from '@hive-command/command-surface';
import { useWatchers } from './utils/watchers';
import { useParams } from 'react-router-dom';
import { useDevice } from './utils/program';

export const DeviceControlView = () => {
    
    const { id } = useParams();

    const { results, refetch } = useDevice(id);
    const watchers = useWatchers(id);

    const program = results?.[0]?.activeProgram || {};

    return (
        <Box sx={{flex: 1, display: 'flex', flexDirection: 'column'}}>
            <CommandSurface
                values={{
                    FIT101: {
                        on: '12.9',
                        flow: '12'
                    }
                }}
                program={program}
                onCommand={(type, params) => {
                    console.log({type, params});
                }}
                watching={watchers}
                />
        </Box>
    )
}