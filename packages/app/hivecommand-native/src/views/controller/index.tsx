import { CommandSurface } from '@hive-command/command-surface';
import { Box } from '@mui/material';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useRemoteCache } from '../../integrations/remote-cache';
import { DataContext } from '../../data';
import axios from 'axios';
import io, {Socket} from 'socket.io-client'
import * as esbuild from 'esbuild-wasm'
import ts, { ModuleKind } from 'typescript'
import {merge} from 'lodash';

const load_exports = (code: string,) => {

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

      useEffect(() => {
        const output = ts.transpile('export const getter = () => { return 123 }', {module: ModuleKind.CommonJS});

        new Function()
        // console.log({output});

        console.log({exports: load_exports(output).getter()})
        // startService().then(() => {
        //     esbuild.transform('export const getter = () => {}').then((r) => console.log({r}))
        // }).catch((e: any) => {
        //     console.log({e})
        //     // esbuild.transform('export const getter = () => {}').then((r) => console.log({r}))

        // });
      }, []);

    const { authState, globalState } = useContext(DataContext);

    const { controlLayout, deviceMap, subscriptionMap, networkLayout } = globalState || {};

    const [packs, setPacks] = useRemoteCache('remote-components.json');

    


    const [ valueStore, setValueStore ] = useState<{[key: string]: any}>({})

    const valueStructure = useMemo(() => {
        return subscriptionMap?.map((subscription) => {
 
            console.log(subscription.tag.split('.'), valueStore)
             // let value = props.values[devicePath];
             let value = valueStore[subscription.tag] //.split('.').reduce((prev, curr) => prev?.[curr] || undefined, valueStore)

             let obj = subscription.tag.split('.').reverse().reduce((prev, curr) => ({[curr]: prev}), value || undefined)
 
             return obj
         }).reduce((prev, curr) => merge(prev, curr), {})
    }, [valueStore])

    console.log({valueStructure})

    const socket = useRef<Socket>()

    const subscribe = (paths: {path: string, tag: string}[]) => {
        socket.current = io(`http://localhost:${8484}`)

        socket.current.on('connected', () => {
            console.log("Connected");
        })
        socket.current.on('data-changed', (data) => {
            console.log({data})
            setValueStore((store) => ({
                ...store,
                [data.key]: data.value.value
            }));
        })

        return axios.post(`http://localhost:${8484}/${authState?.opcuaServer}/subscribe`, {
                paths
        }).then((r) => r.data).then((data) => {
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
            subscribe(globalState?.subscriptionMap)

        //Cleanup subscription
        return () => {
            unsubscribe()
        }
    }, [globalState?.subscriptionMap])

    const values = useMemo(() => {
        return controlLayout?.devices.map((device) => {

            return {
                key: `${device.type.tagPrefix ? device.type.tagPrefix  : ''}${device.tag}`,
                value: device.type.state.map((x) => {
                    let path = `${device.type.tagPrefix ? device.type.tagPrefix  : ''}${device.tag}.${x.key}`

                    let tag = deviceMap?.find((a) => a.path == path)?.tag

                    if(tag?.indexOf('script://') == 0){
                        // console.log({tag})
                        const jsCode = ts.transpile(tag?.match(/script:\/\/([.\s\S]+)/)?.[1] || '', {module: ModuleKind.CommonJS})
                        const { getter, setter } = load_exports(jsCode)

                        return {key: x.key, value: getter(valueStructure)}

                    }else{
                        return {key: x.key, value: tag?.split('.').reduce((prev, curr) => prev[curr], valueStore)}
                    }
                }).reduce((prev, curr) => ({
                    ...prev,
                    [curr.key]: curr.value
                }), {}),
            }
        }).reduce((prev, curr) => ({
            ...prev,
            [curr.key]: curr.value
        }), {})
    }, [valueStructure, controlLayout?.devices])

    // deviceValueData?.commandDevices?.[0]?.deviceSnapshot || []
    // console.log({valueStore})
    return (
        <Box sx={{flex: 1, display: 'flex'}}>

            <CommandSurface 
                values={values as any}
                cache={[packs, setPacks] as any}
                program={controlLayout} />

        </Box>
    )
}