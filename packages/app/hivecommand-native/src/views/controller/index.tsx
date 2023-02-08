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
        return subscriptionMap?.map((subscription) => {
             // let value = props.values[devicePath];
             let value = valueStore[subscription.tag] //.split('.').reduce((prev, curr) => prev?.[curr] || undefined, valueStore)

             if(subscription.tag.indexOf('.') > -1){
                return subscription.tag.split('.').reverse().reduce((prev, curr) => ({[curr]: prev}), value)
             }else{
                return {[subscription.tag]: value};
             }

            //  return obj
         }).reduce((prev, curr) => merge(prev, curr), {})
    }, [JSON.stringify(valueStore), subscriptionMap])

    const LocalClient = useLocalClient( [], deviceMap || [], subscriptionMap || [], valueStructure, valueStore)

    const socket = useRef<Socket>()

    const subscribe = (paths: {path: string, tag: string}[]) => {
        socket.current = io(`http://localhost:${8484}`)

        socket.current.on('connected', () => {
            console.log("Connected");
            // alert("Connected to io socket")
        })

        socket.current.on('data-changed', (data) => {
            console.log("Datachanged", data.key, data.value.value)
            // alert("Datachange on io socketç" + JSON.stringify({data}))

            setValueStore((store) => ({
                ...store,
                [data.key]: data.value.value
            }));

        })
        

        return axios.post(`http://localhost:${8484}/${authState?.opcuaServer}/subscribe`, {
                paths
        }).then((r) => r.data).then((data) => {
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
            subscribe(globalState?.subscriptionMap)

        //Cleanup subscription
        return () => {
            unsubscribe()
        }
    }, [globalState?.subscriptionMap])

    const parseValue = (type: string, value: any) => {

        let isArray = type.indexOf('[]') > -1;
        
        if(isArray && !Array.isArray(value)) value = []
        if(isArray) type = type?.replace('[]', '') as any
        
        // switch(type){
        //     case DataTypes.Boolean:
        //         if(!value || value == false || value == 'false' || value == 0 || value == '0'){
        //             return false;
        //         }else if(value == true || value == 'true' || value == 1 || value == '1'){
        //             return true;
        //         }
        //         return false;
        //     case DataTypes.Number:
        //         return parseInt(value || 0);
        //     default:
        //         console.log("PARSE VALUE WITH TYPE", type)
        //         return value;
        // }

        switch (type) {
            case DataTypes.Boolean:
                return isArray ? value.map((value: any) => (value == true || value == "true" || value == 1 || value == "1")) : (value == true || value == "true" || value == 1 || value == "1");
            case DataTypes.Number:

                return isArray ? value.map((value: any) => {
                    let val = parseFloat(value || 0);
                    if (Number.isNaN(val)) {
                        val = 0;
                    }
                    return val.toFixed(2);
                }) : (() => {
                    let val = parseFloat(value || 0);

                    if(Number.isNaN(val)) {
                        val = 0;
                    }
                    return val.toFixed(2);
                })()
            default:
                console.log({ type })
                break;
        }
    }

    const values = useMemo(() => {
        return controlLayout?.tags.map((tag) => {

            let type = controlLayout.types?.find((a) => a.name === tag.type);

            let hasFields = (type?.fields || []).length > 0;

            return {
                key: `${tag.name}`,
                value: hasFields ? type?.fields.map((field) => {
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
                }), {}) : (() => {

                    let path = `${tag.name}`

                    let tagValue = deviceMap?.find((a) => a.path == path)?.tag

                    console.log("RAW", tagValue, path, deviceMap)
                    // let type = x.type;

                    if(tagValue?.indexOf('script://') == 0){
                        // console.log({tag})
                        const jsCode = ts.transpile(tagValue?.match(/script:\/\/([.\s\S]+)/)?.[1] || '', {module: ModuleKind.CommonJS})
                        const { getter, setter } = load_exports(jsCode)

                        let value = parseValue(tag.type, getter(valueStructure));

                        console.log("Script function", tag.name, tag.type, value, valueStructure);

                        return value

                    }else{
                        let rawTag = subscriptionMap?.find((a) => a.path == tagValue)?.tag
                        
                        let value = parseValue(tag.type, rawTag?.split('.').reduce((prev, curr) => prev[curr], valueStructure))

                        console.log("RAW", rawTag, valueStructure, value)

                        return value
                    }

                })(),
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