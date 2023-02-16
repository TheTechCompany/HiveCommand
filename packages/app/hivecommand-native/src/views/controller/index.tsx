import { CommandSurface } from '@hive-command/command-surface';
import { Box } from '@mui/material';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useRemoteCache } from '../../integrations/remote-cache';
import { DataContext } from '../../data';
import axios from 'axios';
import io, {Socket} from 'socket.io-client'
import ts, { ModuleKind } from 'typescript'
import {merge, isEqual} from 'lodash';
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

    const [ valueStore, setValueStore ] = useState<{[key: string]: any}>({})
    
    const valueStructure = useMemo(() => {
        return Object.keys(valueStore).map((valueKey) => {
            if(valueKey.indexOf('.') > -1){
                return valueKey.split('.').reverse().reduce((prev, curr) => ({[curr]: prev}), valueStore[valueKey])
            }else{
                return {[valueKey]: valueStore[valueKey]}
            }
        }).reduce((prev, curr) => merge(prev, curr), {})
       
        // return subscriptionMap?.map((subscription) => {
        //      // let value = props.values[devicePath];
        //      let value = valueStore[subscription.tag] //.split('.').reduce((prev, curr) => prev?.[curr] || undefined, valueStore)

        //      if(subscription.tag.indexOf('.') > -1){
        //         return subscription.tag.split('.').reverse().reduce((prev, curr) => ({[curr]: prev}), value)
        //      }else{
        //         return {[subscription.tag]: value};
        //      }

        //     //  return obj
        //  }).reduce((prev, curr) => merge(prev, curr), {})
    }, [JSON.stringify(valueStore), subscriptionMap])

    const LocalClient = useLocalClient( [], deviceMap || [], subscriptionMap || [], valueStructure, valueStore)

    const socket = useRef<Socket>()

    const subscribe = (paths: {path: string, tag: string}[], devices: {path: string, tag: string}[]) => {
        socket.current = io(`http://localhost:${8484}`)

        socket.current.on('connected', () => {
            console.log("Connected");
            // alert("Connected to io socket")
        })

        socket.current.on('data-changed', (data) => {
            console.log("Datachanged", data.key, data.value)
            // alert("Datachange on io socketç" + JSON.stringify({data}))

            setValueStore((store) => ({
                ...store,
                [data.key]: Object.keys(data.value) ? {
                    ...store[data.key],
                    ...data.value,
                } : data.value
            }));

        })
        

        return axios.post(`http://localhost:${8484}/${authState?.opcuaServer}/subscribe`).then((r) => r.data).then((data) => {
            if(data.data){
                console.log("Initial state store", data.data)
                setValueStore(data.data)
            }
            // alert("Subscribe")
            // if(data.results){
            //     setOPCUA(data.results || [])
            // }else{
            //     console.log({data})
            // }
        })
    }


    const unsubscribe = () => {
        return axios.post(`http://localhost:${8484}/${authState?.opcuaServer}/unsubscribe`)
    }


    //Subscribe to datapoints
    useEffect(() => {
        if(globalState?.subscriptionMap)
            subscribe(globalState?.subscriptionMap, globalState.deviceMap || [])

        //Cleanup subscription
        return () => {
            unsubscribe()
        }
    }, [globalState?.subscriptionMap])


    const [ prevValues, setPrevValues ] = useState<any>({});

    const values = useMemo(() => {
        return controlLayout?.tags.map((tag) => {

            let type = controlLayout.types?.find((a) => a.name === tag.type);

            let hasFields = (type?.fields || []).length > 0;

            return {
                key: `${tag.name}`,
                value: valueStructure[tag.name]
            }

        }).reduce((prev, curr) => ({
            ...prev,
            [curr.key]: curr.value
        }), {})
    }, [valueStructure, controlLayout?.tags, controlLayout?.types])

    console.log({values})

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
                values={values as any}//values as any}
                client={LocalClient}
                cache={[packs, setPacks] as any}
                program={controlLayout} />

        </Box>
    )
}