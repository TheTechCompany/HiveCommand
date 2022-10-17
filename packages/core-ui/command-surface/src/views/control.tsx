import { HMICanvas } from '../components/hmi-canvas';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Spinner } from 'grommet';
import { Check as Checkmark, ChevronLeft, SettingsEthernet } from '@mui/icons-material';
import { DeviceControlContext } from '../context';
import { getDevicesForNode } from '../utils';
import { Bubble } from '../components/Bubble/Bubble';
import { useRequestFlow, useUpdateDeviceSetpoint } from '@hive-command/api';
// import { FormControl } from '@hexhive/ui';
import { gql, useQuery } from '@apollo/client';
import { useApolloClient } from '@apollo/client';
import { IconButton, InputAdornment, Select, Box, Typography, TextField, Button, Paper, Divider, MenuItem, FormControl, InputLabel } from '@mui/material';
import { InfiniteScrubber } from '@hexhive/ui';
import { ActionMenu } from '../components/action-menu';


const ActionButton = (props: any) => {
	return (
		<Box sx={{ display: 'flex' }}>
			<Button
				fullWidth
				color={props.color}
				size={props.size}
				variant="contained"
				disabled={props.waiting || props.disabled}

				onClick={props.onClick}
			>
				<Box sx={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'between' }}>
					<Typography>{props.label}</Typography>
					{props.waiting && <Spinner size="xsmall" />}
				</Box>
			</Button>

		</Box>
	)
}
export default () => {

	const operatingModes = [
		{
			label: 'Disabled',
			key: 'disabled'
		},
		{
			label: 'Auto',
			key: 'auto'
		},
		{
			label: 'Manual',
			key: 'manual'
		}
	]


	const [infoTarget, setInfoTarget] = useState<{ x?: number, y?: number }>();
	const [selected, setSelected] = useState<{ key?: string, id?: string }>()


	const {
		changeOperationMode,
		changeOperationState,
		historize,
		functions,
		program,
		actions,
		hmis,
		activePage,
		defaultPage,
		groups,
		changeDeviceMode,
		performAction,
		templatePacks,
		controlId = '',
		device,
	} = useContext(DeviceControlContext)


	const requestFlow = useRequestFlow(controlId)
	const updateSetpoint = useUpdateDeviceSetpoint(controlId);

	const client = useApolloClient()

	const { data: deviceValueData } = useQuery(gql`
		query DeviceValues($id: ID) {
		
			commandDevices (where: {id: $id}){
				deviceSnapshot {
					placeholder
					key
					value
				}
				waitingForActions {
					id
				}
			}
		}
    `, {
		variables: {
			id: controlId,
			idStr: controlId
		}
	})

	const refetch = () => {
		client.refetchQueries({include: ['DeviceValues']})
	}


	const values: { placeholder: string, key: string, value: string }[] = deviceValueData?.commandDevices?.[0]?.deviceSnapshot || []

	const waitingForActions = values?.filter((a) => a.placeholder == 'PlantActions')?.map((action) => ({ [action.key]: action.value == 'true' })).reduce((prev, curr) => ({ ...prev, ...curr }), {})

	

	const hmi = useMemo(() => {
		return hmis?.find((a: any) => activePage ? a.id == activePage : a.id == defaultPage)
	}, [ hmis, defaultPage, activePage ])

	// const hmiNodes = useMemo(() => {
	// 	return hmi.concat(groups.map((x) => x.children).reduce((prev, curr) => prev.concat(curr), [])).filter((a) => a?.devicePlaceholder?.name).map((node) => {

	// 		let device = node?.devicePlaceholder?.name;
	// 		let value = getDeviceValue(device, node?.devicePlaceholder?.type?.state);
	// 		let conf = device?.calibrations?.filter((a) => a.device?.id == node.devicePlaceholder.id)

	// 		// console.log("CONF", conf)
	// 		return {
	// 			...node,
	// 			values: value,
	// 			conf
	// 		}
	// 	})
	// }, [device, deviceValueData])


	const operatingMode = values?.find((a) => a.placeholder == "Plant" && a.key == "Mode")?.value.toLowerCase() || '';
	const operatingState = values?.find((a) => a.placeholder == "Plant" && a.key == "Running")?.value == 'true' ? "on" : "off";
	const operatingStatus = values?.find((a) => a.placeholder == "Plant" && a.key == "Status")?.value


	useEffect(() => {
		// const timer = setInterval(() => {
		// 	client.refetchQueries({ include: ['DeviceValues'] })
		// }, 2 * 1000)

		// return () => {
		// 	clearInterval(timer)
		// }
	}, [])

	// const [ requestFlow, requestFlowInfo ] = useMutation((mutation, args: {
	// 	deviceId: string,
	// 	actionId: string
	// }) => {
	// 	const item = mutation.requestFlow({
	// 		deviceId: args.deviceId,
	// 		actionId: args.actionId
	// 	})

	// 	return {
	// 		item: {
	// 			success: item.success
	// 		}
	// 	}
	// })

	// alert(operatingMode)



	

	// useEffect(() => {
	// 	setWorkingState({})
	// }, [selected])

	// const controlAction = (action) => {
	// 	requestFlow(
	// 		action.id
	// 	).then(() => {

	// 	})
	// }

	const [ time, setTime ] = useState(new Date().getTime());

	// console.log({ hmiNodes, operatingMode, operatingModes })


	return (
		<Box sx={{ flex: 1, display: 'flex', flexDirection: "row", position: 'relative' }}>
			<Box sx={{ flex: 1, display: 'flex' }}>

				<HMICanvas
					id={program?.id || ''}
					nodes={hmi?.nodes || []}
					templatePacks={templatePacks}
					paths={hmi?.edges || []}
					functions={functions}
					// program={program}
					// deviceValues={hmiNodes}
					modes={[]}
					information={infoTarget != undefined ? (
						<Bubble
							style={{ position: 'absolute', zIndex: 99, pointerEvents: 'all', left: infoTarget?.x, top: infoTarget?.y }}>
							<ActionMenu selected={selected} refetch={refetch} values={values} />
						</Bubble>
					) : null}
					onBackdropClick={() => {
						console.log("Backdrop click");

						// setSelected(undefined)
						setInfoTarget(undefined)
					}}
					onSelect={(select) => {
						let node = hmi?.nodes?.find((a: any) => a.id == select.id)
						const { x, y, width, height } = node || {x: 0, y: 0, width: 0, height: 0};

						console.log({ hmi: hmi, node });

						// // let width, height;
						// // if (node.children && node.children.length > 0) {
						// // 	let widths = node.children?.map((x) => x.x + ((x.type?.width * x.scaleX) || 50));
						// // 	let xs = node.children?.map((x) => x.x);
						// // 	let heights = node.children?.map((x) => x.y + ((x.type?.height * x.scaleY) || 50));
						// // 	let ys = node.children?.map((x) => x.y);

						// // 	width = Math.max(...widths) - Math.min(...xs)
						// // 	height = 25// Math.min(...ys) - Math.max(...heights)
						// // 	console.log({ width, height, widths, heights, children: node.children })
						// // } else {
						// // 	width = node.type.width * scaleX;
						// // 	height = 25 //node.type.height * scaleY;
						// // }

						setInfoTarget({ x: (x || 0) + (width||0), y: (y||0) + (height||0) })
						// setEditSetpoint(undefined)
						// setSelected(select)
					}}
				/>
			</Box>

			{historize && <Paper sx={{display: 'flex', flexDirection: 'column', bottom: 6, right: 6, left: 6, position: 'absolute', overflow: 'hidden'}}>
				<InfiniteScrubber 
					controls
					onTimeChange={(time) => {
						setTime(time)
					}}
					time={time} />
			</Paper>}

			<Paper
				sx={{ position: 'absolute', display: 'flex', flexDirection: 'column', width: '200px', right: 6, top: 6, padding: '6px' }}>
				<Box sx={{ display: 'flex', justifyContent: 'center' }}>
					<Typography fontWeight={'bold'}>Controls</Typography>
				</Box>
				<Divider />
				<Box sx={{ display: 'flex', flex: 1, flexDirection: 'column'}}>
					<Box sx={{ display: 'flex', flex: 1, flexDirection: 'column' }}>

						<Box sx={{ marginTop: '6px', display: 'flex', marginBottom: '6px' }}>
							<FormControl size="small" fullWidth>
								<InputLabel id="mode-label">Mode</InputLabel>
								<Select
									label="Mode"
									fullWidth
									labelId='mode-label'
									value={operatingMode}
									onChange={(event) => {
										changeOperationMode?.(event.target.value);
									}}>
									{operatingModes.map((mode) => (
										<MenuItem value={mode.key}>{mode.label}</MenuItem>
									))}

								</Select>
							</FormControl>

							
						</Box>
						<ActionButton
							size={'small'}
							color={'secondary'}
							disabled={operatingMode != 'auto' || (operatingStatus == "STARTING" || operatingStatus == "STOPPING")}
							onClick={() => {
								// changeOperationState((!operatingState || operatingState == 'off') ? 'on' : 'off')
							}}
							label={
								(operatingStatus == "ON" || operatingStatus == "STOPPING") ?
									(<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>{operatingStatus == "STOPPING" && <Spinner />}Shutdown</div>) :
									(<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>{operatingStatus == "STARTING" && <Spinner />}Start</div>)
							} />
					</Box>

					{operatingMode == "manual" && <Box border={{ side: 'bottom', size: 'small' }}>
						<Typography>Commands</Typography>
						<Box gap="xsmall">
							{actions?.map((action) => (
								<ActionButton
									waiting={waitingForActions[action.id]}
									// onClick={() => controlAction(action)}
									label={action.name} />
							))}
						</Box>
					</Box>}
				</Box>
			</Paper>
		</Box>
	)
}