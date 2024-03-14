import { useQuery, useApolloClient, gql } from "@apollo/client"
import { useAddDeviceChart, useCreateAnalyticPage, useRemoveDeviceChart, useRemoveAnalyticPage, useUpdateDeviceChart, useUpdateDeviceChartGrid, useUpdateAnalyticPage } from "@hive-command/api";
import { useDownloadReport, useCreateReport, useUpdateReport, useRemoveReport, useCreateReportField, useUpdateReportField, useRemoveReportField } from "@hive-command/api";
import { withRefetch } from "./analytics";

export const useDeviceReports = (id: string) => {
  const { data } = useQuery(gql`
    query ReportData($id: ID) {

      commandDevices(where: {id: $id}){

        reports {
          id
          name

          startDate
          endDate
          reportLength

          recurring

          fields {
            id

            device {
              id
              name
              type
            }

            key {
              id
              name
            }

            bucket
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
    results: (data?.commandDevices?.[0]?.reports || [])?.map((analytic) => ({
      ...analytic,
    }))
  }
}


export const useDeviceReportActions = (id: string) => {

  const client = useApolloClient()

  const refetch = () => {
    client.refetchQueries({include: ['ReportData']});
  }
  
  const downloadReport = useDownloadReport(id);
  const createReport = withRefetch(useCreateReport(id), refetch)
  const updateReport = withRefetch(useUpdateReport(id), refetch);
  const deleteReport = withRefetch(useRemoveReport(id), refetch);

  const createReportField = withRefetch(useCreateReportField(id), refetch);
  const updateReportField = withRefetch(useUpdateReportField(id), refetch);
  const deleteReportField = withRefetch(useRemoveReportField(id), refetch);

  return {
    // useAnalyticValues: useDeviceAnalyticData,
    downloadReport,
    createReport,
    updateReport,
    deleteReport,
    createReportField,
    updateReportField,
    deleteReportField
  }
}