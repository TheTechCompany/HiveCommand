import { gql, useApolloClient, useQuery } from "@apollo/client";

export const useDeviceValues = (id: string) => {

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
