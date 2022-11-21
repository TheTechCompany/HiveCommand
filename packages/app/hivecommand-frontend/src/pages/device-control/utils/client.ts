import { CommandSurfaceClient } from "@hive-command/command-surface";
import { useDeviceReportActions } from "./report";

export const useWebClient = (deviceId: string) : CommandSurfaceClient => {


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
        createReportPage,
        updateReportPage,
        removeReportPage,
        addChart,
        updateChart,
        updateChartGrid,
        removeChart
    }
}