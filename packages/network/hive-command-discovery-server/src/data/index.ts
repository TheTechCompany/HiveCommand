import { nanoid } from 'nanoid';
import { request, gql, RequestDocument, Variables } from 'graphql-request'
import { PayloadResponse } from '@hive-command/data-types'

export interface DataOptions {
	gatewayURL?: string;
	apiKey?: string;
}

export class Data {

	private options: DataOptions;

	constructor(opts: DataOptions) {
		this.options = opts;

	}

	async requestGraphQL(document: RequestDocument, variables: Variables) {
		if (!this.options.gatewayURL) return console.error('No gatewayURL set');

		try {
			const response = await request(
				this.options.gatewayURL,
				document,
				variables,
				{
					'Authorization': `API-Key ${this.options.apiKey}`
				}
			)
			return response

		} catch (error) {
			console.error(`Error sending GraphQL: `, error)
		}
	}


	async getDeviceByNetID(deviceId: string) {

		const devices = await this.requestGraphQL(gql`
			query GetDevice($networkName: String) {
				commandDevices(where: {network_name: $networkName}) {
					id
				}
			}
		`, {
			networkName: deviceId
		})

		return devices?.commandDevices?.[0] //.records?.[0]?.get(0)
	}


	async removeWaitingAction(deviceId: string, waitingId: string) {
		// await this.session.run(`
		// 	MATCH (device:CommandDevice {id: $id})-[rel:WAITING_FOR {id: $waitingId}]->(:CommandProgramAction)
		// 	DELETE rel
		// `, {
		// 	id: deviceId,
		// 	waitingId: waitingId
		// })
	}

	// async getDeviceAssignment(deviceId: string){
	// 	const assignment = await this.requestGraphQL(gql`
	// 		query GetDevices ($networkName: String){
	// 			commandDevices(where: {network_name: $networkName}) {
	// 				id

	// 				mappedDevices {
	// 					id
	// 					port

	// 					key {
	// 						id
	// 						key
	// 					}
	// 					device {
	// 						id
	// 						name
	// 					}
	// 					value {
	// 						id
	// 						key
	// 					}

	// 				}

	// 			}
	// 		}
	// 	`, {})
	// // 	const assignment = await tx.run(`
	// // 	MATCH p = (device:CommandDevice {network_name: $id})-[:HAS_PERIPHERAL]->(peripherals:CommandDevicePeripheral)-[mapping:HAS_MAPPING]->(map:CommandDevicePeripheralMap)-[:USES_DEVICE]->(devices)-[:USES_TEMPLATE]->(template:CommandProgramDevice)
	// // 	OPTIONAL MATCH (template)-[:HAS_ACTION]->(actions:CommandProgramDeviceAction)
	// // 	WITH devices {
	// // 		.*,
	// // 		type: template.type,
	// // 		port: mapping.port,
	// // 		bus: peripherals.id,
	// // 		actions: collect(actions{.*})
	// // 	} as device, devices, template


	// // 	CALL {
	// // 		WITH devices, template, device
	// // 		UNWIND devices as deviceItem
	// // 		OPTIONAL MATCH (devices)-->(template)-[:HAS_STATE]->(state:CommandProgramDeviceState)
	// // 		OPTIONAL MATCH (variable:CommandPeripheralProductDatapoint)<--(m:CommandDevicePeripheralMap)-->(devices), (m)-->(state)
	// // 		OPTIONAL MATCH (calibration:CommandProgramDeviceCalibration)-[:USES_DEVICE]->({id: device.id})

	// // 		RETURN collect(state{
	// // 			.*, 
	// // 			foreignKey: variable.key, 
	// // 			min: coalesce( calibration.min, state.min ),
	// // 			max: coalesce( calibration.max, state.max )
	// // 		}) as state
	// // 	}

