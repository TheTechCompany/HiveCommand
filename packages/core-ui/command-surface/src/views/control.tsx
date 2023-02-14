import { HMICanvas } from '../components/hmi-canvas';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { CircularProgress } from '@mui/material';
import { Check as Checkmark, ChevronLeft, SettingsEthernet } from '@mui/icons-material';
import { DeviceControlContext } from '../context';
import { getDevicesForNode } from '../utils';
import { Bubble } from '../components/Bubble/Bubble';
// import { FormControl } from '@hexhive/ui';
// import { gql, useQuery } from '@apollo/client';
// import { useApolloClient } from '@apollo/client';
import { IconButton, InputAdornment, Select, Box, Typography, TextField, Button, Paper, Divider, MenuItem, FormControl, InputLabel } from '@mui/material';
import { InfiniteScrubber } from '@hexhive/ui';
import { ActionMenu } from '../components/action-menu';
import moment from 'moment';

import { DataTypes, parseValue } from '@hive-command/scripting'


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
					{props.waiting && <CircularProgress size="xsmall" />}
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


	// const [infoTarget, setInfoTarget] = useState<{ x?: number, y?: number, dataFunction: () => any }>();

	const [selected, setSelected] = useState<{ key?: string, id?: string }>()


	const {
		changeOperationMode,
		changeOperationState,
		historize,
		functions,
		program,
		hmis,
		activePage,
		defaultPage,
		templatePacks,

		infoTarget,
		setInfoTarget,
		// seekValue,

		values = {},
		// controlId = '',
		// device,
	} = useContext(DeviceControlContext)


	// const requestFlow = useRequestFlow(controlId)
	// const updateSetpoint = useUpdateDeviceSetpoint(controlId);

