import React, { useState, useEffect } from 'react';
import { Box, Select, Text, TextInput } from 'grommet'
import { BaseModal } from '../base';
import { FormControl } from '@hexhive/ui';

export interface DevicePluginModalProps {
	open: boolean;
	onClose?: () => void;
	onSubmit?: (plugin: any) => void;
	plugins?: any[];
	devices?: any[];
	device?: any;
	flows?: any[];
	selected?: any;
}

export const DevicePluginModal : React.FC<DevicePluginModalProps> = (props) => {

	const [ plugin, setPlugin ] = useState<{
		plugin?: string,
		rules?: string,
		configuration?: any
	}>({})

	// const [ selectedPlugin, setSelectedPlugin ] = useState<string>('');
	// const [ activeFlow, setActiveFlow ] = useState<string>('');
	// const [ pluginConfiguration, setPluginConfiguration ] = useState<any>({})

	const onChangeConfiguration = (key: string, value: any) => {
		let conf = Object.assign({}, plugin.configuration)
		conf[key] = value;
		setPlugin({...plugin, configuration: conf})
	}

	const onSubmit = () => {
		// alert(plugin.id)
		props.onSubmit?.(plugin)
	}

	useEffect(() => {
		if(props.selected){
			console.log(props.selected)
			let conf = props.selected.config?.reduce((prev, curr) => ({
					...prev,
					[curr.key?.id]: curr.value
				}), {})

			setPlugin({
				...props.selected,
				plugin: props.selected?.plugin?.id,
				rules: props.selected?.rules?.id,
				configuration: conf
			})
			// setSelectedPlugin(props.selected.id)
			// let conf = props.selected.configuration.reduce((prev, curr) => ({
			// 	...prev,
			// 	[curr.key]: curr.value
			// }), {})

			// setPluginConfiguration(conf)
		}
	}, [props.selected])

	const renderPluginFormItem = (item: any) => {

		let requirements : any = {};
		if(item.requires?.length > 0){
			let values = [];
			item.requires.forEach((req: any) => {
				requirements[req.type?.toLowerCase()] = plugin?.configuration?.[req.id]
				values.push(plugin?.configuration?.[req.id])
			})
			if(values.indexOf(undefined) > -1) return;
		}

		console.log({requirements})

		switch(item.type) {
			case "Number":
				return (<TextInput 
						value={plugin.configuration?.[item.id] || ''}	
						onChange={(e) => onChangeConfiguration(item.id, e.target.value)}
					type="number" />);
			case "Device":
				return( <Select
					labelKey="name"	
					value={plugin?.configuration?.[item.id]}
					valueKey={{key: 'name', reduce: true}}
					onChange={({value}) => onChangeConfiguration(item.id, value)}
					options={props.devices || []} />)
			case "DeviceState":
				return (<Select 	
						labelKey="key"
						value={plugin?.configuration?.[item.id]}
						valueKey={{key: 'key', reduce: true}}
						onChange={({value}) => onChangeConfiguration(item.id, value)}
						options={props.devices.find((a) =>  a.name == requirements?.device)?.type?.state || []} />)
			default: return;
		}
	}
	const renderPluginForm = () => {
		const config = props.plugins.find((a) => a.id === plugin?.plugin)?.config?.slice() || []

		console.log({config})
		return config?.sort((a, b) => {
			return a.order - b.order;
		}).map((conf) => (
			<Box 
				align="center"
				justify="between"
				direction="row">
				<Box flex>
					<Text>{conf.key}</Text>
				</Box>
				<Box flex>
					{renderPluginFormItem(conf)}
				</Box>
			</Box>
		));
	}

	return (
		<BaseModal
			open={props.open}
			onClose={props.onClose}
			onSubmit={onSubmit}
			title={"Add a Plugin"}
			>

			<Select
				labelKey="name"
				placeholder="Select a plugin"
				valueKey={{reduce: true, key: 'id'}}
				value={plugin?.plugin}
				onChange={({value}) => setPlugin({...plugin, plugin: value})}
				options={props.plugins}
				/>
			<FormControl 
				value={plugin?.rules}
				onChange={(value) => setPlugin({...plugin, rules: value})}
				labelKey="name"
				placeholder="(Optional) active flow" 
				options={props.flows || []} />
			{renderPluginForm()}
		</BaseModal>
	)
}