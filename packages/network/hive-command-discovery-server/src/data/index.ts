import { nanoid } from 'nanoid';
import neo4j, { Driver, Session, Transaction } from 'neo4j-driver'

export class Data {

	private driver : Driver;

	private session: Session;

	constructor(opts: {uri?: string, user?: string, pass?: string}){
		this.driver = neo4j.driver(
			opts.uri || process.env.NEO4J_URI || "localhost",
			neo4j.auth.basic(opts.user || process.env.NEO4J_USER || "neo4j", opts.pass || process.env.NEO4J_PASSWORD || "test")
		)

		this.session = this.driver.session()
	}

	async readTransaction(transaction: (tx: Transaction) => Promise<any>){
		return await this.session.readTransaction(async (tx) => {
			return await transaction(tx)
		})
	}

	async getDevice(deviceId: string){
		const device = await this.session.run(`
			MATCH (device:CommandDevice {network_name: $id})-[:HAS_PERIPHERAL]->(peripherals:CommandDevicePeripheral)
			RETURN device{
				.*,
				peripherals: collect(peripherals{.*})
			}
		`, {
			id: deviceId
		})
		return device.records?.[0]?.get(0)
	}

	async getDevicePeripherals(deviceId: string){
		const device = await this.session.run(`
			MATCH (device:CommandDevice {network_name: $id})-[:HAS_PERIPHERAL]->(peripherals:CommandDevicePeripheral)
			RETURN peripherals{.*}
		`, {
			id: deviceId
		})
		return device.records?.map((x) => x.get(0))
	}

	async removeWaitingAction(deviceId: string, waitingId: string){
		await this.session.run(`
			MATCH (device:CommandDevice {id: $id})-[rel:WAITING_FOR {id: $waitingId}]->(:CommandProgramAction)
			DELETE rel
		`, {
			id: deviceId,
			waitingId: waitingId
		})
	}

	async getDeviceAssignment(tx: Transaction, deviceId: string){
		const assignment = await tx.run(`
		MATCH p = (device:CommandDevice {network_name: $id})-[:HAS_PERIPHERAL]->(peripherals:CommandDevicePeripheral)-[mapping:HAS_MAPPING]->(map:CommandDevicePeripheralMap)-[:USES_DEVICE]->(devices)-[:USES_TEMPLATE]->(template:CommandProgramDevice)
		OPTIONAL MATCH (template)-[:HAS_ACTION]->(actions:CommandProgramDeviceAction)
		WITH devices {
			.*,
			type: template.type,
			port: mapping.port,
			bus: peripherals.id,
			actions: collect(actions{.*})
		} as device, devices, template


		CALL {
			WITH devices, template, device
			UNWIND devices as deviceItem
			OPTIONAL MATCH (devices)-->(template)-[:HAS_STATE]->(state:CommandProgramDeviceState)
			OPTIONAL MATCH (variable:CommandPeripheralProductDatapoint)<--(m:CommandDevicePeripheralMap)-->(devices), (m)-->(state)
			OPTIONAL MATCH (calibration:CommandProgramDeviceCalibration)-[:USES_DEVICE]->({id: device.id})

			RETURN collect(state{
				.*, 
				foreignKey: variable.key, 
				min: coalesce( calibration.min, state.min ),
				max: coalesce( calibration.max, state.max )
			}) as state
		}
		
		OPTIONAL MATCH (devices)-[pluginRel:HAS_PLUGIN]->(plugins:CommandDevicePlugin)
		CALL {
			WITH plugins
			OPTIONAL MATCH (plugins)-[:USES_PLUGIN]->(plugin:CommandProgramDevicePlugin)
			OPTIONAL MATCH (plugins)-[:USES_KV]->(config:CommandKeyValue)
			OPTIONAL MATCH (plugins)-[:WHEN_FLOW]->(flow:CommandProgramFlow)
			RETURN collect(config{.*}) as pluginConfig, flow{.*} as pluginFlow, plugin{.*} as _plugin
		}
		WITH device {
			.*,
			plugins: collect(plugins{
				.*,
				plugin: _plugin,
				rules: pluginFlow,
				configuration: pluginConfig
			})
		}, template, devices, state
		
		CALL {
			WITH devices

			OPTIONAL MATCH (devices)-[:HAS_INTERLOCK]->(interlock:CommandInterlock), (interlock)-[:HAS_INPUT]->(interlock_input:CommandProgramDevicePlaceholder), (interlock)-[:HAS_INPUT_KEY]->(interlock_key:CommandProgramDeviceState), (interlock)-[:USE_SAFETY_ACTION]->(interlock_actions:CommandProgramDeviceAction), (interlock)-[:HAS_ASSERTION]->(interlock_assertion:CommandInterlockAssertion)
			OPTIONAL MATCH (interlock_assertion)-[:USES_SETPOINT]->(interlock_setpoint:CommandDeviceSetpoint)

			RETURN collect(interlock{
				.*,
				inputKey: interlock_key{
					.*
				},
				input: interlock_input{
					.*
				},
				action: interlock_actions{
					.*
				},
				assertion: interlock_assertion{
					.*, 
					setpoint: interlock_setpoint{ .* }
				}
			}) as interlocks
		}
		RETURN device {
			.*,
			interlocks: interlocks,
			state: state
		}
		
		`, {
			id: deviceId
		})
		return assignment.records.map((x) => x.get(0))
	}

