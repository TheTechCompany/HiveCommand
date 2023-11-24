import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import { CommandSurface } from '@hive-command/command-surface';
import { useWatchers } from './utils/watchers';
import { useNavigate, useParams } from 'react-router-dom';
import { useDevice } from './utils/program';
import moment from 'moment';
import { useDeviceReports } from './utils/report';
import { useWebClient } from './utils/client';

export const DeviceControlView = () => {

    const navigate = useNavigate();
    
    const { id = '' } = useParams();

    const client = useWebClient(id);

    const { results, refetch } = useDevice(id);

    const watchers = useWatchers(id);

    const program = useMemo(() => results?.[0]?.activeProgram || {}, [results])

    const defaultPage = useMemo(() => program?.remoteHomepage?.id, [program]);

    // const inactive = client.lastUpdate / lastHeartbeat > 5 minutes;

    // const daysHorizon = 14;
    // const [lastDate, setLastDate] = useState(null)

    return (
        <Box sx={{ flex: 1, display: 'flex', padding: '6px', flexDirection: 'column' }}>
            <CommandSurface
                // values={normalisedValues}
                title={`${results?.[0]?.name} - ${program?.name}`}
                // reports={reports}
                client={client}
                
                program={program}
                defaultPage={defaultPage}
             
                watching={watchers}
                onHome={() => {
                    navigate('../')
                }}
            >
            </CommandSurface>
        </Box>
    )
}