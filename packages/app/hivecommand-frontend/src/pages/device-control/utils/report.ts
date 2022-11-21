import { useQuery, gql } from "@apollo/client"
import { useAddDeviceChart, useCreateReportPage, useRemoveDeviceChart, useRemoveReportPage, useUpdateDeviceChart, useUpdateDeviceChartGrid, useUpdateReportPage } from "@hive-command/api";

export const useDeviceReports = (id: string) => {
  const { data } = useQuery(gql`
    query ReportData($id: ID) {

      commandDevices(where: {id: $id}){

        reports {
          id
          name

          charts {
            id
            
            x
            y
            width
            height

            total

            device {
                id
                name
            }
            dataDevice {
                id
                tag
            }
            dataKey {
                id
                key
            }

          }
      
        }
      }
    }
  `, {
    variables: {
      id,
    }
  });

  return {
    results: data?.commandDevices?.[0]?.reports || []
  }
}

export const useDeviceReportData = (id: string, startDate: Date) => {
  const { data: reportData, loading } = useQuery(gql`
    query ReportDataValue($id: ID, $startDate: DateTime){
      commandDevices(where: {id: $id}){
        
        reports {
          id

          charts {
            totalValue(startDate: $startDate) {
              total
            }
            values (startDate: $startDate){
              timestamp
              value
            }
          }
        }
      }
    }
  `, {
    variables: {
      id,
      startDate: startDate.toISOString()
    }
  })

  return {
    results: reportData?.commandDevices?.[0]?.reports || []
  }

}

export const useDeviceReportActions = (id: string) => {

  const addDeviceChart = useAddDeviceChart(id)
  const updateDeviceChart = useUpdateDeviceChart(id);
  const updateChartGrid = useUpdateDeviceChartGrid(id);
  const removeChart = useRemoveDeviceChart(id);

  const createReportPage = useCreateReportPage(id);
  const updateReportPage = useUpdateReportPage(id);
  const removeReportPage = useRemoveReportPage(id);

  return {
    addChart: addDeviceChart,
    updateChart: updateDeviceChart,
    updateChartGrid,
    removeChart,
    createReportPage,
    updateReportPage,
    removeReportPage
  }
}