import { gql, useApolloClient, useQuery, useLazyQuery } from "@apollo/client";

export const useDeviceValues = (id: string) : {
	refetch: () => void;
	results: {id: string, key: string, value: string}[]
} => {

    const client = useApolloClient();

    const { data: deviceValueData } = useQuery(gql`
		query DeviceValues($id: ID) {
		
			commandDevices (where: {id: $id}){
				deviceSnapshot {
					placeholder
					key
					value
                }
			}
		}
    `, {
		variables: {
			id: id,
		}
	})

	

    return {
        refetch: () => {
            client.refetchQueries({include: ['DeviceValues']})
        },
        results: deviceValueData?.commandDevices?.[0]?.deviceSnapshot?.map((x) => ({id: x.placeholder, key: x.key, value: x.value})) || []
    }
}


export const useDeviceHistory = (id: string) => {

	const HISTORIC_DATA_QUERY = gql`
		query HistoricDeviceValues($id: ID, $startDate: DateTime, $endDate: DateTime){

			commandDevices(where: {id: $id}){
				deviceSnapshot(where: {startDate: $startDate, endDate: $endDate}){
					placeholder
					key
					value
					lastUpdated
				}
			}
		}
	`
	const [getHistoricValues, {data}] = useLazyQuery(HISTORIC_DATA_QUERY)

	return {
		getHistoricValues,
		data: data?.commandDevices?.[0]?.deviceSnapshot?.map((x) => ({id: x.placeholder, lastUpdated: x.lastUpdated, key: x.key, value: x.value})) || []
	}
}