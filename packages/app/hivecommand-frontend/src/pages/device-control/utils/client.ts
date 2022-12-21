import { gql, useMutation } from "@apollo/client";
import { CommandSurfaceClient } from "@hive-command/command-surface";
import { useDeviceReportActions, useDeviceReports } from "./report";

export const useWebClient = (deviceId: string) : CommandSurfaceClient => {

    const { results: reports } = useDeviceReports(deviceId)

    const [ _changeDevValue ] = useMutation(gql`
        mutation ChangeDeviceValue($deviceId: String, $deviceName: String, $key: String, $value: String) {
            changeDeviceValue(deviceId: $deviceId, deviceName: $deviceName, key: $key, value: $value)
        }
    `)

    const changeDeviceValue = (deviceName: string, stateKey: string, value: any) => {
        console.log("Change device value", deviceName, stateKey, value);
        return _changeDevValue({
            variables: {
                deviceId, 
                deviceName,
                key: stateKey,
                value: `${value}`
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
    } = useDeviceReportActions(deviceId);


    return {
        reports,
        createReportPage,
        updateReportPage,
        removeReportPage,
        addChart,
        updateChart,
        updateChartGrid,
        removeChart,
        changeDeviceValue
    }
}