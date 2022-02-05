import { BaseModal, FormControl } from '@hexhive/ui';
import { TextInput } from 'grommet';
import React, {useState, useEffect} from 'react';

export const AssignFlowModal = (props) => {

	const [ action, setAction ] = useState<{
		name?: string,
		flow?: string[]
	}>({})

	useEffect(() => {
		setAction(props.selected || {});
	}, [props.selected])
	const onSubmit = () => {
		props.onSubmit(action)
	}
	return (
		<BaseModal 
			title="Assign Flow"
			open={props.open} 
			onSubmit={onSubmit}
			onDelete={props.selected && props.onDelete}
			onClose={props.onClose}>
			<TextInput 
				value={action.name}
				onChange={(e) => setAction({...action, name: e.target.value})}
				placeholder="Action name" />
			<FormControl 
				multiple
				value={action.flow}
				onChange={(value) => setAction({...action, flow: value})}
				options={props.flows?.map((x) => x.children?.map((y) => ({...y, name: `${x.name} - ${y.name}`}))).reduce((prev, curr) => prev.concat(curr), []) || []}
				labelKey="name"
				placeholder="Select flow" />
		</BaseModal>
	)
}