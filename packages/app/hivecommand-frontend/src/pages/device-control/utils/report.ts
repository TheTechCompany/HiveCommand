import { useQuery, useApolloClient, gql } from "@apollo/client"
import { useAddDeviceChart, useCreateReportPage, useRemoveDeviceChart, useRemoveReportPage, useUpdateDeviceChart, useUpdateDeviceChartGrid, useUpdateReportPage } from "@hive-command/api";

export const useDeviceReports = (id: string, startDate: Date) => {
  const { data } = useQuery(gql`
    query ReportData($id: ID, $startDate: DateTime) {

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

            totalValue(startDate: $startDate){
              total
            }

            values (startDate: $startDate) {
                value
                timestamp
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
  });

  return {
    results: (data?.commandDevices?.[0]?.reports || [])?.map((report) => ({
      ...report,
      label: `${report.tag?.name}`
    }))
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
    addChart: addDeviceChart,
    updateChart: updateDeviceChart,
    updateChartGrid,
    removeChart,
    createReportPage,
    updateReportPage,
    removeReportPage
  }
}