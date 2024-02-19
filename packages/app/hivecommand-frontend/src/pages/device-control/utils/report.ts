import { useQuery, useApolloClient, gql } from "@apollo/client"
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

            tag {
                id
                name
            }

            subkey {
              id
              name
            }

            unit
   
            timeBucket
            
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
    results: (data?.commandDevices?.[0]?.reports || [])?.map((report) => ({
      ...report,
      label: `${report.tag?.name}`
    }))
  }
}


export const useDeviceReportData = (deviceId: string, reportId: string, horizon: {start: Date, end?: Date}) => {
  const { data: reportData, loading } = useQuery(gql`
    query ReportDataValue($id: ID, $reportId: ID, $startDate: DateTime, $endDate: DateTime){
      commandDevices(where: {id: $id}){
        
        reports (where: { ids: [$reportId] }) {
          id

          charts {
            id

            totalValue(startDate: $startDate, endDate: $endDate) {
              total
            }
            values (startDate: $startDate, endDate: $endDate){
              timestamp
              value
            }
          }
        }
      }
    }
  `, {
    variables: {
      id: deviceId,
      reportId,
      startDate: horizon.start?.toISOString(),
      endDate: horizon.end?.toISOString()
    }
  })

  return {
    loading,
    results: reportData?.commandDevices?.[0]?.reports?.[0]?.charts || []
  }

}

const withRefetch = (fn: any, refetch: any) => {
  return async (...args: any[]) => {
    const res = await fn(...args)
    refetch();
    return res;
  }
}

export const useDeviceReportActions = (id: string) => {

  const client = useApolloClient()

  const refetch = () => {
    client.refetchQueries({include: ['ReportData']});
  }
  
  const addDeviceChart = withRefetch(useAddDeviceChart(id), refetch)
  const updateDeviceChart = withRefetch(useUpdateDeviceChart(id), refetch);
  const updateChartGrid = withRefetch(useUpdateDeviceChartGrid(id), refetch);
  const removeChart = withRefetch(useRemoveDeviceChart(id), refetch);

  const createReportPage = withRefetch(useCreateReportPage(id), refetch);
  const updateReportPage = withRefetch(useUpdateReportPage(id), refetch);
  const removeReportPage = withRefetch(useRemoveReportPage(id), refetch);

  return {
    useReportValues: useDeviceReportData,
    addChart: addDeviceChart,
    updateChart: updateDeviceChart,
    updateChartGrid,
    removeChart,
    createReportPage,
    updateReportPage,
    removeReportPage
  }
}