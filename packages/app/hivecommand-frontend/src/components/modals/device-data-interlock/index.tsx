import { BaseModal } from '../base';
import React, {useEffect, useState} from 'react';
import { FormControl, FormInput } from '@hexhive/ui'
import { Box, Button  } from 'grommet';
import { ConditionSection } from './sections/Conditions';
import { ActionSection } from './sections/Actions';
import { DeviceDataInterlock, DeviceInterlockProvider } from './context';

export interface DeviceDataInterlockModalProps {
	open: boolean;
	selected?: any

	devices?: any[];
	actions?: any[];
	device?: any;

	variables?: any[];

	onSubmit?: (interlock: any) => void;
	onDelete?: () => void;
	onClose?: () => void;
}

export const DeviceDataInterlockModal : React.FC<DeviceDataInterlockModalProps> = (props) => {

	const [ view, setView ] = useState<'device' | 'conditions'>('device')

	const [ interlock, setInterlock ] = useState<DeviceDataInterlock>({
		assertion: {
			type: 'value'
		}
	})

	const onSubmit = () => {
		props.onSubmit?.(interlock)
		setInterlock({})
	}

	useEffect(() => {
		if(props.selected) {
			console.log({selected: props.selected})
			setInterlock({
				...props.selected,
				inputDevice: props.selected?.inputDevice?.id,
				inputDeviceKey: props.selected?.inputDeviceKey?.id,
				comparator: props.selected?.comparator,
				assertion: {
					type: props.selected?.assertion?.type,
					value: props.selected?.assertion?.value,
					setpoint: props.selected?.assertion?.setpoint?.id,
					variable: props.selected?.assertion?.variable?.id
				},
				deviceKey: props.selected?.deviceKey?.id
			})
		}
	}, [props.selected])
	
	console.log(props.devices?.find((a) => a.id == interlock.inputDevice)?.setpoints)

	const tabItems = [
		{
			id: 'device',
			label: "Device"
		},
		{
			id: 'conditions',
			label: "Conditions"
		}
	]

	const renderView = () => {
		switch(view){
			case 'device':
				return (
					<ActionSection />
				)
			case 'conditions':
				return (
					<ConditionSection />
				)
		}
	}

	return (
		<DeviceInterlockProvider
			value={{
				interlock,
				setInterlock,
				variables: props.variables,
				devices: props.devices,
				device: props.device,
				actions: props.actions
			}}>
			<BaseModal
				noClick={true}
				title="Add Device Data Interlock"
				open={props.open}
				onClose={props.onClose}
				onSubmit={onSubmit}	
				onDelete={props.selected && props.onDelete}
				width="large"
				header={(
					<Box background="accent-1" direction="row" gap="small">
						{tabItems.map((tab) => (
							<Button 
								onClick={() => setView(tab.id as any)}
								active={view == tab.id} 
								style={{padding: 6, borderRadius: 3}} 
								hoverIndicator 
								plain
								label={tab.label} />
						))}
						
					</Box>
				)}
			>
				<Box>
					{renderView()}
				</Box>
			</BaseModal>
		</DeviceInterlockProvider>
	)
}