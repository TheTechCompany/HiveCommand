import { gql, useSubscription } from "@apollo/client"

export const useWatchers = (id: string) => {
    const {data: subscriptionData} = useSubscription(gql`
        subscription($id: ID!) {
            watchingDevice(device: $id) {
                id
                name
            }
        }
    `, {
        variables: {
            id
        },
        onSubscriptionData: (data) => {
            // console.log("Received data", {data})
        }
    })
    return subscriptionData?.watchingDevice || [];
}