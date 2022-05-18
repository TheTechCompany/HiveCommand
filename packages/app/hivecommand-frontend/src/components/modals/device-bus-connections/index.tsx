import { BaseModal } from '../base';
import { Box, Text, Select } from 'grommet'
import React, {useState, useEffect} from 'react';

export const DeviceBusConnectionModal = (props) => {

	const [ connection, setConnection ] = useState<{id?: string, key?: string, subindex?: number, device?: string, value?: string}[]>([])

	const [connectionValues, setConnectionValues ] = useState<({key?: string} & any)[]>([]);

	console.log("Connections", connection)

	console.log({connections: props.connections})
	useEffect(() => {
		setConnection(props.connections)
	}, [props.connections])

	const onChange = (id: string, key: string, value: any) => {
		let c = connectionValues.slice()
		let ix = connectionValues.map((x) => x.key).indexOf(id)
		console.log(c, ix)
		if(ix > -1){
			c[ix] = Object.assign({...c[ix]}, {[key]: value});
		}else{
			c.push({key: id, [key]: value})
		}
		
		setConnectionValues(c)
	}

	useEffect(() => {
		if(props.selected){
			console.log("SELECTED", props.selected)
			setConnectionValues(props.selected.map((x) => ({...x, keyName: x?.key?.key, key: x?.key?.id, device: x.device?.id, value: x.value?.id})))
		}
	}, [props.selected])

	const onSubmit = () => {
		props.onSubmit(connectionValues.map((x) => ({key: x.key, device: x.device, port: x.port, value: x.value})))
	}
console.log({connectionValues, connection, values: connectionValues?.find((b) => b.key == connection?.[0]?.id), device: props.devices?.find((a) => a.id == connectionValues?.find((b) => b.id == connection?.[0]?.id)?.device), devices: props.devices})
	return (
		<BaseModal
			title="Create Mapping"
			width="large"
			open={props.open}
			onSubmit={onSubmit}
			onClose={props.onClose}
			>
			<Box>
			{connection?.sort((a, b) => a.subindex - b.subindex).map((connection) => (
                            <Box align="center" direction="row">
                                <Box flex>
									<Text>{connection.key}</Text> 
								</Box>
								<Box flex>
									<Select 
										clear
										labelKey="name"
										valueKey={{reduce: true, key: 'id'}}
										placeholder="Device"
										onChange={({value}) => onChange(connection.id, 'device', value)}
										value={connectionValues?.find((a) => a.key == connection.id)?.device}
										options={props.devices || []} />
								</Box>
								<Box direction="row" flex>
									<Select
										clear
										labelKey="key"
										valueKey={{reduce: true, key: 'id'}}
										value={connectionValues?.find((a) => a.key == connection.id)?.value}
										placeholder="Device Key"
										onChange={({value}) => onChange(connection.id, 'value', value)}
										options={props.devices?.find((a) => a.id == connectionValues?.find((b) => b.key == connection.id)?.device)?.type?.state || []} />
								</Box>
                            </Box>
                        ))}
			</Box>
		</BaseModal>
	)
}