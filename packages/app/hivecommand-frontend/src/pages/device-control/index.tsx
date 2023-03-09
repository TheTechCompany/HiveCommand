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

    const watchers = useWatchers(id);

    const program = results?.[0]?.activeProgram || {};

    const performDeviceAction = usePerformDeviceAction(id)
    const changeDeviceValue = useChangeDeviceValue(id)

    const changeMode = useChangeMode(id)

    const defaultPage = program?.remoteHomepage?.id;

    const daysHorizon = 14;
    const [lastDate, setLastDate] = useState(null)

    const normalisedValues = useMemo(() => {

        let valueObj = values.reduce((prev, curr) => {

            let key = curr.key;

            let update = {};

            if (key) {
                update = {
                    ...prev[curr.id],
                    [key]: curr.value
                }
            } else {
                update = curr.value;
            }

            return {
                ...prev,
                [curr.id]: update
            }
        }, {});

        return program?.tags?.map((tag) => {

            let type = program?.types?.find((a) => a.name === tag.type) || tag.type;

            let hasFields = (type?.fields || []).length > 0;

            let value = valueObj[tag.name];

            if (
                type &&
                typeof (type) === "string" &&
                type.indexOf('[]') > -1 &&
                typeof (value) === "object" &&
                !Array.isArray(value) &&
                Object.keys(value).map((x: any) => x % 1 == 0).indexOf(false) < 0
            ) {
                value = Object.keys(value).map((x) => value[x]);
            }

            return {
                key: `${tag.name}`,
                value: value
            }

        }).reduce((prev, curr) => ({
            ...prev,
            [curr.key]: curr.value
        }), {})

    
    }, [program.tags, program.types, values])

    useEffect(() => {
        const interval = setInterval(() => {
            refetchValues();
        }, 2000)

        return () => {
            clearInterval(interval)
        }
    }, [])

    return (
        <Box sx={{ flex: 1, display: 'flex', padding: '6px', flexDirection: 'column' }}>
            <CommandSurface
                values={normalisedValues}
                title={`${results?.[0]?.name} - ${program?.name}`}
                // reports={reports}
                client={client}
                
                program={program}
                defaultPage={defaultPage}
             
                watching={watchers}
            >
            </CommandSurface>
        </Box>
    )
}