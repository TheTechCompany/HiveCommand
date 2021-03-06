import React, { useState } from 'react';
import { Add, Settings as Action, MoreVert } from '@mui/icons-material';
import { Box, List, Text, Button } from 'grommet';

import { ProgramDeviceModal } from '../../../../components/modals/program-device';

import { useQuery as useApollo , gql, useApolloClient} from '@apollo/client';
import { useNavigate, useParams } from 'react-router-dom';
import { useCreateProgramPlaceholder, useDeleteProgramPlaceholder, useUpdateProgramPlaceholder } from '@hive-command/api';
import { IconButton } from '@mui/material';
export const Devices = (props) => {

	const navigate = useNavigate()

	const { id } = useParams()

	const client = useApolloClient()
	const { data } = useApollo(gql`
		query Q($id: ID) {
			commandProgramDevices {
				id
				name
			}
			commandPrograms(where: {id: $id}){
				devices {
					id
					name

					requiresMutex
					type{
						id
						name
					}

					plugins {
						id
						plugin {
							name
						}

					}
				}

			}
		}
	`, {
		variables: {
			id: id
		}
	})

	const [ modalOpen, openModal ] = useState<boolean>(false);
	const [ selected, setSelected ] = useState<any>();

	const updateDevice = useUpdateProgramPlaceholder(id)
	const createDevice = useCreateProgramPlaceholder(id)
	const deleteDevice = useDeleteProgramPlaceholder(id)

	// const [ updateDevicePlaceholder, updateInfo ] = useMutation((mutation, args: {id: string, requiresMutex: boolean, name: string, type: string}) => {
	// 	const updated = mutation.updateCommandPrograms({
	// 		where: {id: id},
	// 		update: {
	// 			devices: [{
	// 				where: {node: {id: args.id}},
	// 				update: {
							
	// 					node: {
	// 						requiresMutex: args.requiresMutex,
	// 						name: args.name,
	// 						type: {connect: {where: {node: {id: args.type}}}}
	// 					}
	// 				}
	// 			}]
	// 		}
	// 	})
	// 	return {
	// 		item: {
	// 			...updated.commandPrograms[0]
	// 		}
	// 	}
	// })


	// const [ addDevicePlaceholder, addInfo ] = useMutation((mutation, args: {requiresMutex: boolean, name: string, type: string}) => {
	// 	const newdevice = mutation.updateCommandPrograms({
	// 		where: {id: id},
	// 		update: {
	// 			devices: [{
	// 				create: [{node: {
	// 					requiresMutex: args.requiresMutex,
	// 					name: args.name,
	// 					type: {connect: {where: {node: {id: args.type}}}}
	// 				}}]
	// 			}]
	// 		}
	// 	})
	// 	return {
	// 		item: {
	// 			...newdevice.commandPrograms[0]
	// 		}
	// 	}
	// })

	const refetch = () => {
		client.refetchQueries({include: ["Q"]})
	}

	const onEdit = (datum: any) => {
		setSelected(datum)
		openModal(true)
	}

	const deviceTypes = data?.commandProgramDevices || [];
	const devices = data?.commandPrograms?.[0].devices || []

	return (
		<Box flex>
			<ProgramDeviceModal
				selected={selected}
				deviceTypes={deviceTypes}
				onDelete={() => {
					deleteDevice(selected.id).then(() => {
						openModal(false)
						setSelected(undefined)
						refetch()
					})
				}}
				onClose={() => {
					openModal(false);
					setSelected(undefined)

				}}
				onSubmit={(device) => {
					if(device.id){
						updateDevice(
							device.id,
							device.name,
							device.type,
							device.requiresMutex,
						).then(() => {
							refetch();
							openModal(false)
							setSelected(undefined)
						})
					}else{
						createDevice(
							device.name,
							device.type,
							device.requiresMutex,
						).then(() => {
							openModal(false)
							refetch()
							setSelected(undefined)

						})
					}

				}}
				open={modalOpen}
				/>
			<Box 
				align="center"
				justify="between"
				direction="row">
				<Text size="small"></Text>
				<IconButton
					onClick={() => openModal(true)}>
					<Add  fontSize="small" />
				</IconButton>
				{/* <Button 
					onClick={() => openModal(true)}
					size="small"
					icon={} 
					hoverIndicator />  */}
			</Box>
			<Box 
				overflow="scroll"
				flex>
				<List
					pad="none"
					// onClickItem={({item}) => {
					// 	props.history.push(`${props.match.url}/${item.id}`)
					// }}
					primaryKey="name"
					data={devices}>
					{(datum) => (
						<Box direction="row" align='center'>
							<Box 
								pad="small" 
								flex
								onClick={() => {
									navigate(`${datum.id}`)
								}}
								hoverIndicator
								justify="between"
								align="center"
								direction="row">
								<Text size="small">{datum.name} - {datum.type?.name}</Text>
							{datum.plugins?.length > 0 && (
								<Button 
									disabled
									hoverIndicator
									plain 
									size="small"
									style={{padding: 3, borderRadius: 6}} icon={<Action />} /> )}
			
							</Box>

							<IconButton 
								onClick={() => onEdit(datum)}>
								<MoreVert fontSize='small' />
							</IconButton> 
								{/* onClick={() => onEdit(datum)}
								hoverIndicator 
								plain
								size="small" 
								style={{padding: 6, borderRadius: 3}} 
								icon={} /> */}
						</Box>
					)}
				</List>
			</Box>
		</Box>

	)
}