	// // 	OPTIONAL MATCH (devices)-[pluginRel:HAS_PLUGIN]->(plugins:CommandDevicePlugin)
	// // 	CALL {
	// // 		WITH plugins
	// // 		OPTIONAL MATCH (plugins)-[:USES_PLUGIN]->(plugin:CommandProgramDevicePlugin)
	// // 		OPTIONAL MATCH (plugins)-[:USES_KV]->(config:CommandKeyValue)
	// // 		OPTIONAL MATCH (plugins)-[:WHEN_FLOW]->(flow:CommandProgramFlow)
	// // 		RETURN collect(config{.*}) as pluginConfig, flow{.*} as pluginFlow, plugin{.*} as _plugin
	// // 	}
	// // 	WITH device {
	// // 		.*,
	// // 		plugins: collect(plugins{
	// // 			.*,
	// // 			plugin: _plugin,
	// // 			rules: pluginFlow,
	// // 			configuration: pluginConfig
	// // 		})
	// // 	}, template, devices, state

	// // 	CALL {
	// // 		WITH devices

	// // 		OPTIONAL MATCH (devices)-[:HAS_INTERLOCK]->(interlock:CommandInterlock), (interlock)-[:HAS_INPUT]->(interlock_input:CommandProgramDevicePlaceholder), (interlock)-[:HAS_INPUT_KEY]->(interlock_key:CommandProgramDeviceState), (interlock)-[:USE_SAFETY_ACTION]->(interlock_actions:CommandProgramDeviceAction), (interlock)-[:HAS_ASSERTION]->(interlock_assertion:CommandInterlockAssertion)
	// // 		OPTIONAL MATCH (interlock_assertion)-[:USES_SETPOINT]->(interlock_setpoint:CommandDeviceSetpoint)

	// // 		RETURN collect(interlock{
	// // 			.*,
	// // 			inputKey: interlock_key{
	// // 				.*
	// // 			},
	// // 			input: interlock_input{
	// // 				.*
	// // 			},
	// // 			action: interlock_actions{
	// // 				.*
	// // 			},
	// // 			assertion: interlock_assertion{
	// // 				.*, 
	// // 				setpoint: interlock_setpoint{ .* }
	// // 			}
	// // 		}) as interlocks
	// // 	}
	// // 	RETURN device {
	// // 		.*,
	// // 		interlocks: interlocks,
	// // 		state: state
	// // 	}

	// // 	`, {
	// // 		id: deviceId
	// // 	})
	// 	return assignment.mappedDevices || [] //assignment //.records.map((x) => x.get(0))
	// }

	async getDeviceActions(deviceId: string) {
		const actions = await this.requestGraphQL(gql`
		query GetDeviceActions($id: String){
			commandDevices(where: {network_name: $id}){
				activeProgram {
					id

					interface {
						actions {
							id
							name
						}
					}
				}
			}
		}`, { id: deviceId })

		// const actions = await tx.run(`
		// 	MATCH (device:CommandDevice {network_name: $id})-->(:CommandProgram)-->(:CommandProgramHMI)-[:HAS_ACTION]->(action:CommandProgramAction)-->(flow:CommandProgramFlow)
		// 	RETURN action{.*, flows: collect(flow{.*})}
		// `, {
		// 	id: deviceId
		// })
		return actions?.commandDevices?.[0]?.activeProgram?.interface?.actions || [] //.records.map((x) => x.get(0))
	}

