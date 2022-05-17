import { BaseModal } from '@hexhive/ui';
import { Box, TextInput, Select } from 'grommet';
import React from 'react';
import { useState } from 'react';


export const DeviceBusModal = (props) => {

	const [ bus, setBus ] = useState<{name?: string, type?: string, ports?: number}>({})

	const onSubmit = () => {
		props.onSubmit?.(bus);
	}


	return (
		<BaseModal
			title="Add Device Bus"
			open={props.open}
			onSubmit={onSubmit}
			onClose={props.onClose}
			>
			<Box width="medium" gap="xsmall">
				<TextInput 
					value={bus.name}
					onChange={(e) => setBus({...bus, name: e.target.value})}
					placeholder="Name" />
				<Select 
					value={bus.type}
					onChange={({value}) => {
						console.log("change bus", value);
						setBus({...bus, type: value})
					}}
					placeholder="Type" 
					options={["IO-Link Master", "RevPi DIO"]} />

				<TextInput 	
					placeholder="Ports"
					type="number"
					value={bus.ports}
					onChange={(e) => setBus({...bus, ports: e.target.value ? parseInt(e.target.value) : undefined })} />
			</Box>
		</BaseModal>
	)
}