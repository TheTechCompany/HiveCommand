import { CommandSurfaceClient } from "@hive-command/command-surface";
import { useContext } from "react";
import { useState } from "react";
import { DataContext } from "../../data";
import ts, { ModuleKind } from "typescript";
import { load_exports } from ".";
import { nanoid } from "nanoid";

export const useLocalClient = (devices: any[], deviceMap: any[], subscriptionMap: any[], valueStructure: any, valueStore: any) : CommandSurfaceClient => {

    console.log({devices});

    const { authState } = useContext(DataContext)
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

        if(typeof(object) == 'object'){
            return Object.keys(object).map((key) => getTagPaths(object[key], parent ? `${parent}.${key}` : key) ).reduce((prev, curr) => prev.concat((Array.isArray(curr) ? curr : [curr])), [])   
        }else{
            return {parent, tag: object};
        }
        
    }

    const setTag = (path: string, value: any, valueFn: (values: {path: string, value: any}[] ) => void ) => {
        let tag = deviceMap?.find((a) => a.path == path)?.tag;

        if(tag?.indexOf('script://') == 0){
            const jsCode = ts.transpile(tag?.match(/script:\/\/([.\s\S]+)/)?.[1] || '', {module: ModuleKind.CommonJS})
            const { getter, setter } = load_exports(jsCode)
            console.log({jsCode})
            return setter(value, valueStructure, (values: any) => {
                
                let tags = getTagPaths(values) //.reduce((prev: any, curr: any) => [...prev, ...curr], []);

                console.log({tags, values, subscriptionMap})
                let newValues = tags.map((t: any) => {
                 
                    let path = subscriptionMap?.find((a) => a.tag == t.parent)?.path
                    if(!path) return null;

                    return {
                        path,
                        value: t.tag
                    }

                })

                valueFn(newValues)//({path: subscriptionMap.find((a) => a.tag == t.parent).path, value: t.tag}))
                // console.log("Set values from setter func", tags);
            }) 
        }else{
            // let devicePath = deviceMap?.find((a) => a.path == path)?.tag
            // let valuePath = subscriptionMap?.find((a) => a.path == devicePath)?.tag;
            // console.log({valuePath, subscriptionMap, devicePath, deviceMap, path})
            if(!tag) return valueFn([]);
            valueFn( [{path: tag, value}] ) 
            // console.log({tag})
            // tag?.split('.').reduce((prev, curr) => prev[curr], valueStore)
        }
    }



    const changeDeviceValue = (deviceName: string, stateKey: string, value: any) => {
        //Get mapping

        console.log({deviceName, stateKey, value});

        setTag(`${deviceName}.${stateKey}`, value, async (values) => {
            console.log({values});
            
            await Promise.all(values.map(async (value) => {
                await fetch(`http://localhost:8484/${authState?.opcuaServer}/set_data`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        path: value.path,
                        value: value.value
                    })
                })
            }))
            
        });

        // console.log({paths})
        //Check for script tag
            //If script tag use setter

            //Else use valueStore
    }

    const [ reportPages, setReportPages ] = useState<any[]>([]);

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
            reports.push({id: nanoid(), name})
            console.log({reports})
            // }
            setReportPages(reports)
        },
        updateReportPage: async (id, name) => {
            let reports = reportPages.slice();
            let ix = reports.map((x) => x.id).indexOf(id)
            if(ix > -1){
                reports[ix] = {...reports[ix], name}
            }
            setReportPages(reports)
        },
        removeReportPage: async (id) => {
            let reports = reportPages.slice();
            let ix = reports.map((x) => x.id).indexOf(id)
            if(ix > -1){
                reports.splice(ix, 1);
            }
            
            setReportPages(reports)
        },
        addChart: async (pageId, type, deviceId, keyId, x, y, w, h, totalize) => {
            let reports = reportPages.slice();
            let ix = reports.map((x) => x.id).indexOf(pageId)
            if(ix > -1){
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
        // updateChart,
        // updateChartGrid,
        // removeChart
        changeDeviceValue
    }
}