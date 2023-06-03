import { CommandSurfaceClient } from "@hive-command/command-surface";
import { useContext, useEffect, useMemo, useRef } from "react";
import { useState } from "react";
import { DataContext } from "../../data";
import ts, { ModuleKind } from "typescript";
import { load_exports } from ".";
import { nanoid } from "nanoid";
import { merge } from 'lodash'
import axios from "axios";
import { io, Socket } from "socket.io-client";

export const useLocalClient = (devices: any[]): CommandSurfaceClient => {


    const { authState, globalState } = useContext(DataContext)

    const { tags, types } = globalState || {};

    /*
        {
            A: {
                B: {
                    C: 'asdf'
                }
            }
        }
    */
    let getTagPaths = (object: any, parent?: string): any => {
        // console.log("Get tag paths", object, parent)

        if (typeof (object) == 'object' && !Array.isArray(object)) {
            return Object.keys(object).map((key) => getTagPaths(object[key], parent ? `${parent}.${key}` : key)).reduce((prev, curr) => prev.concat((Array.isArray(curr) ? curr : [curr])), [])
        } else {
            return { parent, tag: object };
        }

    }


    const [valueStore, setValueStore] = useState<{ [key: string]: any }>({})

    const valueStructure = useMemo(() => {
        return Object.keys(valueStore).map((valueKey) => {
            if (valueKey.indexOf('.') > -1) {
                return valueKey.split('.').reverse().reduce((prev, curr) => ({ [curr]: prev }), valueStore[valueKey])
            } else {
                return { [valueKey]: valueStore[valueKey] }
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
    }, [JSON.stringify(valueStore)])


    const onDataChanged = (data: any) => {
        console.log("data changed", data);

        setTimeout(() => {
            setValueStore((store) => {

                store[data.key] = (typeof (data.value) === 'object' && !Array.isArray(data.value)) ? {
                    ...store[data.key],
                    ...data.value,
                } : data.value;

                // ...store,
                // [data.key]: 
                return store;
            });
        })

    }


    const socket = useRef<Socket>()

    const subscribe = () => {
        socket.current = io(`http://localhost:${8484}`);

        (window as any).socket = socket.current;

        socket.current.on('connected', () => {
            console.log("Connected");
            // alert("Connected to io socket")
        })

        socket.current.on('data-changed', onDataChanged)


        // return axios.post(`http://localhost:${8484}/${authState?.opcuaServer}/subscribe`).then((r) => r.data).then((data) => {
        //     if (data.data) {
        //         console.log("Initial state store", data.data)
        //         setValueStore(data.data)
        //     }

        // })
    }


    const unsubscribe = () => {
        socket.current?.off('data-changed', onDataChanged);

        // return axios.post(`http://localhost:${8484}/${authState?.opcuaServer}/unsubscribe`)
    }


    //Subscribe to datapoints
    useEffect(() => {
        // if (globalState?.subscriptionMap)
            subscribe()

        //Cleanup subscription
        return () => {
            unsubscribe()
        }
    }, [])



    const values = useMemo(() => {
        return tags?.map((tag) => {

            let type = types?.find((a) => a.name === tag.type);

            let hasFields = (type?.fields || []).length > 0;

            return {
                key: `${tag.name}`,
                value: valueStructure[tag.name]
            }

        }).reduce((prev, curr) => ({
            ...prev,
            [curr.key]: curr.value
        }), {})

    }, [valueStructure, tags, types])


    // const setTag = (path: string, value: any, valueFn: (values: {path: string, value: any}[] ) => void ) => {
    //     let tag = deviceMap?.find((a) => a.path == path)?.tag;

    //     if(tag?.indexOf('script://') == 0){
    //         const jsCode = ts.transpile(tag?.match(/script:\/\/([.\s\S]+)/)?.[1] || '', {module: ModuleKind.CommonJS})
    //         const { getter, setter } = load_exports(jsCode)
    //         // console.log({jsCode})
    //         return setter(value, valueStructure, (values: any) => {

    //             let tags = getTagPaths(values) //.reduce((prev: any, curr: any) => [...prev, ...curr], []);

    //             // console.log({tags, values, subscriptionMap})
    //             let newValues = tags.map((t: any) => {

    //                 let path = subscriptionMap?.find((a) => a.tag == t.parent)?.path
    //                 if(!path) return null;

    //                 return {
    //                     path,
    //                     value: t.tag
    //                 }

    //             })

    //             valueFn(newValues)//({path: subscriptionMap.find((a) => a.tag == t.parent).path, value: t.tag}))
    //             // console.log("Set values from setter func", tags);
    //         }) 
    //     }else{
    //         // let devicePath = deviceMap?.find((a) => a.path == path)?.tag
    //         // let valuePath = subscriptionMap?.find((a) => a.path == devicePath)?.tag;
    //         // console.log({valuePath, subscriptionMap, devicePath, deviceMap, path})
    //         if(!tag) return valueFn([]);
    //         valueFn( [{path: tag, value}] ) 
    //         // console.log({tag})
    //         // tag?.split('.').reduce((prev, curr) => prev[curr], valueStore)
    //     }
    // }



    const changeDeviceValue = async (deviceName: string, value: any, stateKey?: string) => {
        //Get mapping

        console.log({ deviceName, stateKey, value });

        await fetch(`http://localhost:8484/controller/set_data`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                path: `${deviceName}${stateKey ? `.${stateKey}` : ''}`,
                value: value
            })
        })

        // setTag(`${deviceName}${stateKey ? `.${stateKey}` : ''}`, value, async (values) => {
        //     console.log({values});

        //     await Promise.all(values.map(async (value) => {
        //         await fetch(`http://localhost:8484/${authState?.opcuaServer}/set_data`, {
        //             method: "POST",
        //             headers: {
        //                 "Content-Type": "application/json"
        //             },
        //             body: JSON.stringify({
        //                 path: value.path,
        //                 value: value.value
        //             })
        //         })
        //     }))

        // });

        // console.log({paths})
        //Check for script tag
        //If script tag use setter

        //Else use valueStore
    }

    const [reportPages, setReportPages] = useState<any[]>([]);

    // const { 
    //     addChart, 
    //     updateChart, 
    //     updateChartGrid, 
    //     removeChart,
    //     createReportPage,
    //     updateReportPage,
    //     removeReportPage,
    // } = useDeviceReportActions(deviceId);


    return {
        reports: reportPages,
        createReportPage: async (name) => {
            let reports = reportPages.slice();
            // let ix = reports.map((x) => x.name).indexOf(name)
            // if(ix < 0){
            reports.push({ id: nanoid(), name })
            console.log({ reports })
            // }
            setReportPages(reports)
        },
        updateReportPage: async (id, name) => {
            let reports = reportPages.slice();
            let ix = reports.map((x) => x.id).indexOf(id)
            if (ix > -1) {
                reports[ix] = { ...reports[ix], name }
            }
            setReportPages(reports)
        },
        removeReportPage: async (id) => {
            let reports = reportPages.slice();
            let ix = reports.map((x) => x.id).indexOf(id)
            if (ix > -1) {
                reports.splice(ix, 1);
            }

            setReportPages(reports)
        },
        addChart: async (pageId, type, deviceId, keyId, x, y, w, h, totalize) => {
            let reports = reportPages.slice();
            let ix = reports.map((x) => x.id).indexOf(pageId)
            if (ix > -1) {
                let charts = reports[ix]?.charts?.slice() || [];

                let dev = devices.find((a) => a.id == deviceId);
                let key = dev.type?.state?.find((a: any) => a.id == keyId);

                charts.push({
                    id: nanoid(),
                    x,
                    y,
                    w,
                    h,
                    dataDevice: {
                        name: `${dev.type?.tagPrefix ? dev.type?.tagPrefix + '.' : ''}${dev.tag}`
                    },
                    dataKey: {
                        key: key.key
                    },
                    label: deviceId,
                    values: []
                })

                reports[ix] = {
                    ...reports[ix],
                    charts
                }
                // reports.splice(ix, 1);
            }
            setReportPages(reports)
        },
        useValues: (program) => {
            return { values };
        },
        // updateChart,
        // updateChartGrid,
        // removeChart
        writeTagValue: changeDeviceValue
    }
}