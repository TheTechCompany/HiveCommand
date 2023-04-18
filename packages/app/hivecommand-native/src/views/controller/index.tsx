import { CommandSurface } from '@hive-command/command-surface';
import { Box } from '@mui/material';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useRemoteCache } from '../../integrations/remote-cache';
import { DataContext } from '../../data';
import axios from 'axios';
import io, {Socket} from 'socket.io-client'
import ts, { ModuleKind } from 'typescript'
import { useLocalClient } from './client';
import { DataTypes } from '@hive-command/scripting';

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

export const Controller = () => {
    // const ref = useRef<any>();

    const { authState, globalState } = useContext(DataContext);

    const { controlLayout, deviceMap, subscriptionMap, networkLayout } = globalState || {};

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
    return (
        <Box sx={{flex: 1, display: 'flex'}}>

            <CommandSurface 
                client={LocalClient}
                cache={[packs, setPacks] as any}
                program={controlLayout} />

        </Box>
    )
}