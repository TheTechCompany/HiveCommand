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
	const { interlock, devices, setInterlock } = useContext(DeviceInterlockContext)


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
						value={interlock.valueType || 'value'}
						onChange={(value) => setInterlock({...interlock, valueType: value})}
						options={[{id: 'value', label: "Value"} , {id: 'setpoint', label: "Setpoint"}]} />
					{(interlock.valueType && interlock.valueType == "setpoint") ?  (
						<FormControl
							labelKey="name"
							placeholder="Input Device Setpoint"
							value={interlock.assertion}
							onChange={(value) => setInterlock({...interlock, assertion: value})}
							options={devices?.find((a) => a.id == interlock?.inputDevice)?.setpoints || []} /> 
					) : <FormInput 
						value={interlock.assertion}
						onChange={(value) => setInterlock({...interlock, assertion: value})}
						placeholder="Input Device State Value" /> }
				</Box>
		</Box>
	)
}