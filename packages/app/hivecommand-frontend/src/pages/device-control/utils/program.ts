import { gql, useApolloClient, useQuery } from "@apollo/client";

 export const useDevice = (id: string) => {
    const client = useApolloClient();
    const { data } = useQuery(gql`
        query BaseDeviceInfo ($id: ID){
     
            commandDevices(where: {id: $id}){
                name
                operatingMode
                operatingState

                alarms {
                    id
                    cause
                    message
                    createdAt
                }

                online
            

          
                reports {
                    id
                    name
                }

       
                activeProgram {
                    id
                    name

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

                        actions {
                            id
                            name
                            flow {
                                id
                                name
                            }
                        }

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
                                devicePlaceholder {
                                    id
                                    tag 
                                    units {
                                        inputUnit
                                        displayUnit
                                        state {
                                            id
                                            key
                                        }
                                    }

                                    type {
                                        actions {
                                            key
                                        }

                                        tagPrefix
    
                                        state {
                                            type
                                            units
                                            inputUnits
                                            key
                                            writable
                                        }
                                    }


                                    setpoints {
                                        id
                                        name
                                        key {
                                            id
                                            key
                                        }
                                        value
                                        type
                                    }
    
                                }
                            
                            children {
                                id
                                type 

                                rotation
                                x
                                y

                                devicePlaceholder {
                                    id
                                    tag
                                    units {
                                        inputUnit
                                        displayUnit
                                        state {
                                            id
                                            key
                                        }
                                    }

                                    type {
                                        actions {
                                            key
                                        }
                                        tagPrefix
                                        state {
                                            units
                                            inputUnits
                                            key
                                            writable
                                        }
                                    }


                                    setpoints {
                                        id
                                        name
                                        key {
                                            id
                                            key
                                        }
                                        value
                                        type
                                    }
    
                                }
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

                    variables {
                        id
                        name
                        type
                    }

                    devices {
                        id
                        tag
                        units {
                            inputUnit
                            displayUnit
                            state {
                                id
                                key
                            }
                        }
                        type {
                            tagPrefix

                            state {
                                id
                                inputUnits
                                units
                                key
                                type
                                id
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

    return {
        results: data?.commandDevices || [],
        refetch: () => {
            client.refetchQueries({include: ['BaseDeviceInfo']})
        }
    }

}