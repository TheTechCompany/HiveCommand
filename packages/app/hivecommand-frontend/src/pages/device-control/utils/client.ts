import { gql, useMutation } from "@apollo/client";
import { CommandSurfaceClient } from "@hive-command/command-surface";
import { useState } from "react";
import { useDeviceReportActions, useDeviceReports } from "./report";
import { useValues } from "./value";

export const useWebClient = (deviceId: string) : CommandSurfaceClient => {

    const [ startDate, setDate ] = useState(new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)))

    const { results: reports } = useDeviceReports(deviceId)

    const [ _changeDevValue ] = useMutation(gql`
        mutation ChangeDeviceValue($deviceId: String, $deviceName: String, $key: String, $value: String) {
            changeDeviceValue(deviceId: $deviceId, deviceName: $deviceName, key: $key, value: $value)
        }
    `)

    const writeTagValue = (deviceName: string, value: any, stateKey?: string) => {
        console.log("Change device value", deviceName, stateKey, value);
        return _changeDevValue({
            variables: {
                deviceId, 
                deviceName,
                key: stateKey,
                value: Array.isArray(value) ? JSON.stringify(value) : `${value}`
            }
        })
    }

    const { 
        addChart, 
        updateChart, 
        updateChartGrid, 
        removeChart,
        createReportPage,
        updateReportPage,
        removeReportPage,
        useReportValues
    } = useDeviceReportActions(deviceId);


    return {
        reports,
        useValues: (program: {tags: any[], types: any[]}) => {
            return useValues(deviceId, program)
        },
        useReportValues: (report: string, horizon: {start: Date, end: Date}) => useReportValues(deviceId, report, horizon),
        createReportPage,
        updateReportPage,
        removeReportPage,
        addChart,
        updateChart,
        updateChartGrid,
        removeChart,
        writeTagValue
    }
}