import React, {useState, useEffect} from 'react';
import { 
	Box,
	Checkbox,
	DialogActions, 
	Button, 
	TextField, 
	DialogContent, 
	Dialog,
	Select, 
	MenuItem, 
	DialogTitle, 
	InputAdornment,
	FormControl,
	InputLabel,
	Typography,
	FormControlLabel
} from '@mui/material';

export interface ProgramDeviceModalProps {
	open: boolean;
	onClose?: () => void;
	onSubmit?: (item: any) => void;
	onDelete?: () => void;

	selected?: any;

	deviceTypes: any[];

	configuration?: any;
}

export const ProgramDeviceModal : React.FC<ProgramDeviceModalProps> = (props) => {

	const [ device, setDevice ] = useState<{
		id?: string;
		name?: string;
		type?: string;
		calibrated?: {id?: string, key: string, min?: string, max?: string}[],
		state?: {id?: string, key: string, type: string, min?: string, max?: string}[]
		requiresMutex?: boolean;
	}>({});

	const [ label, setLabel ] = useState<string>('');
	const [ type, setType ] = useState<string>('');

	console.log(props.configuration)
	
	const onSubmit = () => {
		props.onSubmit?.(device)
	}

	useEffect(() => {
		let calibrated = props.selected?.calibrated || [];
		// console.log(props.selected)
		if(props.selected?.calibrated){
			calibrated = props.selected?.calibrated?.map((item) => {

				return {
					...item,
					key: item.stateItem?.id
				}
				// let value = props.selected?.configuration?.find((a) => a?.conf?.id == item.id)
				
				// console.log(item, value)

				// return {
				// 	id: value?.id,
				// 	key: item.key,
				// 	confKey: item.id,
				// 	type: item.type,
				// 	value: value?.value
				// }
			})
		}

		console.log(props.selected)

		setDevice({
			...props.selected,
			type: props.selected?.type?.id,
			state: props.selected?.type?.state,
			calibrated
		})
	}, [props.selected])

	const onChangeConf = (key: string, value: any, selector: string) => {
		let calibrations = device?.calibrated?.slice() || [];

		let ix = calibrations.map((x) => x.key).indexOf(key);
		if(ix > -1){
			calibrations[ix] = {
				...calibrations[ix],
				[selector]: value
			}
		}else{
			calibrations.push({
				key: key,
				[selector]: value
			})
		}

		console.log({calibrations})

		setDevice({...device, calibrated: calibrations})
		// let conf = device.configuration.slice();
		// let ix = conf.map((x) => x.key).indexOf(key);

		// if(ix > -1){
		// 	conf[ix] = {
		// 		...conf[ix], 
		// 		value: value
		// 	}
		// }
		// setDevice({...device, configuration: conf})
	}

	const renderInput = (key: string, label: string, type: string, selector : string) => {
		let defaultValue = device?.state?.find((a) => a.id == key)?.[selector] || ''
		let value = device?.calibrated?.find((a) => a.key == key)?.[selector] || defaultValue

		switch(type){
			case 'UIntegerT':
			case 'IntegerT':
			case 'Int':
				return (<TextField 	
						value={value}
						fullWidth
						sx={{margin: 0}}
						size="small"
						label={label}
						onChange={(e) => onChangeConf(key, e.target.value, selector)}
						type="number" />)
			default:
				return;
		}
	}
	return (
		<Dialog	
			open={props.open}
			onClose={props.onClose}>
			<DialogTitle>Add Device</DialogTitle>

			<DialogContent sx={{minWidth: '420px', display: 'flex', padding: '12px', flexDirection: 'column', '& *': {marginBottom: '8px'}}}>
				<TextField	
					sx={{marginTop: '12px'}}
					fullWidth
					size="small"
					value={device?.name}
					onChange={(e) => setDevice({...device, name: e.target.value})}
					label="P&ID Label" />
				
				<FormControl fullWidth size="small">
					<InputLabel>Device Type</InputLabel>
					<Select 
						label="Device Type"
						value={device?.type}
						onChange={(evt, value) => setDevice({...device, type: evt.target.value})}>
						{props.deviceTypes?.map((deviceType) => (
							<MenuItem value={deviceType.id}>{deviceType.name}</MenuItem>
						))} 
					</Select>
				</FormControl>
				
					{/* options={props.deviceTypes || []}
					labelKey="name"
					valueKey={{reduce: true, key: 'id'}}
					placeholder="Device Type" /> */}
				
				<Box
					sx={{display: 'flex', flexDirection: 'row'}}>
						<FormControlLabel control={
					<Checkbox 
						checked={device?.requiresMutex}
						onChange={(e) => setDevice({...device, requiresMutex: e.target.checked})} />} label="Requires mutex" />
				</Box>
				{device?.state && device?.state?.filter((a) => a.min && a.max).map((conf) => (
					<>
					<Box
						sx={{display: 'flex', alignItems: 'center', flexDirection: 'row'}}>
					
						<Box sx={{flex: 1, margin: 0}}>
							{renderInput(conf.id, `min${conf.key}`, conf.type, 'min')}
						</Box>
					</Box>
					<Box
						sx={{
							alignItems: 'center',
							flexDirection: 'row',
							display: 'flex'
						}}>
				
						<Box sx={{flex: 1, margin: 0}}>
							{renderInput(conf.id, `max${conf.key}`, conf.type, 'max')}
						</Box>
					</Box>
					</>
				))}
			</DialogContent>
			<DialogActions>
				<Button onClick={props.onClose}>Close</Button>
				<Button onClick={onSubmit} variant="contained">Save</Button>
			</DialogActions>
		</Dialog>
	)
}