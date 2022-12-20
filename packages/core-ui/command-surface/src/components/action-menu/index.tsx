import React, { useContext, useMemo, useState } from 'react'

import { Box, TextField, Button, Divider, Typography, IconButton, InputAdornment } from '@mui/material'
import { SettingsEthernet, ChevronLeft, Check as Checkmark } from '@mui/icons-material';
import { DeviceControlContext } from '../../context';
import { getDevicesForNode } from '../../utils';
import { useUpdateDeviceSetpoint } from '@hive-command/api';
import { isEqual } from 'lodash'
import { InfiniteCanvasContext } from '@hexhive/ui';

// const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor
export const getDeviceFunction = (func_desc: string) => {
	// const func = vm.runInNewContext(
	  	const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor
		return new AsyncFunction(
				  'state',
				  'setState',
				  'requestState',
				  func_desc
			  )
	// return func;
};

  
export interface ActionMenuProps {
    values?: {
		[key: string]: {
			[key: string]: any;
		}
	}
    refetch?: () => void;
    selected?: any;
}

export const ActionMenu : React.FC<ActionMenuProps> = (props) => {

    const [workingState, setWorkingState] = useState<any>({})

    const { values } = props;

    const { program, client, changeDeviceValue, defaultPage, activePage, hmis } = useContext(DeviceControlContext);

    const { selected } = useContext(InfiniteCanvasContext)
	const [editSetpoint, setEditSetpoint] = useState<string>();
	const [setpointWorkstate, setSetpointWorkstate] = useState({});

	//TODO
	// const updateSetpoint = useUpdateDeviceSetpoint(controlId || '');

	const operatingMode = values?.["Plant"]?.["Mode"]?.value?.toLowerCase() || '';

    const hmi = useMemo(() => {
		return hmis?.find((a: any) => activePage ? a.id == activePage : a.id == defaultPage) || {}
	}, [ hmis, defaultPage, activePage ])

    // const getDeviceValue = (name?: string, units?: { key: string, units?: string }[]) => {
	// 	//Find map between P&ID tag and bus-port

	// 	if (!name) return;

	// 	console.log("DeviceValue getter", {name, values})

	// 	let v = values?.filter((a) => a?.placeholder == name);
	// 	let state = program?.devices?.find((a) => `${a?.type?.tagPrefix || ''}${a.tag}` == name)?.type?.state;

	// 	return v?.reduce((prev, curr) => {
	// 		let unit = units?.find((a) => a.key == curr.key);
	// 		let stateItem = state?.find((a: any) => a.key == curr.key);
	// 		let value = curr.value;

	// 		if (!stateItem) return prev;

	// 		if (stateItem?.type == "IntegerT" || stateItem?.type == "UIntegerT") {
	// 			value = parseFloat(value).toFixed(2)
	// 		}
	// 		return {
	// 			...prev,
	// 			[curr.key]: value
	// 		}
	// 	}, {})

	// }

    const sendChanges = (deviceName: string, stateKey: string, stateValue: any) => {
		console.log({deviceName, stateKey, stateValue});

		client?.changeDeviceValue?.(deviceName, stateKey, stateValue);

		// sendAction?.('UPDATE-DEVICE-STATE', { deviceName, stateKey: stateKey, value: stateValue})
		
		// let ws = Object.assign({}, workingState);
		// delete ws[stateKey]
		// setWorkingState(ws)

		
	}

	const renderActionValue = (deviceName: string, deviceInfo: any, deviceMode: string, state: any) => {
		let deviceValueBlob = values?.[deviceName] //getDeviceValue(deviceName, deviceInfo.state)
        let value = deviceValueBlob?.[state.key];

		console.log({deviceValueBlob, value, state, deviceName});
		
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
			return <Typography>{`${value}`}</Typography>
		}
	}


	const renderActions = () => {
		let node = hmi?.nodes?.find((a) => (selected || []).map((x) => x.id).indexOf(a.id) > -1)

		if (!node) return null;

		let devices = getDevicesForNode(node)

		if (editSetpoint) {
			const device = devices.find((a) => a.tag == editSetpoint)

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
						{device?.setpoints?.map((setpoint) => (

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
								setSetpointWorkstate((device?.setpoints || []).reduce((prev, curr) => ({
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
									// updateSetpoint(k, setpointWorkstate[k].value).then(() => {
									// 	props.refetch?.();
									// })
								}
								// updateSetpoint()
							}}>Save</Button>
					</Box>
				</Box>
			)
		} else {

			return devices.map((device) => {
				let deviceInfo = device?.type || {};
				let deviceName = device?.tag || '';

				let deviceMode = deviceModes.find((a) => a.name == deviceName)?.mode;

				return (
					<Box sx={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
						{/* <Box
						sx={{display: 'flex'}}
						> */}

						<Box sx={{ padding: '3px', display: 'flex', alignItems: 'center', justifyContent: (device.setpoints || []).length > 0 ? "space-between" : "flex-start", flexDirection: 'row' }}>
							<Typography>{device?.tag}</Typography>

							{(device.setpoints || []).length > 0 && operatingMode != "auto" && <IconButton
								onClick={() => {
									setEditSetpoint(device?.tag)
									setSetpointWorkstate((device?.setpoints || []).reduce((prev, curr) => ({
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
							{device?.type?.state?.map((state: any) => (
								<Box sx={{ flexDirection: "row", display: 'flex', alignItems: "center" }}>
									<Box sx={{ flex: 1 }}><Typography >{state.key}</Typography></Box>
									<Box sx={{ flex: 1 }}>{renderActionValue(deviceName, deviceInfo, deviceMode || '', state)}</Box>
									{workingState?.[deviceName]?.[state.key] != undefined ? (
										<IconButton
											onClick={() => {
												sendChanges?.(deviceName, state.key, workingState?.[deviceName]?.[state.key])
											}}>
											<Checkmark />
										</IconButton>) : ''}
								</Box>
							))}
						</Box>

						<Box sx={{ display: 'flex', flexDirection: 'row' }}>
							{/*operatingMode == 'manual' && */ device?.type?.actions?.map((action) => (
								<Button
									fullWidth
									onClick={() => {

										if(!action.func) return;
						
										const f = getDeviceFunction(action.func)

										// const func = f
										// 	`		
													
										// 		`,
										// 	{
										// 	  func: action.func,
										// 	  setTimeout,
										// 	}
										//   );
										// return func;

										// console.log(action.func)
										// const f = new Function('setState', 'requestState', `function action(setState, requestState){ ${action.func} } `);

										f({},
											async (state) => {
												await Promise.all(Object.keys(state).map((key) => {
													sendChanges?.(deviceName, key, state[key]);
												}))
												// console.log({state})
											 }, 
											 (state) => console.log({state})
										);

										// console.log({action: action.func})
										// sendAction?.('PERFORM-DEVICE-ACTION', {deviceName, actionKey: action.key});

										// performAction(
										// 	deviceName,
										// 	action.key
										// )
									}}>{action.key}</Button>
							))}
						</Box>

					</Box>
				)
			})
		}

	}


	const deviceModes = program?.devices?.filter((a) => a.tag).map((a) => {
		if(!a.tag) return {name: a.tag, mode: "manual"}
		let mode = values?.[a.tag]?.["mode"];

		// values?.filter((b) => b?.placeholder == a.tag) || [];
		// if(!vals.find((a) => a.valueKey == "mode")) console.log(a.name)
		return { name: a.tag, mode };
	}) || [];

    
    return (
        <>
            {renderActions()}
        </>
    )
}