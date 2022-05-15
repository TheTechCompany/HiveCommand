import React, {useContext, useEffect, useMemo, useState} from 'react';
import { Box, Button, CheckBox, TextInput } from 'grommet';
import { Add } from '@mui/icons-material';
import { DeviceInterlockContext } from '../context';

import { FormControl, FormInput } from '@hexhive/ui';
import { nanoid } from 'nanoid';
// import 'react-awesome-query-builder/lib/css/compact_styles.css'; //optional, for more compact styles


const COMPARATORS = [
	">",
	">=",
	"<",
	"<=",
	"==",
	"!="
].map((x) => ({key: x}))

export const StateSection = (props) => {
	const { device, interlock, setInterlock, devices } = useContext(DeviceInterlockContext)

	// const [ config, setConfig ] = useState<Config>({
	// 	...InitialConfig
	// });

	// const [ query, setQuery ] = useState<ImmutableTree>(QbUtils.checkTree(QbUtils.loadTree(interlock.state || {id: QbUtils.uuid(), type: 'group'}), config));

	

	// const query = useMemo(() => {
	// 	// if(interlock.state) {
	// 	// console.log("Update tree", interlock)
	// 	console.log({state: interlock.state})
	// 	let tree = interlock.state || {id: QbUtils.uuid(), type: 'group'}
	// 	console.log({tree})

	// 	const imTree = QbUtils.loadTree(tree)
	// 	console.log({imTree})

	// 	return QbUtils.checkTree(QbUtils.loadTree(tree), config)

	// 		// }
	// }, [interlock.state])
	
	const updateStateRow = (ix: number, key: string, value: any) => {
		let state = interlock.state || []

		state[ix] = {
			...state[ix],
			[key]: value
		}
		setInterlock({...interlock, state})
	}

	return (
		<Box flex gap="xsmall">
			<Box justify='end' direction='row'>
				<Button
					onClick={() => setInterlock({...interlock, state: [...(interlock.state || []), {id: nanoid(), device: '', deviceKey: '', comparator: '', assertion: ''}]})}
					hoverIndicator 
					plain 
					style={{padding: 6, borderRadius: 3}} icon={<Add />} />
			</Box>
			{interlock?.state?.map((lock, ix) => (
				<Box direction='row' align='center'>
					<FormControl 
						value={lock.device}
						onChange={(value) => updateStateRow(ix, 'device', value)}
						options={devices || []}
						placeholder="Input Device" />
					<FormControl 
						value={lock.deviceKey}
						labelKey="key"
						onChange={(value) => updateStateRow(ix, 'deviceKey', value)}
						options={devices?.find((a) => a.id == lock?.device)?.type?.state || []}
						placeholder="State Key" />
					<FormControl 
						value={lock.comparator ||''}
						options={COMPARATORS || []}
						labelKey='key'
						valueKey='key'
						onChange={(value) => updateStateRow(ix, 'comparator', value)}
						placeholder="Comparison" />
					{/* <FormControl 
						placeholder="Value Type"
						labelKey="label"
						value={interlock.valueType || 'value'}
						onChange={(value) => upd({...interlock, valueType: value})}
						options={[{id: 'value', label: "Value"} , {id: 'setpoint', label: "Setpoint"}]} /> */}
					{/* {(interlock.valueType && interlock.valueType == "setpoint") ?  (
						<FormControl
							labelKey="name"
							placeholder="Input Device Setpoint"
							value={interlock.assertion}
							onChange={(value) => setInterlock({...interlock, assertion: value})}
							options={devices?.find((a) => a.id == interlock?.inputDevice)?.setpoints || []} /> 
					) : */}
					<FormInput  
						value={lock.assertion}
						onChange={(value) => updateStateRow(ix, 'assertion', value)}
						placeholder="Input Device State Value" /> 
				</Box>
			))}
			
		</Box>
	)
}