import { HMICanvas } from '../../../components/hmi-canvas';
import React, {useContext, useEffect, useState} from 'react';
import { Box, Text, TextInput, CheckBox, Button, Spinner, Select } from 'grommet';
import { Checkmark } from 'grommet-icons';
import { DeviceControlContext } from '../context';
import { getDevicesForNode } from '../utils';
import { Bubble } from '../../../components/Bubble/Bubble';
import { useRequestFlow } from '@hive-command/api';
import { FormControl } from '@hexhive/ui';

const ActionButton = (props) => {
	console.log(props)
	return (
		<Box background="accent-1" direction='row' round="xsmall" width={'100%'} align='center' justify='center' elevation="small">
			<Button 
				disabled={props.waiting || props.disabled}
				plain
				hoverIndicator={'accent-2'}
				onClick={props.onClick}
				style={{padding: 6, borderRadius: 3, width: '100%'}}
				label={(<Box direction='row' align='center' justify='between'>
					<Text size="small">{props.label}</Text>	
					{props.waiting && <Spinner size="xsmall" />}
				</Box>)} />
			
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
		},
		// {
		// 	label: 'Timer',
		// 	key: 'timer'
		// }
	]

	// const [operating, setOperating] = useState<string>('disabled')

    const [ infoTarget, setInfoTarget ] = useState<{x?: number, y?: number}>(undefined);
    const [ selected, setSelected ] = useState<{key?: string, id?: string}>(undefined)

    const [ workingState, setWorkingState ] = useState<any>({})

	const { 
		waitingForActions, 
		changeOperationMode,
		changeOperationState, 
		operatingMode, 
		operatingState,
		program, 
		actions, 
		values, 
		hmi, 
		hmiNodes, 
		groups, 
		changeDeviceMode, 
		changeDeviceValue, 
		performAction, 
		controlId 
	} = useContext(DeviceControlContext)

	console.log({operatingMode, waitingForActions, actions})

	const requestFlow = useRequestFlow(controlId)

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
    const getDeviceValue = (name?: string, units?: {key: string, units?: string}[]) => {
        //Find map between P&ID tag and bus-port

        if(!name) return;

    
        let v = values.filter((a) => a?.deviceId == name);
        let state = program?.devices?.find((a) => a.name == name).type?.state;

         
        return v.reduce((prev, curr) => {
            let unit = units?.find((a) => a.key == curr.valueKey);
            let stateItem = state.find((a) => a.key == curr.valueKey);
            let value = curr.value;

            if(!stateItem) return prev;

            if(stateItem?.type == "IntegerT" || stateItem?.type == "UIntegerT"){
                value = parseFloat(value).toFixed(2)
            }
            return {
                ...prev,
                [curr.valueKey]: value
            }
        }, {})
    
    }

    const renderActionValue = (deviceName: string, deviceInfo: any, deviceMode: string, state: any) => {
        let value = getDeviceValue(deviceName, deviceInfo.state)?.[state.key];

        if(state.writable && operatingMode == "manual"){
            return (
                <TextInput 
                    style={{padding: "none"}}
                    type="number" 
                    size="small" 
                    plain 
                    placeholder={state.key} 
                    onChange={(e) => setWorkingState({...workingState, [state.key]: parseFloat(e.target.value)})}
                    value={workingState[state.key] || parseFloat(value)} />
            )
        }else{
            return <Text size="small">{value}</Text>
        }
    }


    const renderActions = () => {
		let node = hmi.concat(groups).find((a) => a.id == selected?.id)
 
		if(!node) return ;
 
		let devices =  getDevicesForNode(node)
 
		return devices.map((device) => {
			let deviceInfo = device?.type || {};
			let deviceName = device?.name || '';
		 
			let deviceMode = deviceModes.find((a) => a.name == deviceName)?.mode;
 
			return (
			 <Box 
				 border={{side: 'bottom', size: 'small'}}
				 flex 
				 direction="column">
				 <Box
					  pad="xsmall"
					  justify="center" 
					  direction="column">
 
					 <Box align="center" justify="between" direction="row">
						 <Text weight="bold" size="small">{device?.name}</Text>
						 <CheckBox 
							 reverse
							 onChange={(e) => {
								 changeDeviceMode({
									 args: {
										 deviceId: controlId,
										 deviceName: device?.name,
										 mode: !e.target.checked ? "Manual" : "Automatic"
									 }
								 })
							 }}
							 checked={deviceMode != "Manual"}
							 label={deviceMode}
							 toggle />
 
					 </Box>
  
					  <Text size="xsmall">{deviceInfo?.name}</Text>
				 </Box>
				 <Box pad="xsmall" flex>
				  {deviceInfo?.state?.map((state) => (
					  <Box direction="row" align="center">
						 <Box flex><Text size="small">{state.key}</Text></Box>
						 <Box flex>{renderActionValue(deviceName, deviceInfo, deviceMode, state)}</Box>
						 {workingState[state.key] != undefined ? (<Button 
							 plain
							 onClick={() => {
								 sendChanges(deviceName, state.key, workingState[state.key])
							 }}
							 style={{padding: 6, borderRadius: 3}}
							 hoverIndicator
							 icon={<Checkmark size="small" />} />) : ''}
					  </Box>
				  ))}
				 </Box>
  
  {/* 
  
				  {deviceValues(node?.devicePlaceholder?.name)} */}
				  <Box align="center" justify="around" direction="row">
				  	{operatingMode == "manual" && deviceInfo?.actions?.map((action) => (
					  <Button
						  plain
						  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 6, borderRadius: 3}}
						  hoverIndicator={'accent-1'}
						  onClick={() => {
							  performAction(
									deviceName,
									action.key		  
							  	)
						  }}
						  label={action.key} />
				  ))}
				  </Box>
  
			  </Box>
		 )
		}) 
 
	 }


	 const deviceModes = program?.devices?.map((a) => {
        let vals = values.filter((b) => b?.deviceId == a.name);
        // if(!vals.find((a) => a.valueKey == "mode")) console.log(a.name)
        return {name: a.name, mode: vals.find((a) => a.valueKey == 'mode')?.value};
    }) || [];


	const sendChanges = (deviceName: string, stateKey: string, stateValue: any) => {
        changeDeviceValue({
            args: {
                deviceName: deviceName,
                key: stateKey,
                value: stateValue
            }
        }).then(() => {
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
 
	return (
		<Box flex direction="row">
			<Box flex>
		<HMICanvas 
			id={program.id}
			program={program}
			deviceValues={hmiNodes}
			modes={deviceModes}
			information={infoTarget != undefined ? (
				<Bubble style={{position: 'absolute', zIndex: 99, pointerEvents: 'all', left: infoTarget?.x, top: infoTarget?.y}}>
					{renderActions()}
				</Bubble>
			) : null}
			onBackdropClick={() => {
				setSelected(undefined)
				setInfoTarget(undefined)
			}}
			onSelect={(select) => {
				let node = program.hmi?.[0]?.nodes?.concat(program?.hmi?.[0]?.groups).find((a) => a.id == select.id)

				const { x, y, scaleX, scaleY} = node;
				setInfoTarget({x: x + (node.width || node?.type?.width), y: y})
				
				setSelected(select)
			}}
		/>
		</Box>
			<Box elevation="small" background="light-1">
				<Box background="accent-1" align="center">
					<Text>Controls</Text>
				</Box>
				<Box pad="small"flex>
					<Box gap="xsmall" pad={{bottom: 'small'}} border={{side: 'bottom', size: 'small'}}>

						<Box direction='row' align="center">
							<FormControl
								value={operatingMode}
								valueKey='key'
								onChange={(value) => {
									changeOperationMode(value)
									// console.log(value)
									// setOperating(value)
								}}
								placeholder='Mode'
								labelKey='label'
								options={operatingModes} />
						</Box>
						<ActionButton 
							disabled={operatingMode == 'disabled'}
							onClick={() =>  {
								changeOperationState((!operatingState || operatingState == 'off') ? 'on' : 'off')
							}}
							label={(!operatingState || operatingState == "off") ? "Start" : "Shutdown"} />
					</Box>
					{operatingMode == "manual" && <Box  border={{side: 'bottom', size: 'small'}}>
						<Text>Commands</Text>
						<Box gap="xsmall">
							{actions.map((action) => (
								<ActionButton
									waiting={waitingForActions.map((x) => x.id).includes(action.id)}
									onClick={() => controlAction(action)}
									label={action.name} />
							))}
						</Box>
					</Box>}
				</Box>
			</Box>
		</Box>
	)
}