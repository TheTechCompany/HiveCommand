import { HMICanvas } from '../../../components/hmi-canvas';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Spinner } from 'grommet';
import { Check as Checkmark, ChevronLeft, SettingsEthernet } from '@mui/icons-material';
import { DeviceControlContext } from '../context';
import { getDevicesForNode } from '../utils';
import { Bubble } from '../../../components/Bubble/Bubble';
import { useRequestFlow, useUpdateDeviceSetpoint } from '@hive-command/api';
// import { FormControl } from '@hexhive/ui';
import { gql, useQuery } from '@apollo/client';
import { useApolloClient } from '@apollo/client';
import { IconButton, InputAdornment, Select, Box, Typography, TextField, Button, Paper, Divider, MenuItem, FormControl, InputLabel } from '@mui/material';
import { isEqual } from 'lodash'
const ActionButton = (props) => {
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


	const [infoTarget, setInfoTarget] = useState<{ x?: number, y?: number }>(undefined);
	const [selected, setSelected] = useState<{ key?: string, id?: string }>(undefined)

	const [workingState, setWorkingState] = useState<any>({})

	const [editSetpoint, setEditSetpoint] = useState();
	const [setpointWorkstate, setSetpointWorkstate] = useState({});

	const {
		changeOperationMode,
		changeOperationState,
		program,
		actions,
		hmi,
		groups,
		changeDeviceMode,
		changeDeviceValue,
		performAction,
		controlId,
		device,
		refetch
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


	const values: { placeholder: string, key: string, value: string }[] = deviceValueData?.commandDevices?.[0]?.deviceSnapshot || []

	const waitingForActions = values?.filter((a) => a.placeholder == 'PlantActions')?.map((action) => ({ [action.key]: action.value == 'true' })).reduce((prev, curr) => ({ ...prev, ...curr }), {})

	const getDeviceValue = (name?: string, units?: { key: string, units?: string }[]) => {
		//Find map between P&ID tag and bus-port

		if (!name) return;


		let v = values.filter((a) => a?.placeholder == name);
		let state = program?.devices?.find((a) => a.name == name).type?.state;


		return v.reduce((prev, curr) => {
			let unit = units?.find((a) => a.key == curr.key);
			let stateItem = state.find((a) => a.key == curr.key);
			let value = curr.value;

			if (!stateItem) return prev;

			if (stateItem?.type == "IntegerT" || stateItem?.type == "UIntegerT") {
				value = parseFloat(value).toFixed(2)
			}
			return {
				...prev,
				[curr.key]: value
			}
		}, {})

	}


	console.log({ hmi: hmi.concat(groups.map((x) => x.children).reduce((prev, curr) => prev.concat(curr), [])) })

	const hmiNodes = useMemo(() => {
		return hmi.concat(groups.map((x) => x.children).reduce((prev, curr) => prev.concat(curr), [])).filter((a) => a?.devicePlaceholder?.name).map((node) => {

			let device = node?.devicePlaceholder?.name;
			let value = getDeviceValue(device, node?.devicePlaceholder?.type?.state);
			let conf = device?.calibrations?.filter((a) => a.device?.id == node.devicePlaceholder.id)

			// console.log("CONF", conf)
			return {
				...node,
				values: value,
				conf
			}
		})
	}, [device, deviceValueData])


	const operatingMode = values?.find((a) => a.placeholder == "Plant" && a.key == "Mode")?.value.toLowerCase() || '';
	const operatingState = values?.find((a) => a.placeholder == "Plant" && a.key == "Running")?.value == 'true' ? "on" : "off";
	const operatingStatus = values?.find((a) => a.placeholder == "Plant" && a.key == "Status")?.value


	useEffect(() => {
		const timer = setInterval(() => {
			client.refetchQueries({ include: ['DeviceValues'] })
		}, 2 * 1000)

		return () => {
			clearInterval(timer)
		}
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


	const renderActionValue = (deviceName: string, deviceInfo: any, deviceMode: string, state: any) => {
		let value = getDeviceValue(deviceName, deviceInfo.state)?.[state.key];

		if (state.writable && operatingMode == "manual") {
			return (
				<TextField
					style={{ padding: "none" }}
					type="number"
					size="small"
					placeholder={state.key}
					onChange={(e) => {
						setWorkingState({
							...workingState,
							[deviceName]: {
								...workingState[deviceName],
								[state.key]: parseFloat(e.target.value)
							}
						})
					}}
					value={workingState?.[deviceName]?.[state.key] ?? parseFloat(value)} />
			)
		} else {
			return <Typography>{value}</Typography>
		}
	}


	const renderActions = () => {
		let node = hmi.concat(groups).find((a) => a.id == selected?.id)

		if (!node) return;

		let devices = getDevicesForNode(node)

		if (editSetpoint) {
			const device = devices.find((a) => a.name == editSetpoint)

			return (
				<Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
					<Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
						<IconButton
							onClick={() => setEditSetpoint(undefined)}
							size="small">
							<ChevronLeft fontSize='inherit' />
						</IconButton>

						<Typography >{editSetpoint} Setpoints</Typography>

					</Box>
					<Box sx={{ display: 'flex', flex: 1, flexDirection: 'column', padding: '3px' }}>
						{device.setpoints?.map((setpoint) => (

							<TextField
								fullWidth
								InputProps={{
									endAdornment: setpoint.type == "ratio" && <InputAdornment position="end">%</InputAdornment>
								}}
								size='small'
								label={setpoint.name}
								type="number"
								onChange={(e) => {
									setSetpointWorkstate({
										...setpointWorkstate,
										[setpoint.id]: {
											...setpointWorkstate?.[setpoint?.id],
											value: e.target.value
										}
									})
								}}
								value={setpointWorkstate?.[setpoint.id]?.value} />

						))}
					</Box>
					<Box sx={{ flexDirection: 'row', display: 'flex' }}>
						<Button
							fullWidth
							disabled={isEqual(setpointWorkstate, device?.setpoints?.reduce((prev, curr) => ({
								...prev,
								[curr.id]: {
									...curr
								}
							}), {}))}
							onClick={() => {
								setSetpointWorkstate(device?.setpoints?.reduce((prev, curr) => ({
									...prev,
									[curr.id]: {
										...curr
									}
								}), {}))
							}}>Reset</Button>
						<Button
							fullWidth
							onClick={() => {
								for (var k in setpointWorkstate) {
									updateSetpoint(k, setpointWorkstate[k].value).then(() => {
										refetch();
									})
								}
								// updateSetpoint()
							}}>Save</Button>
					</Box>
				</Box>
			)
		} else {

			return devices.map((device) => {
				let deviceInfo = device?.type || {};
				let deviceName = device?.name || '';

				console.log({ deviceInfo })
				let deviceMode = deviceModes.find((a) => a.name == deviceName)?.mode;

				return (
					<Box sx={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
						{/* <Box
						sx={{display: 'flex'}}
						> */}

						<Box sx={{ padding: '3px', display: 'flex', alignItems: 'center', justifyContent: device.setpoints?.length > 0 ? "space-between" : "flex-start", flexDirection: 'row' }}>
							<Typography>{device?.name}</Typography>

							{device.setpoints?.length > 0 && operatingMode != "auto" && <IconButton
								onClick={() => {
									setEditSetpoint(device?.name)
									setSetpointWorkstate(device?.setpoints?.reduce((prev, curr) => ({
										...prev,
										[curr.id]: {
											...curr
										}
									}), {}))
								}}
								size="small">
								<SettingsEthernet fontSize='inherit' />
							</IconButton>}

						</Box>

						<Divider />
						{/* <Typography >{deviceInfo?.name}</Typography> */}
						{/* </Box> */}
						<Box sx={{ flex: 1, padding: '3px', display: 'flex', justifyContent: 'center', flexDirection: 'column' }} >
							{deviceInfo?.state?.map((state) => (
								<Box sx={{ flexDirection: "row", display: 'flex', alignItems: "center" }}>
									<Box sx={{ flex: 1 }}><Typography >{state.key}</Typography></Box>
									<Box sx={{ flex: 1 }}>{renderActionValue(deviceName, deviceInfo, deviceMode, state)}</Box>
									{workingState?.[deviceName]?.[state.key] != undefined ? (
										<IconButton

											onClick={() => {
												sendChanges(deviceName, state.key, workingState?.[deviceName]?.[state.key])
											}}>
											<Checkmark />
										</IconButton>) : ''}
								</Box>
							))}
						</Box>

						<Box sx={{ display: 'flex', flexDirection: 'row' }}>
							{operatingMode == 'manual' && deviceInfo?.actions?.map((action) => (
								<Button
									fullWidth
									onClick={() => {
										performAction(
											deviceName,
											action.key
										)
									}}>{action.key}</Button>
							))}
						</Box>

					</Box>
				)
			})
		}

	}


	const deviceModes = program?.devices?.map((a) => {
		let vals = values.filter((b) => b?.placeholder == a.name);
		// if(!vals.find((a) => a.valueKey == "mode")) console.log(a.name)
		return { name: a.name, mode: vals.find((a) => a.key == 'mode')?.value };
	}) || [];


	const sendChanges = (deviceName: string, stateKey: string, stateValue: any) => {
		changeDeviceValue(
			deviceName,
			stateKey,
			`${stateValue}`
		).then(() => {
			let ws = Object.assign({}, workingState);
			delete ws[stateKey]
			setWorkingState(ws)
		})
	}

	useEffect(() => {
		setWorkingState({})
	}, [selected])

	const controlAction = (action) => {
		requestFlow(
			action.id
		).then(() => {

		})
	}

	console.log({ hmiNodes, operatingMode, operatingModes })

	return (
		<Box sx={{ flex: 1, display: 'flex', flexDirection: "row", position: 'relative' }}>
			<Box sx={{ flex: 1, display: 'flex' }}>
				<HMICanvas
					id={program.id}
					program={program}
					deviceValues={hmiNodes}
					modes={deviceModes}
					information={infoTarget != undefined ? (
						<Bubble
							style={{ position: 'absolute', zIndex: 99, pointerEvents: 'all', left: infoTarget?.x, top: infoTarget?.y }}>
							{renderActions()}
						</Bubble>
					) : null}
					onBackdropClick={() => {
						setSelected(undefined)
						setInfoTarget(undefined)
					}}
					onSelect={(select) => {
						console.log({ hmi: program.interface });
						let node = program.interface?.nodes?.find((a) => a.id == select.id)
						const { x, y, scaleX, scaleY } = node;

						let width, height;
						if (node.children && node.children.length > 0) {
							let widths = node.children?.map((x) => x.x + ((x.type?.width * x.scaleX) || 50));
							let xs = node.children?.map((x) => x.x);
							let heights = node.children?.map((x) => x.y + ((x.type?.height * x.scaleY) || 50));
							let ys = node.children?.map((x) => x.y);

							width = Math.max(...widths) - Math.min(...xs)
							height = 25// Math.min(...ys) - Math.max(...heights)
							console.log({ width, height, widths, heights, children: node.children })
						} else {
							width = node.type.width * scaleX;
							height = 25 //node.type.height * scaleY;
						}

						setInfoTarget({ x: x + (width), y: y + height })
						setEditSetpoint(undefined)
						setSelected(select)
					}}
				/>
			</Box>
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
										changeOperationMode(event.target.value);
									}}>
									{operatingModes.map((mode) => (
										<MenuItem value={mode.key}>{mode.label}</MenuItem>
									))}

								</Select>
							</FormControl>

							{/* <FormControl
								value={operatingMode}
								valueKey='key'
								onChange={(value) => {
									changeOperationMode(value)
									// console.log(value)
									// setOperating(value)
								}}
								placeholder='Mode'
								labelKey='label'
								options={operatingModes} /> */}
						</Box>
						<ActionButton
							size={'small'}
							color={'secondary'}
							disabled={operatingMode != 'auto' || (operatingStatus == "STARTING" || operatingStatus == "STOPPING")}
							onClick={() => {
								changeOperationState((!operatingState || operatingState == 'off') ? 'on' : 'off')
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
							{actions.map((action) => (
								<ActionButton
									waiting={waitingForActions[action.id]}
									onClick={() => controlAction(action)}
									label={action.name} />
							))}
						</Box>
					</Box>}
				</Box>
			</Paper>
		</Box>
	)
}