	async getDeviceProgram(deviceId: string) : Promise<PayloadResponse> {

		let assertionSelector = `
			inputDevice {
				id
				name
			}	
			inputDeviceKey {
				key
			}
			comparator
			assertion {
				setpoint {
					id
					value
				}
				variable {
					name
				}
				value
			}
		`
		let programSelector = `
			id
			name
			nodes {
				id
				type
				actions{
					id
					request{
						key
					}
					device{
						id
						name
					}
				}
				subprocess{
					id
				}
				timer {
					value
					unit
				}
			}

			edges {
				id
				from {
					id
				}
				to {
					id
				}
				conditions {
					id
					${assertionSelector}
				}
			}
		`
		let doc = gql`
			query GetProgram($networkName: String) {
				commandDevices(where: {network_name: $networkName}){

					calibrations {
						placeholder {
							id
						}
						stateItem {
							id
						}
						min
						max
					}

					setpoints {
						id
						setpoint {
							id
							name
							device {
								id
							}
						}
						value
					}

					peripherals {
						id
						name
					
						mappedDevices {
							id
							port
						
							key {
								id
								key
							}
							device {
								id
								name

								type {
									id
									name

									actions {
										key
										func
									}
	
									state { 
										key
										type
									}
								}
								
							

								interlocks {
									inputDevice {
										id
									}
									inputDeviceKey {
										key
									}
									comparator
									assertion {
										setpoint {
											id
											value
										}
										variable {
											name
										}
										value
									}
									action {
										key
									}
								}

								plugins {
									id
								}
							}

							value {
								id
								key
							}
						}
					}

					activeProgram {
						id
						name

						variables {
							id
							name
							type
							defaultValue
						}

						devices {
							id
							name
							type {
								id
								name

								state {
									id
									key
									type

									min
									max

									writable
								}

								actions {
									key
									func
								}
							}

							units {
								inputUnit
								displayUnit
							} 
											
							interlocks {
								${assertionSelector}
								action {
									id
									key
								}
							}

							dataInterlocks {
								${assertionSelector}
								deviceKey {
									id
									key
								}
							}
							setpoints {
								id
								name
								value
							} 
							plugins {
								id
								plugin {
									name
									tick
								}
								rules {
									id
								}
								config {
									key {
										id
										key
									}
									value
								}
							}
						}

						program {
							${programSelector}

							children {
								${programSelector}
							}
						}
					}
				}
			}
		`

		const program = await this.requestGraphQL(doc, { networkName: deviceId })

	

		const device = program?.commandDevices?.[0]
		const activeProgram = device?.activeProgram || [];

		const setpointOverrides = device?.setpoints || []

		const setpoints = activeProgram?.devices?.map((device: any) => {
			return device?.setpoints?.map((setpoint: any) => {
				let value = setpointOverrides?.find((a: any) => a.setpoint?.id == setpoint.id)?.value || setpoint.value;
				return {
					id: setpoint.id,
					name: setpoint.name,
					device: {id: device.id, name: device.name},
					value
				}
			})
		}).reduce((prev: any[], curr: any[]) => prev.concat(curr), [])
		
		const calibrations = device?.calibrations;

		const devices =  (activeProgram?.devices || []).map((active_device: any) => {
			let mappedDevice = device?.peripherals?.map((x: any) => x.mappedDevices.map((map: any) => ({...map, bus: x.id}))).reduce((prev: any, curr: any) => prev.concat(curr), [])

			return {
				id: active_device?.id,
				name: active_device?.name,
				type: active_device?.type?.name,
				actions: active_device?.type?.actions || [],
				state: active_device?.type?.state?.map((state_item: any) => {
					
					const mapped = mappedDevice?.find((a: any) => a.device?.id == active_device.id && a.value?.id == state_item.id)
					const calibration = calibrations?.find((a: any) => a.placeholder?.id == active_device.id && a.stateItem?.id == state_item.id)
					// console.log("STATE", JSON.stringify({mappedDevice, peripherals: device.peripherals, id: state_item.id, mapped}))

					let calibrationUpdate : any = {};
					if(calibration?.min) calibrationUpdate.min = calibration?.min || state_item?.min;
					if(calibration?.max) calibrationUpdate.max = calibration?.max || state_item?.max;

					if(typeof(calibration?.min) == "string") calibration.min = parseFloat(calibration.min)
					if(typeof(calibration?.max) == "string") calibration.max = parseFloat(calibration.max)

					return {
						...state_item,
						...calibrationUpdate,
						foreignKey: mapped?.key?.key,
						bus: mapped?.bus,
						port: mapped?.port,
					}
				}),
				plugins: active_device?.plugins || [],
				interlocks: active_device?.interlocks || [],
				dataInterlocks: active_device?.dataInterlocks || []
			}
		});
		
		// device?.peripherals?.map((x: any) => x.mappedDevices.map((dev: any) => ({
		// 	...dev.device?.type, 
		// 	...dev.device, 
		// 	type: dev.device?.type?.name, 
		// 	actions: dev.device?.type?.actions, 
		// 	state: dev.device?.type?.state?.map((state: any) => {
		// 		return {
		// 			...state, 
		// 			foreignKey: s
		// 		}
		// 	}), 
		// 	bus: x.id, 
		// 	port: x.port
		// }))).reduce((prev: any, curr: any) => prev.concat(curr), []) || []; // mappedDevices || [];
		const variables = activeProgram?.variables || [];

		console.log({activeProgram: JSON.stringify(device) })

		return {
			payload: {
				program: (activeProgram?.program || []), 
				variables, 
				setpoints,
				layout: devices
			}
		}
	}

