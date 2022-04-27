import { BaseModal } from '../base';
import React, {useEffect, useState} from 'react';
import { FormControl, FormInput } from '@hexhive/ui'
import { Box, Button  } from 'grommet';
import { StateSection } from './sections/State';
import { ConditionSection } from './sections/Conditions';
import { ActionSection } from './sections/Actions';
import { DeviceInterlockProvider } from './context';

export interface DeviceInterlockModalProps {
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

export const DeviceInterlock : React.FC<DeviceInterlockModalProps> = (props) => {

	const [ view, setView ] = useState<'state' | 'conditions' | 'actions'>('state')

	const [ interlock, setInterlock ] = useState<{
		inputDevice?: string,
		inputDeviceKey?: string,
		comparator?: string,
		assertion?: {
			type?: string,
			variable?: string,
			setpoint?: string,
			value?: string
		},
		action?: string
	}>({
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
				state: props.selected.state?.map(state => ({
					deviceKey: state.deviceKey?.id,
					deviceValue: state?.deviceValue?.type == 'setpoint' ? state?.deviceValue?.setpoint?.id : state?.deviceValue?.value
				})),
				inputDevice: props.selected?.inputDevice?.id,
				inputDeviceKey: props.selected?.inputDeviceKey?.id,
				comparator: props.selected?.comparator,
				assertion: {
					type: props.selected?.assertion?.type,
					value: props.selected?.assertion?.value,
					setpoint: props.selected?.assertion?.setpoint?.id,
					variable: props.selected?.assertion?.variable?.id
				},
				action: props.selected?.action?.id
			})
		}
	}, [props.selected])
	
	console.log(props.devices?.find((a) => a.id == interlock.inputDevice)?.setpoints)

	const tabItems = [
		{
			id: 'state',
			label: "State"
		},
		{
			id: 'conditions',
			label: "Conditions"
		},
		{
			id: 'actions',
			label: "Actions"
		}
	]

	const renderView = () => {
		switch(view){
			case 'actions':
				return (
					<ActionSection />
				)
			case 'conditions':
				return (
					<ConditionSection />
				)
			case 'state':
				return (
					<StateSection />
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
				title="Add Device Interlock"
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