	async getDeviceProgramMap(tx: Transaction, deviceId: string){
		const programMap = await tx.run(`
			MATCH (device:CommandDevice {network_name: $id})-[:RUNNING_PROGRAM]->(program:CommandProgram)-[*..]->(flow:CommandProgramFlow)

			
		`, {
			id: deviceId
		})

	}
	async getDeviceProgram(tx: Transaction, deviceId: string){

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
		const program = await tx.run(`
	
MATCH (device:CommandDevice {network_name: $id})-[:RUNNING_PROGRAM]->(program:CommandProgram)-[:USES_FLOW|HAS_SUBFLOW *..]->(flow:CommandProgramFlow)
CALL {
	WITH flow
	OPTIONAL MATCH (flow)-[:USES_NODE]->(nodes:CommandProgramNode)

	CALL {
		WITH nodes
		OPTIONAL MATCH (nodes)-[:HAS_CONF]->(configuration:CommandProgramNodeConfiguration)
		OPTIONAL MATCH (nodes)-[:HAS_ACTION]->(actionItem:CommandActionItem), (actionItem)-[:USES_ACTION]->(actions), (actionItem)-[:ACTIONS]->(target)
		OPTIONAL MATCH (nodes)-[:USES_SUBFLOW]->(subflow:CommandProgramFlow)

		RETURN collect(actions{.*, target: target.name, release: actionItem.release}) as _actions, collect(configuration{.*}) as _configuration, subflow{.*} as _subflow
	}
	
	CALL {
		WITH nodes
		OPTIONAL MATCH (nodes)-[next:USE_NEXT]->(nextNodes)
		OPTIONAL MATCH (conf:CommandProgramNodeFlowConfiguration)-[:HAS_INPUT]->(input), (conf)-[:HAS_INPUT_KEY]->(inputKey)
				WHERE conf.id IN next.conditions
				RETURN nextNodes{ 
					.*, 
					target: nextNodes.id,
					conditions: collect(conf{
						.*, 
						input: input.name,
						inputKey: inputKey.key
					}) 
				} as next
	}
	
	RETURN nodes{.*, next: collect(next), actions: _actions, configuration: _configuration, subprocess: _subflow} as flowNodes
}
			OPTIONAL MATCH (flow)<-[:USES_SUBFLOW]-()<-[:USES_NODE]-(parent:CommandProgramFlow)

RETURN flow{
	.*,
	parent: parent{.*},
	nodes: collect(flowNodes)
}

		`, {
			id: deviceId
		})

		return program.records.map((x) => x.get(0))
	}

