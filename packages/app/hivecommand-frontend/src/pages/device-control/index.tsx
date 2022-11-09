import React, { useState } from 'react';
import { Box } from '@mui/material';
import { CommandSurface } from '@hive-command/command-surface';
import { useWatchers } from './utils/watchers';
import { useParams } from 'react-router-dom';
import { useDevice } from './utils/program';
import { useDeviceHistory, useDeviceValues } from './utils/value';
import { useChangeDeviceValue, usePerformDeviceAction } from '@hive-command/api';
import moment from 'moment';

export const DeviceControlView = () => {
    
    const { id } = useParams();

    const { results, refetch } = useDevice(id);

    const { results: values, refetch: refetchValues } = useDeviceValues(id);

    const { getHistoricValues, data: historicValues } = useDeviceHistory(id);

    const watchers = useWatchers(id);

    const program = results?.[0]?.activeProgram || {};

    const performDeviceAction = usePerformDeviceAction(id)
    const changeDeviceValue = useChangeDeviceValue(id)

    const defaultPage = program?.remoteHomepage?.id;

    const daysHorizon = 14;
    const [ lastDate, setLastDate ] = useState(null)
    
    return (
        <Box sx={{flex: 1, display: 'flex', flexDirection: 'column'}}>
            <CommandSurface
                values={values}
                seekValue={(startDate, endDate) => {

                    // console.log({moment: moment(lastDate).diff(startDate, 'day')})
                    if(!lastDate || Math.abs(moment(lastDate).diff(startDate, 'day')) > (daysHorizon / 2)){
                        let _startDate;
                        let _endDate;
                        if(!lastDate){
                            _startDate = startDate;
                            _endDate = moment(startDate).add(daysHorizon, 'days').toDate();
                        }else{
                            _startDate = moment(lastDate || startDate).add(daysHorizon, 'days').toDate()
                            _endDate = moment(lastDate ).add(daysHorizon * 2, 'days').toDate()
                        }

                        console.log({_startDate, _endDate})
                        getHistoricValues({
                            variables: {
                                id,
                                startDate: startDate,
                                endDate: endDate
                            }
                        })
                        setLastDate(startDate)
                    }
                    return historicValues;
                }}
                program={program}
                defaultPage={defaultPage}
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