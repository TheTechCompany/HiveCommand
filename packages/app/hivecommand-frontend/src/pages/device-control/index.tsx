import React from 'react';
import { Box } from '@mui/material';
import { CommandSurface } from '@hive-command/command-surface';
import { useWatchers } from './utils/watchers';
import { useParams } from 'react-router-dom';
import { useDevice } from './utils/program';
import { useDeviceValues } from './utils/value';
import { useChangeDeviceValue, usePerformDeviceAction } from '@hive-command/api';

export const DeviceControlView = () => {
    
    const { id } = useParams();

    const { results, refetch } = useDevice(id);

    const { results: values, refetch: refetchValues } = useDeviceValues(id);

    const watchers = useWatchers(id);

    const program = results?.[0]?.activeProgram || {};

    const performDeviceAction = usePerformDeviceAction(id)
    const changeDeviceValue = useChangeDeviceValue(id)

    return (
        <Box sx={{flex: 1, display: 'flex', flexDirection: 'column'}}>
            <CommandSurface
                values={values}
                program={program}
                onCommand={(type, params) => {
                    // console.log({type, params});

                    switch(type){
                        case 'UPDATE-DEVICE-STATE':
                            //Send device value to OPC
                            changeDeviceValue(params.deviceName, params.stateKey, params.value).then(() => {

                            })

                        case 'PERFORM-DEVICE-ACTION':
                            //Run action on opc

                            performDeviceAction(params.deviceName, params.actionKey).then(() => {

                            });
                    }
                }}
                watching={watchers}
                />
        </Box>
    )
}