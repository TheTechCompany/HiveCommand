import React, {useContext, useMemo} from 'react';
import { Box, Button, Text } from 'grommet';
import { FormControl, FormInput } from '@hexhive/ui';
import { DeviceInterlockContext } from '../context';
import { Add } from 'grommet-icons';



const COMPARATORS = [
	">",
	">=",
	"<",
	"<=",
	"==",
	"!="
].map((x) => ({key: x}))
export const ConditionSection = (props) => {

	const { interlock, variables, devices, setInterlock } = useContext(DeviceInterlockContext)

	const renderAssertionInput = () => {
		if(!interlock.assertion?.type) return;
		switch(interlock.assertion.type){
			case 'setpoint':
				return (
					<FormControl
						labelKey="name"
						placeholder="Input Device Setpoint"
						value={interlock.assertion.setpoint}
						valueKey="id"
						onChange={(value) => setInterlock({...interlock, assertion: {...interlock.assertion, setpoint: value} })}
						options={devices?.find((a) => a.id == interlock?.inputDevice)?.setpoints || []} /> 
				)
			case 'variable':
				return (
					<FormControl
						placeholder='Input Device Variable'
						options={variables}
						labelKey='name'
						value={interlock.assertion.variable}
						valueKey='id'
						onChange={(value) => setInterlock({...interlock, assertion: {...interlock.assertion, variable: value} })}
						/>
				)
			case 'value':
				return (
					<FormInput 
						value={interlock.assertion.value}
						onChange={(value) => setInterlock({...interlock, assertion: {...interlock.assertion, value} })}
						placeholder="Input Device State Value" />
				)
		}
		// {(interlock.valueType && interlock.valueType == "setpoint") ?  (
		// 	<FormControl
		// 		labelKey="name"
		// 		placeholder="Input Device Setpoint"
		// 		value={interlock.assertion}
		// 		onChange={(value) => setInterlock({...interlock, assertion: value})}
		// 		options={devices?.find((a) => a.id == interlock?.inputDevice)?.setpoints || []} /> 
		// ) : <FormInput 
		// 	value={interlock.assertion}
		// 	onChange={(value) => setInterlock({...interlock, assertion: value})}
		// 	placeholder="Input Device State Value" /> }
	}

	console.log(interlock)

	return (
		<Box>
			{/* <Box direction="row" justify="end">
				<Button hoverIndicator plain style={{padding: 6, borderRadius: 3}} icon={<Add size="small" />} />
			</Box> */}
			<Box direction='row' align='center'>
				<FormControl 
						value={interlock.inputDevice}
						onChange={(value) => setInterlock({...interlock, inputDevice: value})}
						options={devices || []}
						placeholder="Input Device" />
					<FormControl 
						value={interlock.inputDeviceKey}
						labelKey="key"
						onChange={(value) => setInterlock({...interlock, inputDeviceKey: value})}
						options={devices?.find((a) => a.id == interlock?.inputDevice)?.type?.state || []}
						placeholder="State Key" />
					<FormControl 
						value={interlock.comparator ||''}
						options={COMPARATORS || []}
						labelKey='key'
						valueKey='key'
						onChange={(value) => setInterlock({...interlock, comparator: value})}
						placeholder="Comparison" />
					<FormControl 
						placeholder="Value Type"
						labelKey="label"
						value={interlock.assertion?.type || 'value'}
						onChange={(value) => setInterlock({...interlock, assertion: {...interlock.assertion, type: value}})}
						options={[{id: 'value', label: "Value"} , {id: 'setpoint', label: "Setpoint"}, {id: 'variable', label: "Variable"}]} />
					{renderAssertionInput()}
				</Box>
		</Box>
	)
}