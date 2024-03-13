import { gql, useMutation } from "@apollo/client";
import { CommandSurfaceClient } from "@hive-command/command-surface";
import { useState } from "react";
import { useDeviceAnalytics, useDeviceAnalyticActions } from "./analytics";
import { useValues } from "./value";
import { useConnectivity } from "./program";
import { useAcknowledgeAlarm, useAlarms } from "./alarm";

export const useWebClient = (deviceId: string) : CommandSurfaceClient => {

    const [ startDate, setDate ] = useState(new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)))

    const { results: analytics } = useDeviceAnalytics(deviceId)

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
        createAnalyticPage,
        updateAnalyticPage,
        removeAnalyticPage,
        useAnalyticValues
    } = useDeviceAnalyticActions(deviceId);


    const acknowledgeAlarm = useAcknowledgeAlarm(deviceId);

    return {
        analytics,
        acknowledgeAlarm,
        useAlarms: () => {
            return useAlarms(deviceId)
        }, 
        useValues: (program: {tags: any[], types: any[]}) => {
            return useValues(deviceId, program)
        },
        useConnectivity: () => {
            return useConnectivity(deviceId);
        },
        useAnalyticValues: (report: string, horizon: {start: Date, end: Date}) => useAnalyticValues(deviceId, report, horizon),
        createAnalyticPage,
        updateAnalyticPage,
        removeAnalyticPage,
        addChart,
        updateChart,
        updateChartGrid,
        removeChart,
        writeTagValue
    }
}