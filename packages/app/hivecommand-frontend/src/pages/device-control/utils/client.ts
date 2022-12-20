import { CommandSurfaceClient } from "@hive-command/command-surface";
import { useDeviceReportActions, useDeviceReports } from "./report";

export const useWebClient = (deviceId: string) : CommandSurfaceClient => {

    const { results: reports } = useDeviceReports(deviceId)


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
        removeChart
    }
}