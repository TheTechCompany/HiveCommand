import React, { useEffect, useState } from 'react';
import { DeviceModal } from '../../components/modals/device';
import { useCreateDevice, useUpdateDevice } from '@hive-command/api'
import { DeploymentList } from '../../components/deployment-list';
import { Box, TextField, Button, IconButton, Paper } from '@mui/material';
import { isEqual } from 'lodash';
import { nanoid } from 'nanoid';
import { Add } from '@mui/icons-material'
import { useQuery as useApollo, gql, useApolloClient } from '@apollo/client'
import { useNavigate } from 'react-router-dom';
export interface DevicePageProps {
    match?: any;
    history?: any;
}

export const Devices : React.FC<DevicePageProps> = (props) => {
    
    const navigate = useNavigate();

    const [ modalOpen, openModal ] = useState<boolean>(false);

    const [ selectedDevice, setSelectedDevice ] = useState<any>();
    const [ editDevice, setEditDevice ] = useState<any>();

    // const [ _devices, setDevices ] = useState<CommandDevice[]>([])

    // const query = useQuery({
    //     staleWhileRevalidate: true,
    //     suspense: false
    // })

    const { data, error } = useApollo(gql`
        query DeviceList {
            commandDevices { 
                id
                name

                online
                lastSeen

                network_name

                activeProgram{ 
                    id
                    name
                }

                createdAt
            }

      
        }
    ` )

    const { data: programData } = useApollo(gql`
    query ProgramList {
        commandPrograms {
            id
            name
        }
    }
    `)
    const client = useApolloClient()

    const refetch = () => {
        client.refetchQueries({include: ['DeviceList']})
    }

    const devices = (data?.commandDevices || [])?.slice()?.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const programs = programData?.commandPrograms || []

    const createDevice = useCreateDevice()
    const updateDevice = useUpdateDevice()

    // useEffect(() => {
    //     if(devices){
    //         setDevices(devices)
    //     }
    // }, [devices])



//     const [ createDevice, {isLoading}] = useMutation((mutation, args: {
//         name: string, 
//         network_name: string, 
//         program?: string
//     }) => {
//         let program = {};
//         if(args.program){
//             program = {
//                 activeProgram: {connect: {where: {node: {id: args.program}}}}
//             }
//         }
//         const result = mutation.createCommandDevices({input: [{
//             name: args.name,
//             network_name: args.network_name,
//             ...program,
            
//         }]})

//         return {
//             item: {
//                 ...result?.commandDevices[0]
//             },
//             error: null
//         }
//     }, {
//         onCompleted(data) {},
//         onError(error) {},
//         refetchQueries: [],
//         awaitRefetchQueries: true,
//         suspense: false, 
// })
//     const [ updateDevice, info ] =  useMutation((mutation, args: { 
//         id: string, 
//         name: string, 
//         network_name: string, 
//         program?: string
//     }) => {
//         let programUpdate = {};
//         if(args.program){
//             programUpdate = {
//                 activeProgram: {connect: {where: {node: {id: args.program}}}}
//             }
//         }
//         const result = mutation.updateCommandDevices({
//             where: {id: args.id},
//             update: {
//                 name: args.name,
//                 network_name: args.network_name,
//                 ...programUpdate
//             }
//             // program: args.program
//         })

//         return {
//             item: {
//                 ...result?.commandDevices[0]
//             },
//             error: null
//         }
//     })



    const onSubmit = (device: any) => {
        console.log("Submit", device)
        if(device.id){
            updateDevice(device.id, device.name, device.network_name || nanoid().substring(0, 8), device.activeProgram?.id).then((updated) => {
                console.log("Update result", updated)
                refetch()
                
                setEditDevice(null)
                openModal(false)
            })
        }else{
            createDevice(device.name || '', device.network_name || nanoid().substring(0, 8), device.activeProgram?.id).then((new_device) => {
                refetch()

                setEditDevice(null)
                openModal(false)
                // if(new_device.item){
                //     let d: any[] = devices.slice()
                //     d.push(new_device.item)
                //     // setDevices(d)
                //     return true;
                // }
            })
        }
    }

    const goToSingle = (id: string) => {
        props.history.push(`${props.match.url}/${id}`)
    }

    return (
        <Paper sx={{flex: 1, display: 'flex', flexDirection: 'column'}}>
            <DeviceModal 
                selected={editDevice}
                programs={programs}
                open={modalOpen}
                onSubmit={onSubmit}
                onClose={() => {
                    setEditDevice(null)
                    openModal(false)
                }} />
          
            <Box
                
                sx={{ flex: 1, flexDirection: 'row', display: 'flex'}}
                >
            <DeploymentList
                error={error?.message}
                devices={devices}
                programs={programs}
                selected={[selectedDevice?.id]}
                
                onCreate={() => openModal(true)}
           
                onClickRow={({datum}) => {
                    console.log(datum)
                   
                    navigate(`/deployments/${datum.id}`)
                    // if(isEqual(selectedDevice, datum)){
                    //     setSelectedDevice(undefined)
                    // }else{
                    //     setSelectedDevice(datum)
                    // }
                }}
                onEditRow={(datum) => {
                    setEditDevice(datum)
                    openModal(true)
                    console.log("Edit", datum)
                }}
                 />
        
            </Box>
            
        </Paper>
    )
}