// ?	const client = useApolloClient()

	// const { data: deviceValueData } = useQuery(gql`
	// 	query DeviceValues($id: ID) {
		
	// 		commandDevices (where: {id: $id}){
	// 			deviceSnapshot {
	// 				placeholder
	// 				key
	// 				value
	// 			}
	// 			waitingForActions {
	// 				id
	// 			}
	// 		}
	// 	}
    // `, {
	// 	variables: {
	// 		id: controlId,
	// 		idStr: controlId
	// 	}
	// })

	// const refetch = () => {
	// 	client.refetchQueries({include: ['DeviceValues']})
	// }


	// const values: { placeholder: string, key: string, value: string }[] =  [] //deviceValueData?.commandDevices?.[0]?.deviceSnapshot || []

	// const waitingForActions = values?.filter((a) => a.placeholder == 'PlantActions')?.map((action) => ({ [action.key]: action.value == 'true' })).reduce((prev, curr) => ({ ...prev, ...curr }), {})

	const hmi = program?.interface


	// const getDeviceValue = (name?: string, units?: { key: string, units?: string }[]) => {
	// 	//Find map between P&ID tag and bus-port

	// 	if (!name) return;


	// 	let v = values?.filter((a) => a?.placeholder == name);
	// 	let state = program?.devices?.find((a) => `${a?.type?.tagPrefix || ''}${a.tag}` == name)?.type?.state;

    //     console.log({name, values, v, state, program: program?.devices})

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

	// const hmiNodes = useMemo(() => {
	// 	return hmi?.nodes?.map((node) => {

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

	// const parseValue = (value: any, typeKey: keyof typeof DataTypes) => {
	// 	let type = DataTypes[typeKey];

	// 	let isArray = typeKey?.indexOf('[]') > -1;
        
    //     if(isArray && !Array.isArray(value)) value = []
    //     if(isArray) typeKey = typeKey?.replace('[]', '') as any
        
	// 	switch (typeKey) {
    //         case DataTypes.Boolean:
    //             return isArray ? value.map((value: any) => (value == true || value == "true" || value == 1 || value == "1")) : (value == true || value == "true" || value == 1 || value == "1");
    //         case DataTypes.Number:

    //             return isArray ? value.map((value: any) => {
    //                 let val = parseFloat(value || 0);
    //                 if (Number.isNaN(val)) {
    //                     val = 0;
    //                 }
    //                 return val % 1 != 0 ? val.toFixed(2) : val;
    //             }) : (() => {
    //                 let val = parseFloat(value || 0);

    //                 if(Number.isNaN(val)) {
    //                     val = 0;
    //                 }
    //                 return val % 1 != 0 ? val.toFixed(2) : val;
    //             })()
    //         default:
    //             console.log({ type })
    //             break;
    //     }

	// 	// switch(type){
	// 	// 	case DataTypes.Boolean:
	// 	// 		return (value == true || value == "true" || value == 1 || value == "1");
	// 	// 	case DataTypes.Number:
	// 	// 		let val = parseFloat(value || 0);
	// 	// 		if(Number.isNaN(val)){
	// 	// 			val = 0;
	// 	// 		}
	// 	// 		return val % 1 != 0 ? val.toFixed(2) : val;
	// 	// 	default:
	// 	// 		console.log({type})
	// 	// 		break;
	// 	// }
	// }

	const [ stateValues, setStateValues ] = useState<any>({});

	useEffect(() => {


		setStateValues(program?.tags?.map((device) => {

			let deviceKey = `${device.name}`;

			// let device = program?.devices.find((a) => `${a.type.tagPrefix ? a.type.tagPrefix : ''}${a.tag}` == deviceKey);

			// device.type.state

			let fields = program.types?.find((a) => a.name === device.type)?.fields;
			let hasFields = (fields || []).length > 0;


			if(hasFields){
				let deviceValues = fields?.map((stateItem) => {

					// let deviceStateItem = device?.type.state.find((a) => a.key == valueKey)

					let currentValue = values?.[deviceKey]?.[stateItem.name];

					return {
						key: stateItem.name,
						value: parseValue(stateItem.type as keyof typeof DataTypes, currentValue)
					}

				}).reduce((prev, curr) => ({
					...prev,
					[curr.key]: curr.value
				}), {})

				return {
					key: deviceKey,
					values: deviceValues
				}
			}else{
				return {
					key: deviceKey,
					values: parseValue(device.type as keyof typeof DataTypes, values?.[deviceKey])
				}
			}
		}).reduce((prev, curr) => ({
			...prev,
			[curr.key]: curr.values
		}), {}))

	}, [values, program])

	const operatingMode = values?.["Plant"]?.["Mode"]?.toLowerCase() || '';
	const operatingState = values?.["Plant"]?.["Running"] == 'true' ? "on" : "off";
	const operatingStatus = values?.["Plant"]?.["Status"];


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

	console.log({values, hmi: hmi?.nodes})


	return (
		<Box sx={{ flex: 1, display: 'flex', flexDirection: "row", position: 'relative' }}>
			<Box sx={{ flex: 1, display: 'flex' }}>

				<HMICanvas
					id={program?.id || ''}
					nodes={hmi?.nodes || []}
					templatePacks={templatePacks}
					paths={hmi?.edges || []}
					// functions={functions}

					// functions={{
					// 	showWindow
					// }}
					// program={program}
					deviceValues={stateValues}
					modes={[]}
					information={infoTarget != undefined ? (() => {

						const DataComponent : any = infoTarget.dataFunction(stateValues);

						return (<Bubble
							style={{ 
								position: 'absolute', 
								zIndex: 99, 
								pointerEvents: 'all', 
								display: 'flex',
								flexDirection: 'column',
								padding: '6px',
								left: (infoTarget?.x + infoTarget?.width) + 6, 
								top: (infoTarget?.y + infoTarget?.height) + (121 / 2),
								
							}}>
								{DataComponent}
								{/* {Object.keys(dataFunction).map((key) => 
									<Typography fontSize="small">{`${key}: ${dataFunction?.[key]}`}</Typography> 
								)} */}
							
							{/* <ActionMenu selected={selected} values={normalisedValues} /> */}
						</Bubble>)
					})() : null}
					onBackdropClick={() => {

						// setSelected(undefined)
						setInfoTarget(undefined)
					}}
					onSelect={(select) => {
						let node = hmi?.nodes?.find((a: any) => a.id == select.id)
						const { x, y, width, height } = node || {x: 0, y: 0, width: 0, height: 0};


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

						// setInfoTarget({ x: (x || 0) + (width||0), y: (y||0) + (height||0) })

						// setEditSetpoint(undefined)
						// setSelected(select)
					}}
				/>
			</Box>

			{historize && <Paper sx={{display: 'flex', flexDirection: 'column', bottom: 6, right: 6, left: 6, position: 'absolute', overflow: 'hidden'}}>
				<InfiniteScrubber 
					controls
					scale={'quarter-hour'}
					onTimeChange={(time) => {
						setTime(time)

						console.log({time});
						
						//TODO make onHorizonCHange
						const startDate = moment(time).toDate();
						const endDate = moment(startDate).add(1, 'week').toDate()
						// seekValue?.(startDate, endDate)
					}}
					time={time} />
			</Paper>}

			
		</Box>
	)
}