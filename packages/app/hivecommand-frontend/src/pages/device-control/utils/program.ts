import { gql, useApolloClient, useQuery } from "@apollo/client";
import { useEffect } from "react";

 export const useDevice = (id: string) => {

    const client = useApolloClient();

    const refetch = () => {
        client.refetchQueries({include: ['BaseDeviceInfo']})
    }

    const { data } = useQuery(gql`
        query BaseDeviceInfo ($id: ID){
     
            commandDevices(where: {id: $id}){
                name
                operatingMode
                operatingState

                online
            

          
                reports {
                    id
                    name
                }

       
                activeProgram {
                    id
                    name

                    components {
                        id
                        name
                        main {
                            id
                            path
                        }
                        files {
                            id
                            path
                            content
                        }
                    }

                    types {
                        id
                        name
                        fields {
                            id
                            name
                            type
                        }
                    }

                    tags {
                        id
                        name
                        type
                    }
                    
                    templatePacks {
                        id
                        url
                        name
                    }
                    
                    remoteHomepage {
                        id
                    }

                    interface{
                        id
                        name

                  
                        edges {
                            from {
                                id
                            }
                            fromHandle
                            fromPoint
                            to {
                               id
                            }
                            toHandle
                            toPoint
                            points {
                                x
                                y
                            }

                        }
                        
                        nodes{
       
                                id
                                type

                                options
                                
                                x
                                y
                                
                                zIndex

                                width
                                height

                                scaleX
                                scaleY

                                rotation

                                dataTransformer {
                                    id
        
                                    template {
                                        id
                                        
                                        inputs {
                                            id
                                            name
                                            type
                                        }

                                        outputs {
                                            id
                                            name
                                        }

                                        edges {
                                            from {
                                                id
                                            }
                                            to {
                                                id
                                            }
                                            script
                                        }
                                    }

                                    options
        
                                    configuration {
                                        id
                                        field {
                                            id
                                        }
                                        value
                                    }
        
                                }
                                
                            
                            children {
                                id
                                type 

                                rotation
                                x
                                y

                               
                            }

                            ports {
                                id
                                x
                                y
                                length
                                rotation
                            }
                            
                        }
                            
                    }

                  
                  
                }

            }
        }
    `, {
        variables: {
            id: id,
        }
    })

    useEffect(() => {
        const interval = setInterval(() => {
            refetch();
        }, 30 * 1000)

        return () => {
            clearInterval(interval)
        }
    }, [])

    return {
        results: data?.commandDevices || [],
        refetch
    }

}


export const useConnectivity = (deviceId: string) => {

    const client = useApolloClient();

    const refetch = () => {
        client.refetchQueries({include: ['DeviceConnectivity']})
    }

    const { data } = useQuery(gql`
		query DeviceConnectivity($id: ID) {
		
			commandDevices (where: {id: $id}){
                online
                lastSeen
			}
		}
    `, {
		variables: {
			id: deviceId,
		},
        fetchPolicy: 'no-cache'
	})

	useEffect(() => {
        const interval = setInterval(() => {
            refetch();
        }, 10 * 1000)

        return () => {
            clearInterval(interval)
        }
    }, [])

    return {
        online: data?.commandDevices?.[0]?.online,
        lastSeen: data?.commandDevices?.[0]?.lastSeen
    }
}