	async updateDeviceUptime(deviceId: string, uptime: number) {

		await this.requestGraphQL(gql`
			mutation UpdateDeviceUptime ($id: ID, $uptime: DateTime) {
				updateCommandDeviceUptime(id: $id, uptime: $uptime){
					id
				}
			}
		`, {
			id: deviceId,
			uptime: new Date(uptime)
		})

		// await this.session.writeTransaction(async (tx) => {
		// 	return await tx.run(`
		// 		MATCH (device:CommandDevice {network_name: $id})
		// 		SET device.uptime = $uptime
		// 		RETURN device
		// 	`, {
		// 		id: deviceId,
		// 		uptime: uptime
		// 	})
		// })
	}

	async updateDeviceValue(deviceId: string, placeholder: string, key: string, value: string) {
		console.log({ deviceId, placeholder, key, value });
		//TODO do this locally to save graphql from dying
		await this.requestGraphQL(gql`
			mutation UpdateDeviceValue($deviceId: ID, $placeholder: String, $key: String, $value: String){
				updateCommandDevice(where: {id: $deviceId}, input: {deviceSnapshot: [{placeholder: $placeholder, key: $key, value: $value}]}){
					id
				}
			}
		`, {
			deviceId,
			placeholder,
			key,
			value: `${value}`
		})
	}

