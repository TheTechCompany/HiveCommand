import { gql, useApolloClient, useQuery } from "@apollo/client"
import { useEffect } from "react";

export const useAlarms = (deviceId: string) => {

    const client = useApolloClient();

    const { data } = useQuery(gql`
        query GetDeviceAlarms($id: ID){
			commandDevices(where: {id: $id}){
                alarms {
                    message

                    severity
                  
                    cause {
                        title
                    } 
                  
                    ack
                  
                    createdAt
                  
                }
            }
        }
    `)

    const refetch = () => {
        client.refetchQueries({include: ['DeviceConnectivity']})
    }

    useEffect(() => {
        const interval = setInterval(() => {
            refetch();
        }, 5 * 1000)

        return () => {
            clearInterval(interval)
        }
    }, [])

    const alarms = data?.commandDevices?.[0]?.alarms || [];

    return {
        results: alarms,
        refetch
    }
}