import { nanoid } from 'nanoid';
import { request, gql, RequestDocument, Variables } from 'graphql-request'

export interface DataOptions {
	gatewayURL?: string;
	apiKey?: string;
}

export class Data {

	private options : DataOptions;

	constructor(opts: DataOptions){
		this.options = opts;

	}

	async requestGraphQL(document: RequestDocument, variables: Variables){
		if(!this.options.gatewayURL) return console.error('No gatewayURL set');
		
		try{
			const response = await request(
				this.options.gatewayURL, 
				document, 
				variables, 
				{
					'Authorization': `API-Key ${this.options.apiKey}`
				}
			)
			return response

		}catch(error){
			console.error(`Error sending GraphQL: `, error)
		}
	}


	async getDeviceByNetID(deviceId: string){

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


	async removeWaitingAction(deviceId: string, waitingId: string){
		// await this.session.run(`
		// 	MATCH (device:CommandDevice {id: $id})-[rel:WAITING_FOR {id: $waitingId}]->(:CommandProgramAction)
		// 	DELETE rel
		// `, {
		// 	id: deviceId,
		// 	waitingId: waitingId
		// })
	}

	async getDeviceAssignment(deviceId: string){
		const assignment = await this.requestGraphQL(gql`
			query GetDevices ($networkName: String){
				commandDevices(where: {network_name: $networkName}) {
					id

				
					activeProgram {

						devices {
							id
						}
					}
				}
			}
		`, {})
	// 	const assignment = await tx.run(`
	// 	MATCH p = (device:CommandDevice {network_name: $id})-[:HAS_PERIPHERAL]->(peripherals:CommandDevicePeripheral)-[mapping:HAS_MAPPING]->(map:CommandDevicePeripheralMap)-[:USES_DEVICE]->(devices)-[:USES_TEMPLATE]->(template:CommandProgramDevice)
	// 	OPTIONAL MATCH (template)-[:HAS_ACTION]->(actions:CommandProgramDeviceAction)
	// 	WITH devices {
	// 		.*,
	// 		type: template.type,
	// 		port: mapping.port,
	// 		bus: peripherals.id,
	// 		actions: collect(actions{.*})
	// 	} as device, devices, template


	// 	CALL {
	// 		WITH devices, template, device
	// 		UNWIND devices as deviceItem
	// 		OPTIONAL MATCH (devices)-->(template)-[:HAS_STATE]->(state:CommandProgramDeviceState)
	// 		OPTIONAL MATCH (variable:CommandPeripheralProductDatapoint)<--(m:CommandDevicePeripheralMap)-->(devices), (m)-->(state)
	// 		OPTIONAL MATCH (calibration:CommandProgramDeviceCalibration)-[:USES_DEVICE]->({id: device.id})

	// 		RETURN collect(state{
	// 			.*, 
	// 			foreignKey: variable.key, 
	// 			min: coalesce( calibration.min, state.min ),
	// 			max: coalesce( calibration.max, state.max )
	// 		}) as state
	// 	}
		
	// 	OPTIONAL MATCH (devices)-[pluginRel:HAS_PLUGIN]->(plugins:CommandDevicePlugin)
	// 	CALL {
	// 		WITH plugins
	// 		OPTIONAL MATCH (plugins)-[:USES_PLUGIN]->(plugin:CommandProgramDevicePlugin)
	// 		OPTIONAL MATCH (plugins)-[:USES_KV]->(config:CommandKeyValue)
	// 		OPTIONAL MATCH (plugins)-[:WHEN_FLOW]->(flow:CommandProgramFlow)
	// 		RETURN collect(config{.*}) as pluginConfig, flow{.*} as pluginFlow, plugin{.*} as _plugin
	// 	}
	// 	WITH device {
	// 		.*,
	// 		plugins: collect(plugins{
	// 			.*,
	// 			plugin: _plugin,
	// 			rules: pluginFlow,
	// 			configuration: pluginConfig
	// 		})
	// 	}, template, devices, state
		
	// 	CALL {
	// 		WITH devices

	// 		OPTIONAL MATCH (devices)-[:HAS_INTERLOCK]->(interlock:CommandInterlock), (interlock)-[:HAS_INPUT]->(interlock_input:CommandProgramDevicePlaceholder), (interlock)-[:HAS_INPUT_KEY]->(interlock_key:CommandProgramDeviceState), (interlock)-[:USE_SAFETY_ACTION]->(interlock_actions:CommandProgramDeviceAction), (interlock)-[:HAS_ASSERTION]->(interlock_assertion:CommandInterlockAssertion)
	// 		OPTIONAL MATCH (interlock_assertion)-[:USES_SETPOINT]->(interlock_setpoint:CommandDeviceSetpoint)

	// 		RETURN collect(interlock{
	// 			.*,
	// 			inputKey: interlock_key{
	// 				.*
	// 			},
	// 			input: interlock_input{
	// 				.*
	// 			},
	// 			action: interlock_actions{
	// 				.*
	// 			},
	// 			assertion: interlock_assertion{
	// 				.*, 
	// 				setpoint: interlock_setpoint{ .* }
	// 			}
	// 		}) as interlocks
	// 	}
	// 	RETURN device {
	// 		.*,
	// 		interlocks: interlocks,
	// 		state: state
	// 	}
		
	// 	`, {
	// 		id: deviceId
	// 	})
		return [] //assignment //.records.map((x) => x.get(0))
	}

	async getDeviceActions(deviceId: string){
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
		}`, {id: deviceId})

		// const actions = await tx.run(`
		// 	MATCH (device:CommandDevice {network_name: $id})-->(:CommandProgram)-->(:CommandProgramHMI)-[:HAS_ACTION]->(action:CommandProgramAction)-->(flow:CommandProgramFlow)
		// 	RETURN action{.*, flows: collect(flow{.*})}
		// `, {
		// 	id: deviceId
		// })
		return actions?.commandDevices?.[0]?.activeProgram?.interface?.actions || [] //.records.map((x) => x.get(0))
	}