	async upsertDevicePeripherals(deviceId: string, connected: {
		id: string,
		name: string,
		type: string,
		devices?: {
			port: string,
			inputs: {
				key: string,
				type: string
			}[],
			outputs: {
				key: string,
				type: string
			}[],
			product: string,
			vendorId: string,
			deviceId: string,
			serial: string
		}[]
	}[]) {


		await this.requestGraphQL(gql`
			mutation UsertDevicePeripherals($network_name: String, $peripherals: [CommandDevicePeripheralInput]){
				updateCommandDevice(where: {network_name: $network_name}, input: {peripherals: $peripherals}){
					id
				}
			}
		`, {
			network_name: deviceId,
			peripherals: connected.map((conn) => ({
				id: conn.id,
				name: conn.name,
				type: conn.type,
				connectedDevices: conn.devices?.map((device) => ({
					port: device.port,
					name: device.product,
					vendorId: `${device.vendorId}`,
					deviceId: `${device.deviceId}`,
					id: device.serial,

					connections: (device.inputs || []).map((x) => ({ ...x, direction: 'input' })).concat((device.outputs || []).map((x) => ({ ...x, direction: 'output' }))).map((dev_conn) => ({
						key: dev_conn.key,
						type: dev_conn.type,
						direction: dev_conn.direction
					}))
				})),
				ports: 0
			}))
		});
		// const device = await this.session.writeTransaction(async (tx) => {
		// 	const peripheral_result = await tx.run(`
		// 		MATCH (device:CommandDevice {network_name: $id})-[:HAS_PERIPHERAL]->(peripherals:CommandDevicePeripheral)
		// 		RETURN peripherals
		// 	`, {
		// 		id: deviceId
		// 	})
		// 	const peripherals = peripheral_result.records.map((x) => x.get(0).properties)

		// 	//Set all peripherals that aren't present in connected to offline
		// 	await Promise.all(peripherals.filter((a) => connected.map((x) => x.id).indexOf(a.id) < 0).map(async (peripheral) => {
		// 		return await tx.run(`
		// 			MATCH (device:CommandDevice {network_name: $id})-[:HAS_PERIPHERAL]->(peripheral:CommandDevicePeripheral {id: $peripheralId})
		// 			SET peripheral.connected = false
		// 			RETURN peripheral
		// 		`, {
		// 			id: deviceId,
		// 			peripheralId: peripheral.id
		// 		})
		// 	}))

		// 	//Upser connected devices
		// 	await Promise.all(connected.map(async (peripheral) => {
		// 		peripheral.id = `${peripheral.id}`

		// 		//SET fields on existing
		// 		const peripheralUpdate = await tx.run(`
		// 			MATCH (device:CommandDevice {network_name: $id})
		// 			MERGE (device)-[r:HAS_PERIPHERAL]->(peripheral:CommandDevicePeripheral {id: $peripheralId})
		// 			ON MATCH
		// 				SET peripheral.connected = true
		// 			ON CREATE
		// 				SET peripheral.connected = true,
		// 					peripheral.type = $type,
		// 					peripheral.name = $name
		// 			RETURN peripheral
		// 		`, {
		// 			id: deviceId,
		// 			peripheralId: peripheral.id,
		// 			name: peripheral.name,
		// 			type: peripheral.type
		// 		})


		// 			if(peripheral.devices){
		// 				console.log("Creating devices linked", JSON.stringify(peripheral.devices))
		// 				//In future check for existing product serial on other Device->Peripherals to see if they have been switched
		// 				await Promise.all(peripheral.devices.filter(({serial, port, product, deviceId, vendorId}) => serial && port && product && deviceId && vendorId).map(async (device) => {
		// 					await tx.run(`
		// 						MATCH (peripheral:CommandDevicePeripheral {id: $peripheralId})
		// 						MERGE (connected:CommandDevicePeripheralProduct {id: $serial})-[:IS_CONNECTED {port: $port}]->(peripheral)
		// 						ON CREATE
		// 							SET connected.name = $product, 
		// 								connected.deviceId = $deviceId,
		// 								connected.vendorId = $vendorId
		// 						RETURN connected
		// 					`, {
		// 						peripheralId: peripheral.id,
		// 						serial: device.serial,
		// 						product: device.product,
		// 						deviceId: device.deviceId,
		// 						vendorId: device.vendorId,
		// 						port: device.port
		// 					})

		// 					console.log("DEVICE", device.inputs, device.outputs)
		// 					await Promise.all((
		// 						(device.inputs || []).map((x) => ({...x, direction: 'in'}))
		// 						.concat((device.outputs || [])
		// 						.map((x) => ({...x, direction: 'out'}))))
		// 						.map(async (connection) => {
		// 							console.log("TRYING TO CREATE_HAS_VAR", device, connection)
		// 						await tx.run(`
		// 							MATCH (product:CommandDevicePeripheralProduct {id: $serial})
		// 							MERGE (product)-[r:HAS_VARIABLE]->(connection:CommandPeripheralProductDatapoint {key: $key})
		// 							ON CREATE
		// 								SET connection.type = $type,
		// 									connection.direction = $direction
		// 							RETURN connection
		// 						`, {
		// 							serial: device.serial,
		// 							key: connection.key,
		// 							type: connection.type,
		// 							direction: connection.direction
		// 						})
		// 					}))

		// 				}))

		// 			}
		// 		// }else{
		// 		// 	if(peripheral.devices){
		// 		// 		console.log("Updating devices linked", JSON.stringify(peripheral.devices))
		// 		// 		//In future check for existing product serial on other Device->Peripherals to see if they have been switched
		// 		// 		await Promise.all(peripheral.devices.map(async (device) => {
		// 		// 			const setUpdate = await tx.run(`
		// 		// 				MATCH (peripheral:CommandDevicePeripheral {id: $peripheralId})<-[oldConnections:IS_CONNECTED {port: $port}]-(devices)
		// 		// 				MATCH (connected:CommandDevicePeripheralProduct {id: $serial})
		// 		// 				SET connected.name = $product, connected.deviceId = $deviceId, connected.vendorId = $vendorId
		// 		// 				DELETE oldConnections
		// 		// 				CREATE (connected)-[:IS_CONNECTED {port: $port}]->(peripheral)
		// 		// 				RETURN connected
		// 		// 			`, {
		// 		// 				peripheralId: peripheral.id,
		// 		// 				serial: device.serial,
		// 		// 				product: device.product,
		// 		// 				deviceId: device.deviceId,
		// 		// 				vendorId: device.vendorId,
		// 		// 				port: device.port
		// 		// 			})

		// 		// 			console.log("DEVICE", device.inputs, device.outputs)


		// 		// 			if(setUpdate.records.length < 1){
		// 		// 				//Create
		// 		// 				await tx.run(`
		// 		// 					MATCH (peripheral:CommandDevicePeripheral {id: $peripheralId})
		// 		// 					CREATE (connected:CommandDevicePeripheralProduct {id: $serial, name: $product, deviceId: $deviceId, vendorId: $vendorId})
		// 		// 					CREATE (connected)-[:IS_CONNECTED {port: $port}]->(peripheral)
		// 		// 					RETURN connected
		// 		// 				`, {
		// 		// 					peripheralId: peripheral.id,
		// 		// 					serial: device.serial,
		// 		// 					product: device.product,
		// 		// 					deviceId: device.deviceId,
		// 		// 					vendorId: device.vendorId,
		// 		// 					port: device.port
		// 		// 				})

		// 		// 				// await Promise.all((
		// 		// 				// 	(device.inputs || []).map((x) => ({...x, direction: 'in'}))
		// 		// 				// 	.concat((device.outputs || [])
		// 		// 				// 	.map((x) => ({...x, direction: 'out'}))))
		// 		// 				// 	.map(async (connection) => {
		// 		// 				// 		console.log("TRYING TO CREATE_HAS_VAR", device, connection)
		// 		// 				// 	// await tx.run(`
		// 		// 				// 	// 	MATCH (product:CommandDevicePeripheralProduct {id: $serial})
		// 		// 				// 	// 	CREATE (connection:CommandPeripheralProductDatapoint {key: $key, type: $type, direction: $direction})
		// 		// 				// 	// 	CREATE (product)-[:HAS_VARIABLE]->(connection)
		// 		// 				// 	// `, {
		// 		// 				// 	// 	serial: device.serial,
		// 		// 				// 	// 	key: connection.key,
		// 		// 				// 	// 	type: connection.type,
		// 		// 				// 	// 	direction: connection.direction
		// 		// 				// 	// })
		// 		// 				// }))

		// 		// 			}else{
		// 		// 				// await Promise.all((
		// 		// 				// 	(device.inputs || []).map((x) => ({...x, direction: 'in'}))
		// 		// 				// 	.concat((device.outputs || [])
		// 		// 				// 	.map((x) => ({...x, direction: 'out'}))))
		// 		// 				// 	.map(async (connection) => {
		// 		// 				// 	// 	console.log("TRYING TO CREATE_HAS_VAR", device, connection)
		// 		// 				// 	// 	const item = await tx.run(`
		// 		// 				// 	// 		MATCH (product:CommandDevicePeripheralProduct {id: $serial})-[:HAS_VARIABLE]->(conn:CommandPeripheralProductDatapoint {key: $key})
		// 		// 				// 	// 		SET conn.type = $type
		// 		// 				// 	// 		RETURN conn
		// 		// 				// 	// 	`, {
		// 		// 				// 	// 		serial: device.serial,
		// 		// 				// 	// 		key: connection.key,
		// 		// 				// 	// 		type: connection.type
		// 		// 				// 	// 	})

		// 		// 				// 	// 	if(item.records.length < 1){
		// 		// 				// 	// 		await tx.run(`
		// 		// 				// 	// 			MATCH (product:CommandDevicePeripheralProduct {id: $serial})
		// 		// 				// 	// 			CREATE (connection:CommandPeripheralProductDatapoint {key: $key, type: $type, direction: $direction})
		// 		// 				// 	// 			CREATE (product)-[:HAS_VARIABLE]->(connection)
		// 		// 				// 	// 		`, {
		// 		// 				// 	// 			serial: device.serial,
		// 		// 				// 	// 			key: connection.key,
		// 		// 				// 	// 			type: connection.type,
		// 		// 				// 	// 			direction: connection.direction
		// 		// 				// 	// 		})
		// 		// 				// 	// }
		// 		// 				// }))
		// 		// 			}
		// 		// 		}))

		// 		// 	}
		// 		// }
		// 	}))
		// })
	}
}