	async updateDeviceUptime(deviceId: string, uptime: number){
		await this.session.writeTransaction(async (tx) => {
			return await tx.run(`
				MATCH (device:CommandDevice {network_name: $id})
				SET device.uptime = $uptime
				RETURN device
			`, {
				id: deviceId,
				uptime: uptime
			})
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
	}[]){
		const device = await this.session.writeTransaction(async (tx) => {
			const peripheral_result = await tx.run(`
				MATCH (device:CommandDevice {network_name: $id})-[:HAS_PERIPHERAL]->(peripherals:CommandDevicePeripheral)
				RETURN peripherals
			`, {
				id: deviceId
			})
			const peripherals = peripheral_result.records.map((x) => x.get(0).properties)

			//Set all peripherals that aren't present in connected to offline
			await Promise.all(peripherals.filter((a) => connected.map((x) => x.id).indexOf(a.id) < 0).map(async (peripheral) => {
				return await tx.run(`
					MATCH (device:CommandDevice {network_name: $id})-[:HAS_PERIPHERAL]->(peripheral:CommandDevicePeripheral {id: $peripheralId})
					SET peripheral.connected = false
					RETURN peripheral
				`, {
					id: deviceId,
					peripheralId: peripheral.id
				})
			}))

			//Upser connected devices
			await Promise.all(connected.map(async (peripheral) => {
				peripheral.id = `${peripheral.id}`

				//SET fields on existing
				const peripheralUpdate = await tx.run(`
					MATCH (device:CommandDevice {network_name: $id})
					MERGE (device)-[r:HAS_PERIPHERAL]->(peripheral:CommandDevicePeripheral {id: $peripheralId})
					ON MATCH
						SET peripheral.connected = true
					ON CREATE
						SET peripheral.connected = true,
							peripheral.type = $type,
							peripheral.name = $name
					RETURN peripheral
				`, {
					id: deviceId,
					peripheralId: peripheral.id,
					name: peripheral.name,
					type: peripheral.type
				})

				
					if(peripheral.devices){
						console.log("Creating devices linked", JSON.stringify(peripheral.devices))
						//In future check for existing product serial on other Device->Peripherals to see if they have been switched
						await Promise.all(peripheral.devices.filter(({serial, port, product, deviceId, vendorId}) => serial && port && product && deviceId && vendorId).map(async (device) => {
							await tx.run(`
								MATCH (peripheral:CommandDevicePeripheral {id: $peripheralId})
								MERGE (connected:CommandDevicePeripheralProduct {id: $serial})-[:IS_CONNECTED {port: $port}]->(peripheral)
								ON CREATE
									SET connected.name = $product, 
										connected.deviceId = $deviceId,
										connected.vendorId = $vendorId
								RETURN connected
							`, {
								peripheralId: peripheral.id,
								serial: device.serial,
								product: device.product,
								deviceId: device.deviceId,
								vendorId: device.vendorId,
								port: device.port
							})

							console.log("DEVICE", device.inputs, device.outputs)
							await Promise.all((
								(device.inputs || []).map((x) => ({...x, direction: 'in'}))
								.concat((device.outputs || [])
								.map((x) => ({...x, direction: 'out'}))))
								.map(async (connection) => {
									console.log("TRYING TO CREATE_HAS_VAR", device, connection)
								await tx.run(`
									MATCH (product:CommandDevicePeripheralProduct {id: $serial})
									MERGE (product)-[r:HAS_VARIABLE]->(connection:CommandPeripheralProductDatapoint {key: $key})
									ON CREATE
										SET connection.type = $type,
											connection.direction = $direction
									RETURN connection
								`, {
									serial: device.serial,
									key: connection.key,
									type: connection.type,
									direction: connection.direction
								})
							}))
						
						}))

					}
				// }else{
				// 	if(peripheral.devices){
				// 		console.log("Updating devices linked", JSON.stringify(peripheral.devices))
				// 		//In future check for existing product serial on other Device->Peripherals to see if they have been switched
				// 		await Promise.all(peripheral.devices.map(async (device) => {
				// 			const setUpdate = await tx.run(`
				// 				MATCH (peripheral:CommandDevicePeripheral {id: $peripheralId})<-[oldConnections:IS_CONNECTED {port: $port}]-(devices)
				// 				MATCH (connected:CommandDevicePeripheralProduct {id: $serial})
				// 				SET connected.name = $product, connected.deviceId = $deviceId, connected.vendorId = $vendorId
				// 				DELETE oldConnections
				// 				CREATE (connected)-[:IS_CONNECTED {port: $port}]->(peripheral)
				// 				RETURN connected
				// 			`, {
				// 				peripheralId: peripheral.id,
				// 				serial: device.serial,
				// 				product: device.product,
				// 				deviceId: device.deviceId,
				// 				vendorId: device.vendorId,
				// 				port: device.port
				// 			})

				// 			console.log("DEVICE", device.inputs, device.outputs)
				

				// 			if(setUpdate.records.length < 1){
				// 				//Create
				// 				await tx.run(`
				// 					MATCH (peripheral:CommandDevicePeripheral {id: $peripheralId})
				// 					CREATE (connected:CommandDevicePeripheralProduct {id: $serial, name: $product, deviceId: $deviceId, vendorId: $vendorId})
				// 					CREATE (connected)-[:IS_CONNECTED {port: $port}]->(peripheral)
				// 					RETURN connected
				// 				`, {
				// 					peripheralId: peripheral.id,
				// 					serial: device.serial,
				// 					product: device.product,
				// 					deviceId: device.deviceId,
				// 					vendorId: device.vendorId,
				// 					port: device.port
				// 				})

				// 				// await Promise.all((
				// 				// 	(device.inputs || []).map((x) => ({...x, direction: 'in'}))
				// 				// 	.concat((device.outputs || [])
				// 				// 	.map((x) => ({...x, direction: 'out'}))))
				// 				// 	.map(async (connection) => {
				// 				// 		console.log("TRYING TO CREATE_HAS_VAR", device, connection)
				// 				// 	// await tx.run(`
				// 				// 	// 	MATCH (product:CommandDevicePeripheralProduct {id: $serial})
				// 				// 	// 	CREATE (connection:CommandPeripheralProductDatapoint {key: $key, type: $type, direction: $direction})
				// 				// 	// 	CREATE (product)-[:HAS_VARIABLE]->(connection)
				// 				// 	// `, {
				// 				// 	// 	serial: device.serial,
				// 				// 	// 	key: connection.key,
				// 				// 	// 	type: connection.type,
				// 				// 	// 	direction: connection.direction
				// 				// 	// })
				// 				// }))

				// 			}else{
				// 				// await Promise.all((
				// 				// 	(device.inputs || []).map((x) => ({...x, direction: 'in'}))
				// 				// 	.concat((device.outputs || [])
				// 				// 	.map((x) => ({...x, direction: 'out'}))))
				// 				// 	.map(async (connection) => {
				// 				// 	// 	console.log("TRYING TO CREATE_HAS_VAR", device, connection)
				// 				// 	// 	const item = await tx.run(`
				// 				// 	// 		MATCH (product:CommandDevicePeripheralProduct {id: $serial})-[:HAS_VARIABLE]->(conn:CommandPeripheralProductDatapoint {key: $key})
				// 				// 	// 		SET conn.type = $type
				// 				// 	// 		RETURN conn
				// 				// 	// 	`, {
				// 				// 	// 		serial: device.serial,
				// 				// 	// 		key: connection.key,
				// 				// 	// 		type: connection.type
				// 				// 	// 	})

				// 				// 	// 	if(item.records.length < 1){
				// 				// 	// 		await tx.run(`
				// 				// 	// 			MATCH (product:CommandDevicePeripheralProduct {id: $serial})
				// 				// 	// 			CREATE (connection:CommandPeripheralProductDatapoint {key: $key, type: $type, direction: $direction})
				// 				// 	// 			CREATE (product)-[:HAS_VARIABLE]->(connection)
				// 				// 	// 		`, {
				// 				// 	// 			serial: device.serial,
				// 				// 	// 			key: connection.key,
				// 				// 	// 			type: connection.type,
				// 				// 	// 			direction: connection.direction
				// 				// 	// 		})
				// 				// 	// }
				// 				// }))
				// 			}
				// 		}))

				// 	}
				// }
			}))
		})
	}
}