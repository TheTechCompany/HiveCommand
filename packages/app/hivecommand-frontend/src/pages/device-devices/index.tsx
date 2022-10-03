import React, {useState} from 'react';
import { useQuery, gql } from '@apollo/client';
import { Box, List, ListItem, Typography } from '@mui/material'
import { useUpdateDeviceCalibrations  } from '@hive-command/api';
import { ProgramDeviceModal } from '../../components/modals/program-device';
import { useParams } from 'react-router-dom';

export const DeviceDevices : React.FC<any> = (props) => {
	
	const { id } = useParams()

	const [ modalOpen, openModal ] = useState<boolean>(false);

	const [ selected, setSelected ] = useState<any>()

	const { data } = useQuery(gql`
		query Q ($id: ID){
			commandProgramDevices{
				id
				name
			}
			commandDevices(where: {id: $id}){
				name
				calibrations {
					id
					placeholder {
						id
						name
					}

					stateItem {
						id
						type
						key
					} 

					min
					max
				}
				activeProgram {
					devices {
						id
						name

						type {
							id
							name

							state {
								id
								type
								key
								min
								max
							}
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

	const updateDeviceCalibration = useUpdateDeviceCalibrations(id);

	// const [ updateDeviceConfiguration, updateInfo ] = useMutation((mutation, args: {
	// 	conf: {
	// 		id?: string;
	// 		device: string,
	// 		deviceKey: string,
	// 		min: string
	// 		max: string
	// 	}[]
	// }) => {
	// 	const peripheralUpdate = mutation.updateCommandDevices({
	// 		where: {id: props.match.params.id},
	// 		update: {
	// 			calibrations: [
	// 				...args.conf.filter((a) => a.id).map((x) => ({
	// 					where: {node: {id: x.id}},
	// 					update: {
	// 						node: {
	// 							min: x.min,
	// 							max: x.max
	// 						}
	// 					}
	// 				})),
	// 				{
	// 					create: args.conf.filter((a) => !a.id).map((x) => ({
	// 						node: {
	// 							device: {connect: {where: {node: {id: x.device}}}},
	// 							deviceKey: {connect: {where: {node: {key: x.deviceKey, device: {usedIn: {id_IN: [x.device]}}}}}},
	// 							min: x.min,
	// 							max: x.max
	// 						}
	// 					}))
	// 				}
	// 			]
	// 		}
	// 	})
	// 	return {
	// 		item: {
	// 			...peripheralUpdate.commandDevices?.[0]
	// 		}
	// 	}
	// })

	const device = data?.commandDevices?.[0];


	return (
		<Box sx={{flex: 1, display: 'flex', flexDirection: 'column'}}>
			<ProgramDeviceModal
				open={modalOpen}
				onClose={() => {
					openModal(false);
				}}
				onSubmit={(device) => {
					console.log("DEVICE", device)
					if(device.calibrated){
						console.log("CALIBRATED", device.calibrated);
						let calibrated = device.calibrated?.[0];
						let calibration = {
							id: calibrated.id,
							placeholder: device.id,
							stateItem: calibrated.key,
							min: calibrated.min,
							max: calibrated.max
						}

						updateDeviceCalibration(calibration).then(() => {
							openModal(false)
						});

					}
					// if(device.configuration){
					// 	updateDeviceConfiguration({
					// 		args:{ 
					// 			conf: device.configuration.map((x) => ({
					// 				id: x.id,
					// 				device: device.id,
					// 				conf: x.confKey,
					// 				value: x.value
					// 			}))
					// 		}
					// 	})
					// }
				}}
				selected={selected}
				configuration={[]}
				deviceTypes={data?.commandProgramDevices}
				/>
			<Box sx={{flex: 1, display: "flex"}}>
				<List sx={{flex: 1}}>
					{(device?.activeProgram?.devices || []).map((item) => (
						<ListItem button onClick={() => {
							let calibration = device.calibrations?.filter((a) => a.placeholder?.id == item.id);
					
							openModal(true)
							setSelected({...item, calibrated: calibration})
						}}>
							<Typography>{item.name} - {item?.type?.name}</Typography>
						</ListItem>
					))}
				</List>
					{/* pad="none" 
					onClickItem={({item}) => {
						console.log({calibrations: device.calibrations, item})
						let calibration = device.calibrations?.filter((a) => a.placeholder?.id == item.id);

					
						openModal(true)
						setSelected({...item, calibrated: calibration})
					}}
					data={device?.activeProgram?.devices || []} >
					{(datum) => (
						<Box
							sx={{alignItems: 'center', justifyContent: 'space-between', padding: '6px', flexDirection: 'row'}}>
							<Text size="medium">{datum.name}</Text>

							<Text size="small">{datum?.type?.name}</Text>
						</Box>
					)}
				</List> */}
			</Box>
		</Box>
	)
}