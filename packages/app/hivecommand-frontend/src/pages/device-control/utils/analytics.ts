import { useQuery, useApolloClient, gql } from "@apollo/client"
import { useAddDeviceChart, useCreateAnalyticPage, useRemoveDeviceChart, useRemoveAnalyticPage, useUpdateDeviceChart, useUpdateDeviceChartGrid, useUpdateAnalyticPage, useDownloadAnalytic } from "@hive-command/api";

export const useDeviceAnalytics = (id: string) => {
  const { data } = useQuery(gql`
    query AnalyticData($id: ID) {

      commandDevices(where: {id: $id}){

        analyticPages {
          id
          name
          createdAt 

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
                type
            }

            subkey {
              id
              name
            }

            unit
   
            timeBucket

            xAxisDomain
            yAxisDomain
            
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
    results: (data?.commandDevices?.[0]?.analyticPages || [])?.map((analytic) => ({
      ...analytic,
      label: `${analytic.tag?.name}`
    }))
  }
}


export const useDeviceAnalyticData = (deviceId: string, analyticId: string, horizon: {start?: Date, end?: Date}) => {
  const { data: analyticData, loading } = useQuery(gql`
    query AnalyticDataValue($id: ID, $analyticId: ID, $startDate: DateTime, $endDate: DateTime){
      commandDevices(where: {id: $id}){
        
        analyticPages (where: { ids: [$analyticId] }) {
          id
          createdAt

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
      analyticId,
      startDate: horizon.start?.toISOString(),
      endDate: horizon.end?.toISOString()
    }
  })

  return {
    loading,
    results: analyticData?.commandDevices?.[0]?.analyticPages?.[0]?.charts || []
  }

}

export const withRefetch = (fn: any, refetch: any) => {
  return async (...args: any[]) => {
    const res = await fn(...args)
    refetch();
    return res;
  }
}

export const useDeviceAnalyticActions = (id: string) => {

  const client = useApolloClient()

  const refetch = () => {
    client.refetchQueries({include: ['AnalyticData']});
  }
  
  const addDeviceChart = withRefetch(useAddDeviceChart(id), refetch)
  const updateDeviceChart = withRefetch(useUpdateDeviceChart(id), refetch);
  const updateChartGrid = withRefetch(useUpdateDeviceChartGrid(id), refetch);
  const removeChart = withRefetch(useRemoveDeviceChart(id), refetch);

  const createAnalyticPage = withRefetch(useCreateAnalyticPage(id), refetch);
  const updateAnalyticPage = withRefetch(useUpdateAnalyticPage(id), refetch);
  const removeAnalyticPage = withRefetch(useRemoveAnalyticPage(id), refetch);

  const downloadAnalytic = useDownloadAnalytic(id)

  return {
    useAnalyticValues: useDeviceAnalyticData,
    addChart: addDeviceChart,
    updateChart: updateDeviceChart,
    updateChartGrid,
    removeChart,
    createAnalyticPage,
    updateAnalyticPage,
    removeAnalyticPage,
    downloadAnalytic
  }
}