import React, { useEffect, useMemo, useState } from 'react';
import { Box } from '@mui/material';
import { CommandSurface } from '@hive-command/command-surface';
import { useWatchers } from './utils/watchers';
import { useParams } from 'react-router-dom';
import { useDevice } from './utils/program';
import { useDeviceHistory, useDeviceValues } from './utils/value';
import { useChangeDeviceValue, useChangeMode, usePerformDeviceAction } from '@hive-command/api';
import moment from 'moment';
import { useDeviceReports } from './utils/report';
import { useWebClient } from './utils/client';

export const DeviceControlView = () => {
    
    const { id } = useParams();

    const client = useWebClient(id);

    const { results, refetch } = useDevice(id);

    const { results: values, refetch: refetchValues } = useDeviceValues(id);

    const { getHistoricValues, data: historicValues } = useDeviceHistory(id);

    const { results: reports } = useDeviceReports(id)

    const watchers = useWatchers(id);

    const program = results?.[0]?.activeProgram || {};

    const performDeviceAction = usePerformDeviceAction(id)
    const changeDeviceValue = useChangeDeviceValue(id)

    const changeMode = useChangeMode(id)

    const defaultPage = program?.remoteHomepage?.id;

    const daysHorizon = 14;
    const [ lastDate, setLastDate ] = useState(null)
    
    const normalisedValues = useMemo(() => {
       
        return values.reduce((prev, curr) => ({
            ...prev,
            [curr.id]: {
                ...prev[curr.id],
                [curr.key]: curr.value
            }
        }), {})
            // return Object.keys(props.values).map((devicePath) => {
    
            //     let value = props.values[devicePath];
            //     let obj = devicePath.split('.').reverse().reduce((prev, curr) => ({[curr]: prev}), value)
    
            //     return obj
            // }).reduce((prev, curr) => merge(prev, curr), {})
    
            // // if (Array.isArray(props.values)) {
            // //     return props.values.reduce((prev, curr) => ({
            //         ...prev,
            //         [curr.id]: {
            //             ...prev[curr.id],
            //             [curr.key]: curr.value
            //         }
            //     }), {})
            // } else {
            //     return props.values;
            // }
    }, [values])

    useEffect(() => {
        const interval = setInterval(() => {
            refetchValues();
        }, 2000)

        return () => {
            clearInterval(interval)
        }
    }, [])

    console.log({program})

    const [ testValues, setValues ] = useState<any>({BLO701: {on: false}, BLO601: {on: false}});

    useEffect(() => {
        
        
        const timer = setTimeout(() => {
            // console.log("Timer")

            console.log("TEST VALUES")
            setValues({BLO601: {on: true}})

        }, 10 * 1000)

        return () => {
            clearInterval(timer);
        }
    }, [])

    console.log({normalisedValues})

    return (
        <Box sx={{flex: 1, display: 'flex', padding: '6px', flexDirection: 'column'}}>
            <CommandSurface
                values={normalisedValues}
                title={`${results?.[0]?.name} - ${program?.name}`}
                // reports={reports}
                client={client}
                // values={values}
                // seekValue={(startDate, endDate) => {

                //     // console.log({moment: moment(lastDate).diff(startDate, 'day')})
                //     if(!lastDate || Math.abs(moment(lastDate).diff(startDate, 'day')) > (daysHorizon / 2)){
                //         let _startDate;
                //         let _endDate;
                //         if(!lastDate){
                //             _startDate = startDate;
                //             _endDate = moment(startDate).add(daysHorizon, 'days').toDate();
                //         }else{
                //             _startDate = moment(lastDate || startDate).add(daysHorizon, 'days').toDate()
                //             _endDate = moment(lastDate ).add(daysHorizon * 2, 'days').toDate()
                //         }

                //         console.log({_startDate, _endDate})
                //         getHistoricValues({
                //             variables: {
                //                 id,
                //                 startDate: startDate,
                //                 endDate: endDate
                //             }
                //         })
                //         setLastDate(startDate)
                //     }
                //     return historicValues;
                // }}
                program={program}
                defaultPage={defaultPage}
                // onCommand={(type, params) => {
                //     // console.log({type, params});

                //     switch(type){
                //         case 'UPDATE-DEVICE-STATE':
                //             //Send device value to OPC
                //             changeDeviceValue(params.deviceName, params.stateKey, params.value).then(() => {

                //             })

                //         case 'PERFORM-DEVICE-ACTION':
                //             //Run action on opc

                //             performDeviceAction(params.deviceName, params.actionKey).then(() => {

                //             });
                //         case 'CHANGE-MODE':
                //             changeMode(params.mode).then(() => {

                //             })
                //     }
                // }}
                watching={watchers}
                >
            </CommandSurface>   
        </Box>
    )
}