import { CommandSurface } from '@hive-command/command-surface';
import { Box } from '@mui/material';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useRemoteCache } from '../../integrations/remote-cache';
import { DataContext } from '../../data';
import axios from 'axios';
import io, {Socket} from 'socket.io-client'
import ts, { ModuleKind } from 'typescript'
import {merge} from 'lodash';
import { useLocalClient } from './client';

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
        return subscriptionMap?.map((subscription) => {
             // let value = props.values[devicePath];
             let value = valueStore[subscription.tag] //.split('.').reduce((prev, curr) => prev?.[curr] || undefined, valueStore)

             console.log({valueStore, subscription});
             
             let obj = subscription.tag.split('.').reverse().reduce((prev, curr) => ({[curr]: prev}), value)
 
             return obj
         }).reduce((prev, curr) => merge(prev, curr), {})
    }, [JSON.stringify(valueStore), subscriptionMap])

    const LocalClient = useLocalClient( [], deviceMap || [], subscriptionMap || [], valueStructure, valueStore)

    const socket = useRef<Socket>()

    console.log({valueStore, valueStructure });

    const subscribe = (paths: {path: string, tag: string}[]) => {
        socket.current = io(`http://localhost:${8484}`)

        socket.current.on('connected', () => {
            console.log("Connected");
            // alert("Connected to io socket")
        })

        socket.current.on('data-changed', (data) => {
            console.log("Datachanged", data.value.value)
            // alert("Datachange on io socketç" + JSON.stringify({data}))

            setValueStore((store) => ({
                ...store,
                [data.key]: data.value.value
            }));

        })
        

        return axios.post(`http://localhost:${8484}/${authState?.opcuaServer}/subscribe`, {
                paths
        }).then((r) => r.data).then((data) => {
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
            subscribe(globalState?.subscriptionMap)

        //Cleanup subscription
        return () => {
            unsubscribe()
        }
    }, [globalState?.subscriptionMap])

    const parseValue = (type: string, value: any) => {
        switch(type){
            case 'Boolean':
            case 'BooleanT':
                if(!value || value == false || value == 'false' || value == 0 || value == '0'){
                    return false;
                }else if(value == true || value == 'true' || value == 1 || value == '1'){
                    return true;
                }
                return false;
            case 'IntegerT':
            case 'UIntegerT':
                return parseInt(value || 0);
            default:
                console.log(type)
                return value;
        }
    }

    const values = useMemo(() => {
        return controlLayout?.tags.map((tag) => {

            let type = controlLayout.types?.find((a) => a.name === tag.type);

            return {
                key: `${tag.name}`,
                value: type?.fields.map((field) => {
                    let path = `${tag.name}.${field.name}`

                    let tagValue = deviceMap?.find((a) => a.path == path)?.tag

                    // let type = x.type;

                    if(tagValue?.indexOf('script://') == 0){
                        // console.log({tag})
                        const jsCode = ts.transpile(tagValue?.match(/script:\/\/([.\s\S]+)/)?.[1] || '', {module: ModuleKind.CommonJS})
                        const { getter, setter } = load_exports(jsCode)

                        let value = parseValue(field.type, getter(valueStructure));

                        console.log("Script function", field.name, value);

                        return {key: field.name, value: value}

                    }else{
                        let rawTag = subscriptionMap?.find((a) => a.path == tagValue)?.tag
                        
                        let value = parseValue(field.type, rawTag?.split('.').reduce((prev, curr) => prev[curr], valueStructure))
                        return {key: field.name, value: value}
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
    }, [valueStructure, controlLayout?.tags, controlLayout?.types])

    console.log({values})

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