import { gql, useApolloClient, useMutation, useQuery } from "@apollo/client"
import { useEffect } from "react";

export const useAlarms = (deviceId: string) => {

    const client = useApolloClient();

    const { data } = useQuery(gql`
        query GetDeviceAlarms($id: ID){
			commandDevices(where: {id: $id}){
                alarms {
                    id

                    message

                    severity
                  
                    cause {
                        title
                    } 
                  
                    ackBy {
                        name
                    }
                    ackAt 
                    
                    ack
                  
                    createdAt
                  
                }
            }
        }
    `, {
        variables: {
            id: deviceId
        }
    })

    const refetch = () => {
        client.refetchQueries({include: ['GetDeviceAlarms']})
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

export const useAcknowledgeAlarm = (deviceId: string) => {
    
    const client = useApolloClient();

    const [ mutateFn ] = useMutation(gql`
        mutation AckAlarm ($deviceId: ID, $alarmId: ID){
            acknowledgeCommandDeviceAlarm(alarm: $alarmId, device: $deviceId)
        }
    `)

    return (alarm: string) => {
        return mutateFn({variables: {deviceId, alarmId: alarm}}).then(() => {
            client.refetchQueries({include: ['GetDeviceAlarms']})

        })
    }
}