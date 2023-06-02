import { CommandSurface } from '@hive-command/command-surface';
import { Box, Typography } from '@mui/material';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useRemoteCache } from '../../integrations/remote-cache';
import { DataContext } from '../../data';
import axios from 'axios';
import io, {Socket} from 'socket.io-client'
import ts, { ModuleKind } from 'typescript'
import { useLocalClient } from './client';
import { DataTypes } from '@hive-command/scripting';
import moment from 'moment';
import { useNativeContext } from '../../context';

export const load_exports = (code: string,) => {

    const _require = (name: string) => {
        console.log("Requires", name)
    }

    const exports : any = {};
    const module = { exports };
    const func = new Function("require", "module", "exports", code);
    func(_require, module, exports);
    return module.exports;
}

export const Controller = (props: {sidecar: boolean}) => {
    // const ref = useRef<any>();

    const { isSidecarRunning } = useNativeContext();

    const { authState, globalState } = useContext(DataContext);

    const { interface: programInterface, templatePacks, tags, types } = globalState || {};

    const [packs, setPacks] = useRemoteCache('remote-components.json');

    const LocalClient = useLocalClient( [] )


    const [ prevValues, setPrevValues ] = useState<any>({});

    // useEffect(() => {
        
    //     console.log(`Potential change between values`);
        
    //     Object.keys((values || {}) as any).map((valueKey) => {
    //         if( !isEqual(prevValues[valueKey], (values || {} as any)[valueKey]) ){
    //             console.log(`Publishing change for valueKey ${valueKey}`);

    //             socket.current?.emit('publish-change', {key: valueKey, value: (values || {} as any)[valueKey]})
    //         }
    //     })

    //     setPrevValues(values)

    // }, [values, prevValues, socket.current])
    

    // deviceValueData?.commandDevices?.[0]?.deviceSnapshot || []
    // console.log({valueStore})

    const [ date, setDate ] = useState(new Date());

    useEffect(() => {

        const dateTimer = setInterval(() => {
            setDate(new Date());
        }, 1 * 1000)

        return () => {
            clearInterval(dateTimer);
        }
    }, [])

    return (
        <Box sx={{flex: 1, display: 'flex', flexDirection: 'column'}}>
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px'}}>
                <Typography>
                    {moment(date).format('DD/MM/yyyy - hh:mma')}
                </Typography>

                <Box sx={{display: 'flex', alignItems: 'center'}}>
                    <Typography fontSize={'12px'} sx={{marginRight: '6px'}}>{isSidecarRunning == true ? "Driver running" : "Driver not running"}</Typography>
                    <div style={{width: '10px', height: '10px', background: isSidecarRunning  == true ? 'green' : 'red', borderRadius: '10px'}} />
                </Box>
            </Box>
            <CommandSurface 
                client={LocalClient}
                cache={[packs, setPacks] as any}
                program={{
                    interface: programInterface,
                    templatePacks: templatePacks,
                    tags,
                    types
                } as any} />

        </Box>
    )
}