	async getDeviceProgram(deviceId: string){

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
					}
				}
				subprocess{
					id
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

								state {
									key
									type
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
								}
							}
							setpoints {
								id
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
									key
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

		const program = await this.requestGraphQL(doc, {id: deviceId})
		/*
		MATCH (device:CommandDevice {network_name: $id})-[:RUNNING_PROGRAM]->(program:CommandProgram)-[*..]->(flow:CommandProgramFlow)
			MATCH (flow)-[:USES_NODE]->(nodes:CommandProgramNode)
			OPTIONAL MATCH (nodes)-[next:USE_NEXT]->(n)
			OPTIONAL MATCH (nodes)-[:HAS_ACTION]->(actionItem:CommandActionItem), (actionItem)-[:USES_ACTION]->(actions), (actionItem)-[:ACTIONS]->(target)
			CALL {
				WITH next, nodes
				OPTIONAL MATCH (nodes)-[:HAS_CONF]->(configuration:CommandProgramNodeConfiguration)
				OPTIONAL MATCH (conf:CommandProgramNodeFlowConfiguration)-[:HAS_INPUT]->(input), (conf)-[:HAS_INPUT_KEY]->(inputKey)
				WHERE conf.id IN next.conditions
				RETURN collect(conf{
					.*, 
					input: input.name,
					inputKey: inputKey.key
				}) as conditions, configuration
			}
			OPTIONAL MATCH (nodes)-[:USES_SUBFLOW]->(subflow:CommandProgramFlow)
			OPTIONAL MATCH (flow)<-[:USES_SUBFLOW]-()<-[:USES_NODE]-(parent:CommandProgramFlow)
			WITH nodes{
					.*, 
					configuration: collect(
						configuration{
							.*
						}
					),
					subprocess: subflow{
						.*
					},
					actions: collect(
						actions{
							.*,
							target: target.name
						}
					),
					next: collect(
						next{
							.*, 
							target: n.id,
							conditions: conditions
						}
					) 
				} as flowNodes, flow, parent
			RETURN flow{
				.*,
				parent: parent{.*},
				nodes: collect(flowNodes)
			}

		*/
// 		const program = await tx.run(`
	
// MATCH (device:CommandDevice {network_name: $id})-[:RUNNING_PROGRAM]->(program:CommandProgram)-[:USES_FLOW|HAS_SUBFLOW *..]->(flow:CommandProgramFlow)
// CALL {
// 	WITH flow
// 	OPTIONAL MATCH (flow)-[:USES_NODE]->(nodes:CommandProgramNode)

// 	CALL {
// 		WITH nodes
// 		OPTIONAL MATCH (nodes)-[:HAS_CONF]->(configuration:CommandProgramNodeConfiguration)
// 		OPTIONAL MATCH (nodes)-[:HAS_ACTION]->(actionItem:CommandActionItem), (actionItem)-[:USES_ACTION]->(actions), (actionItem)-[:ACTIONS]->(target)
// 		OPTIONAL MATCH (nodes)-[:USES_SUBFLOW]->(subflow:CommandProgramFlow)

// 		RETURN collect(actions{.*, target: target.name, release: actionItem.release}) as _actions, collect(configuration{.*}) as _configuration, subflow{.*} as _subflow
// 	}
	
// 	CALL {
// 		WITH nodes
// 		OPTIONAL MATCH (nodes)-[next:USE_NEXT]->(nextNodes)
// 		OPTIONAL MATCH (conf:CommandProgramNodeFlowConfiguration)-[:HAS_INPUT]->(input), (conf)-[:HAS_INPUT_KEY]->(inputKey)
// 				WHERE conf.id IN next.conditions
// 				RETURN nextNodes{ 
// 					.*, 
// 					target: nextNodes.id,
// 					conditions: collect(conf{
// 						.*, 
// 						input: input.name,
// 						inputKey: inputKey.key
// 					}) 
// 				} as next
// 	}
	
// 	RETURN nodes{.*, next: collect(next), actions: _actions, configuration: _configuration, subprocess: _subflow} as flowNodes
// }

// OPTIONAL MATCH (flow)<-[:HAS_SUBFLOW]-(parent:CommandProgramFlow)

// RETURN flow{
// 	.*,
// 	parent: parent{.*},
// 	nodes: collect(flowNodes)
// }

// 		`, {
// 			id: deviceId
// 		})

		return program?.commandDevices?.[0]?.activeProgram
	}

	async updateDeviceUptime(deviceId: string, uptime: number){
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
	}[]){

		await this.requestGraphQL(gql`
			mutation UsertDevicePeripherals($network_name: String, $peripherals: [CommandDevicePeripheralInput]){
				updateCommandDevices(where: {network_name: $network_name}, input: {peripherals: $peripherals}){
					id
				}
			}
		`, {
			network_name: deviceId,
			peripherals: connected.map((conn) => ({
				id: conn.id,
				name: conn.name,
				type: conn.type
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