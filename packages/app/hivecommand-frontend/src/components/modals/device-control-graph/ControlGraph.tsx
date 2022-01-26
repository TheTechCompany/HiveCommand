import { BaseModal, FormControl } from '@hexhive/ui';
import { TextInput } from 'grommet';
import React, {useContext, useState} from 'react';

export const ControlGraphModal = (props) => {


	const [ graph, setGraph ] = useState<{
		device?: string,
		key?: string
	}>({})
    console.log(graph)


	const onSubmit = () => {
		props.onSubmit(graph)
	}
	return (
		<BaseModal 
			title="Control Graph"
			open={props.open} 
			onSubmit={onSubmit}
			onClose={props.onClose}>
			<FormControl 
				value={graph.device}
				onChange={(value) => setGraph({...graph, device: value})}
				options={props.devices || []}
				labelKey="name"
				placeholder="Select device" />
                <FormControl 
				value={graph.key}
				onChange={(value) => setGraph({...graph, key: value})}
				options={props.devices?.find((item)=> item.id==graph.device)?.type.state || []}
				labelKey="key"
				placeholder="Select key" />
		</BaseModal>
	)
}