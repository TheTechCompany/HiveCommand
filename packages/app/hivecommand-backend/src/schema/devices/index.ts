import { PrismaClient, cache } from "@hive-command/data";
import gql from "graphql-tag";
import { mergeResolvers, mergeTypeDefs } from '@graphql-tools/merge'
import { nanoid } from "nanoid";
import { Pool } from "pg";
import analytics from "./analytics";
import { Channel } from "amqplib";
import { GraphQLContext } from "../../context";
import { PubSubChannels, redis } from "../../context/pubsub";

const Moniker = require('moniker')

const withCancel = (asyncIterator: AsyncIterator<any>, onCancel: () => void) => {
	const asyncReturn = asyncIterator.return;
  
	asyncIterator.return = () => {
		console.log("Async Cancel")
	  onCancel();
	  return asyncReturn ? asyncReturn.call(asyncIterator) : Promise.resolve({ value: undefined, done: true });
	};
  
	return asyncIterator;
};

// //TODO move this out of memory
// const watching = {

// }
export default (prisma: PrismaClient, mq: Channel) => {

	const {typeDefs: analyticTypeDefs, resolvers: analyticResolvers} = analytics(prisma)
	
	const resolvers = mergeResolvers([
		analyticResolvers,
		{
			CommandDevice: {
				deviceSnapshot: async (root: any, args: any, context: any) => {

					const result = await cache.DeviceValue.find({
						deviceId: root.id
					})
					return result;

					// return await prisma.$queryRaw`
					// 	SELECT latest.* FROM (
					// 		SELECT DISTINCT placeholder, key, "deviceId", MAX("lastUpdated") as latest FROM "DeviceValue"
					// 		WHERE "deviceId"=${root.id}
					// 		GROUP BY placeholder, key, "deviceId"
					// 	) AS uniq
					// 	JOIN "DeviceValue" latest ON uniq.placeholder = latest.placeholder 
					// 	AND uniq."deviceId" = latest."deviceId" 
					// 	AND uniq.latest = latest."lastUpdated" 
					// 	AND uniq.key = latest.key					
					// `
				}
			},
		Query: {
			commandDevices: async (root: any, args: any, context: any) => {
				let whereArg : any = {};
				if(args.where){
					if(args.where.id) whereArg['id'] = args.where.id;
					if(args.where.network_name) whereArg['network_name'] = args.where.network_name;
				}


				const devices = await prisma.device.findMany({
					where: {organisation: context.jwt.organisation, ...whereArg}, 
					include: {
						maintenanceWindows: true,
						alarms: true,
						screens: true,
						dataLayout: {
							include: {
								children: true
							}
						},
						setpoints: {
							include: {
								setpoint: {
									include: {
										device: true,
										key: true
									}
								}
							}
						},
						calibrations: {
							include: {
								placeholder: true,
								stateItem: true
							}
						},
						reports: {
							include: {
								reports: {
									include: {
										dataKey: true,
										dataDevice: true,
									}
								},
								device: true
							}
						},
						// values: {
						// 	where: {lastUpdated: {gt: new Date()}},
						// 	orderBy: {lastUpdated: 'desc'},
						// },
						peripherals: {
							include: {
								connectedDevices: {
									include: {
										connections: true 
									}
								},
								mappedDevices: {
									include: {
										device: {
											include: {
												type: {
													include: {
														actions: true,
														state: true
													}
												}
											}
										},
										key: true,
										value: true
									}
								}
							}
						},
						activeProgram: {
							include: {
								remoteHomepage: true,
								localHomepage: true,
								templatePacks: true,
								program: {
									include: {
										children: {
											include: {
												nodes: {
													include: {
														actions: {
															include: {
																request: true,
																device: true
															}
														},
														subprocess: {
															include: {
																program: true
															}
														},
													}
												},
												edges: {
													include: {
														from: true,
														to: true,
														conditions: {
															include: {
																inputDevice: true,
																inputDeviceKey: true,
																assertion: {
																	include: {
																		setpoint: true,
																		variable: true
																	}
																}
															}
														}
													}
												}
											}
										},
										nodes: {
											include: {
												actions: {
													include: {
														request: true,
														device: true
													}
												},
												subprocess: {
													include: {
														program: true
													}
												},
											}
										},
										edges: {
											include: {
												from: true,
												to: true,
												conditions: {
													include: {
														inputDevice: true,
														inputDeviceKey: true,
														assertion: {
															include: {
																setpoint: true,
																variable: true
															}
														}
													}
												}
											}
										}
									}
								},
								interface: {
									include: {
										nodes: {
											include: {
												devicePlaceholder: {
													include: {
														type: {
															include: {
																actions: true,
																state: true
															}
														},
														setpoints: true,
														interlocks: {
															include: {
																device: true,
																inputDevice: true,
																inputDeviceKey: true,
																assertion: {
																	include: {
																		setpoint: true,
																		variable: true
																	}
																},
																action: true
															}
														}
													}
												},
												children: {
													include: {
														devicePlaceholder: {
															include: {
																type: {
																	include: {
																		actions: true,
																		state: true
																	}
																},
																setpoints: true,
																interlocks: {
																	include: {
																		device: true,
																		inputDevice: true,
																		inputDeviceKey: true,
																		assertion: {
																			include: {
																				setpoint: true,
																				variable: true
																			}
																		},
																		action: true
																	}
																}
															}
														}
													}
												},
												ports: true
											}
										}, 
										edges: {
											include: {
												from: true, to: true
											}
										}, 
										actions: true
									}
								},
								
							}
						}
					}
				}) || []

				return devices;
			}
		},
		Subscription: {
			watchingDevice: {
				subscribe: async (root: any, args: any, context: GraphQLContext) => {
					console.log("Subscribe to watchingDevice", {args, pubSub: context.pubSub})

					const redisTag = `watchingDevice:${args.device}`

					const iter = context.pubSub.asyncIterator(`${redisTag}-channel`);

					await context.redis.incr(`${redisTag}:${(context as any)?.jwt?.id}`)
					// await context.redis.expire(`${rdisTag}:${(context as any)?.jwt?.id}`, 5)
					
					await context.redis.expire(`${redisTag}:${(context as any)?.jwt?.id}`, 45);

					let interval: any;

					new Promise(() => {
						interval = setInterval(async () => {
							await context.redis.expire(`${redisTag}:${(context as any)?.jwt?.id}`, 45);

							const ttl = await context.redis.ttl(`${redisTag}:${(context as any)?.jwt?.id}`);

							console.log({ttl})
						}, 30 * 1000)
					})
					// await co	ntext.redis.sAdd(redisTag, (context as any)?.jwt?.id)

					let watching : any[] = [];

					for await (const key of context.redis.scanIterator({
						MATCH: `${redisTag}:*`,
						COUNT: 0,
					})){
						// console.log({key})
						watching.push(key.match(/(.+):(.+):(.+)/)?.[3])
					}

			
					// const items = await context.redis.scan(0, [`${redisTag}:*`]);

					// console.log({items});

					// const watching = await context.redis.sMembers(redisTag)
					setTimeout(async () => {
						await context.pubSub.publish(`${redisTag}-channel`, {watchers: watching.map((x) => ({id: x}))})
					}, 100);

					const asyncReturn = iter.return;

					iter.return = async () => {
						console.log("Cancel");

						clearInterval(interval);

						const redisTag = `watchingDevice:${args.device}`

						const count = await context.redis.decr(`${redisTag}:${(context as any)?.jwt?.id}`)
						console.log({count})
						if(count <= 0){
							await context.redis.del([`${redisTag}:${(context as any)?.jwt?.id}`])

							// await context.redis.sRem(redisTag, (context as any)?.jwt?.id)
							let watching : any[] = [];

							for await (const key of context.redis.scanIterator({
								MATCH: `${redisTag}:*`,
								COUNT: 0,
							})){
								// console.log({key})
								watching.push(key.match(/(.+):(.+):(.+)/)?.[3])
							}
		
							// const watching = await context.redis.sMembers(redisTag)
							
							await context.pubSub.publish(`${redisTag}-channel`, {watchers: watching.map((x) => ({id: x}))})
						}
					  	return asyncReturn ? asyncReturn.call(iter) : Promise.resolve({ value: undefined, done: true });
					}

					return iter 
					// withCancel(iter, async () => {
					// 	console.log("Unsubscribe", {context, args})
					// 	const redisTag = `watchingDevice:${args.device}`
	
					// 	await context.redis.sRem(redisTag, (context as any)?.jwt?.id)
	
					// 	const watching = await context.redis.sMembers(redisTag)
						
					// 	await context.pubSub.publish(`${redisTag}-channel`, {watchers: watching.map((x) => ({id: x}))})
					
					// }) //context.pubSub.asyncIterator("watchingDevice");
				},
				resolve: (payload: any) => {
					console.log("Send new info", {payload})
					return payload.watchers;
				}
			}
		},
		Mutation: {

			createDeviceScreen: async (root: any, args: any, context: any) => {
				
				const device = await prisma.device.findFirst({where: {id: args.device, organisation: context?.jwt?.organisation}});
				if(!device) return new Error(`No device found in organisation with id ${args.device}`);

				return await prisma.deviceScreen.create({
					data: {
						id: nanoid(),
						name: args.input.name,
						provisionCode: Moniker.choose(),
						provisioned: false,
						device: {
							connect: {id: device.id}
						}
					}
				});
			},
			updateDeviceScreen: async (root: any, args: any, context: any) => {

				const device = await prisma.device.findFirst({where: {id: args.device, organisation: context?.jwt?.organisation}});
				if(!device) return new Error(`No device found in organisation with id ${args.device}`);

				return await prisma.deviceScreen.update({
					where: {id: args.id},
					data: {
						name: args.input.name,
					}
				})
			},
			deleteDeviceScreen: async (root: any, args: any, context: any) => {
				return await prisma.deviceScreen.deleteMany({where: {id: args.id, device: {id: args.device, organisation: context?.jwt?.organisation } }})
			},
			createCommandDeviceMaintenanceWindow: async (root: any, args: any, context: any) => {
				return await prisma.maintenanceWindow.create({
					data: {
						id: nanoid(), 
						startTime: args.input.startTime, 
						endTime: args.input.endTime,
						owner: context?.jwt?.id,
						device: {
							connect: {id: args.device}
						}
					}
				});
			},
			updateCommandDeviceMaintenanceWindow: async (root: any, args: any, context: any) => {
				return await prisma.maintenanceWindow.update({where: {id: args.id}, data: {startTime: args.input.startTime, endTime: args.input.endTime}});
			},
			deleteCommandDeviceMaintenanceWindow: async (root: any, args: any, context: any) => {
				return await prisma.maintenanceWindow.delete({where: {id: args.id}});
			},
			updateCommandDeviceSetpoint: async (root: any, args: {device: string, setpoint: string, value: string}, context: any) => {

				const result = await prisma.device.update({
					where: {id: args.device},
					data: {
						setpoints: {
							upsert: [{
								where: {
									setpointId_deviceId: {
										setpointId: args.setpoint,
										deviceId: args.device
									}
								},
								update: {
									value: args.value
								},
								create: {
									id: nanoid(),
									value: args.value,
									setpointId: args.setpoint
								}
							}]
						}
					},
					include: {
						setpoints: {
							include: {
								setpoint: {
									include: {
										device: true
									}
								},
								device: true
							}
						}
					}
				})
			
				const setpoint = result?.setpoints?.find((a) => a.setpoint.id == args.setpoint);

				let stateUpdate = {
					address: `opc.tcp://${result?.network_name}.hexhive.io:8440`,
					deviceName: setpoint?.setpoint.device?.name,
					deviceSetpoint:  setpoint?.setpoint.name,
					value: args.value,
					authorizedBy: context.jwt?.name
				}

				console.log("Setpoint update", {stateUpdate})

				mq.sendToQueue(`COMMAND:DEVICE:SETPOINT`, Buffer.from(JSON.stringify(stateUpdate)))

				return args.value
			},
			createCommandDevice: async (root: any, args: {input: {name: string, network_name: string, program: string}}, context: any) => {
				return await prisma.device.create({
					data: {
						id: nanoid(),
						name: args.input.name,
						network_name: args.input.network_name,
						activeProgram: {
							connect: {id: args.input.program}
						},
						organisation: context.jwt.organisation
					}
				})
			},
			updateCommandDevice: async (root: any, args: {
				where: {
					id: string, network_name: string
				}, input: {
					name: string, network_name: string, program: string, peripherals: any[], deviceSnapshot: any[]
				}
			}, context: any) => {
				let deviceUpdate : any = {};
				let peripheralUpdate : any = {};
				
				let deviceWhere : any = {};
				if(args.where.id) deviceWhere.id = args.where.id
				if(args.where.network_name) deviceWhere.network_name = args.where.network_name;

				const peripheral = await prisma.devicePeripheral.findFirst({where: {id: args.input.peripherals?.[0]?.id}});

				console.log({peripheral})

				if(args.input.peripherals){
					peripheralUpdate['peripherals'] = {
						upsert: args.input.peripherals.map((peripheral) => {
							let id = peripheral.id || nanoid()
							
							let upsertPeripheral : any = {};
							
							if(peripheral.name) upsertPeripheral.name = peripheral.name;
							if(peripheral.type) upsertPeripheral.type = peripheral.type;
							if(peripheral.ports) upsertPeripheral.ports = peripheral.ports;

							console.log("Upsert", id, {mapped: peripheral.mappedDevices})

						
							return {
								where: {
									id
								},
								update: {
									...upsertPeripheral,
									mappedDevices: {
										upsert: peripheral.mappedDevices?.map((map: any) => {
											return {
												where: {
													peripheralId_port_keyId: {
														peripheralId: id,
														port: map.port,
														keyId: map.key
													}
												},
												update: {
													valueId: map.value,
													deviceId: map.device,
													port: map.port,
													keyId: map.key
												},
												create: {
													id: nanoid(),
													valueId: map.value,
													deviceId: map.device,
													port: map.port,
													keyId: map.key
												}
											}
										})
									},
									connectedDevices: {
										upsert: peripheral.connectedDevices?.map((dev: any) => {
											let product_id = `${id}-${dev.id || nanoid()}`;
											return {
												where: {
													id: product_id
												},
												update: {
													port: dev.port,
													name: dev.name || '',
													connections: {
														upsert: dev.connections.map((connection: any) => ({
															where: {
																key_productId: {
																	key: connection.key,
																	productId: product_id
																}
															},
															update: {
																direction: connection.direction,
																key: connection.key,
																type: connection.type
															},
															create: {
																id: nanoid(),
																key: connection.key,
																type: connection.type,
																direction: connection.direction
															}
														}))
													}
												},
												create: {
													id: product_id,
													name: dev.name || '',
													vendorId: dev.vendorId,
													deviceId: dev.deviceId,
													port: dev.port,
													connections: {
														createMany: {
															data: dev.connections.map((connection: any) => ({
																id: nanoid(),
																key: connection.key,
																// productId: connection.productId,
																type: connection.type,
																direction: connection.direction
															}))
														}
													}
												}
											}
										})
									}
								},
								create: {
									id,
									name: peripheral.name || '',
									type: peripheral.type  || '',
									ports: peripheral.ports || 0,
								}
							}
						})
					}	
				}

				if(args.input.deviceSnapshot && args.where.network_name) {
					deviceUpdate['deviceSnapshot'] = {
						upsert: args.input.deviceSnapshot.map((snapshot) => ({
							where: {
								key_placeholder_deviceId: {
									key: snapshot.key,
									placeholder: snapshot.placeholder,
									deviceId: args.where.network_name,
								}
							},
							update: {
								value: snapshot.value
							},
							create: {
								id: nanoid(),
								key: snapshot.key,
								placeholder: snapshot.placeholder,
								value: snapshot.value
							}
						}))
					}
				}

				if(args.input.name) deviceUpdate['name'] = args.input.name;
				if(args.input.network_name) deviceUpdate['network_name'] = args.input.network_name;
				if(args.input.program) deviceUpdate['activeProgram'] = {connect: {id: args.input.program}}

				return await prisma.device.update({
					where: {
						...deviceWhere
					},
					data: {
						...deviceUpdate,
						...peripheralUpdate,
					}
				})
			},
			updateCommandDeviceUptime: async (root: any, args: {where: {id: any, network_name: string}, uptime: any}, context: any) => {
		

				let deviceWhere : any = {};
				if(args.where.id) deviceWhere.id = args.where.id
				if(args.where.network_name) deviceWhere.network_name = args.where.network_name;


				return await prisma.device.update({where: deviceWhere, data: {lastSeen: args.uptime}})
				
			},
			deleteCommandDevice: async (root: any, args: {where: {id: any, network_name: string}}, context: any) => {
			
				let deviceWhere : any = {};
				if(args.where.id) deviceWhere.id = args.where.id
				if(args.where.network_name) deviceWhere.network_name = args.where.network_name;

				return await prisma.device.delete({where: deviceWhere});
			},
			createCommandDeviceCalibration: async (root: any, args: any, context: any) => {
				return await prisma.deviceCalibration.create({
					data: {
						id: nanoid(),
						device: {connect: {id: args.device}},
						placeholder: {connect: {id: args.input.placeholder}},
						stateItem: {connect: {id: args.input.stateItem}},
						min: args.input.min,
						max: args.input.max
					}
				})
			},
			updateCommandDeviceCalibration: async (root: any, args: any, context: any) => {
				return await prisma.deviceCalibration.update({
					where: {
						id: args.id
					},
					data: {
						min: args.input.min,
						max: args.input.max
					}
				})
			},
			deleteCommandDeviceCalibration: async (root: any, args: any, context: any) => {
				return await prisma.deviceCalibration.delete({where: {id: args.id}})
			}

		}
	}])

	//		waitingForActions: [CommandProgramAction] 


	/*

	*/
	const typeDefs = mergeTypeDefs([
		analyticTypeDefs,
		`

	
	type Query {
		commandDevices(where: CommandDeviceWhere): [CommandDevice]!
	}

	type Mutation {
		createCommandDevice(input: CommandDeviceInput!): CommandDevice!
		updateCommandDevice(where: CommandDeviceWhere!, input: CommandDeviceInput!): CommandDevice!
		updateCommandDeviceUptime(where: CommandDeviceWhere!, uptime: DateTime): CommandDevice!
		deleteCommandDevice(where: CommandDeviceWhere!): CommandDevice!

		createDeviceScreen(device: ID, input: DeviceScreenInput!): CommandDeviceScreen
		updateDeviceScreen(device: ID, id: ID!, input: DeviceScreenInput!): CommandDeviceScreen
		deleteDeviceScreen(device: ID, id: ID!): CommandDeviceScreen


		createCommandDeviceMaintenanceWindow(device: ID, input: MaintenanceWindowInput!): MaintenanceWindow!
		updateCommandDeviceMaintenanceWindow(device: ID, id: ID!, input: MaintenanceWindowInput!): MaintenanceWindow!
		deleteCommandDeviceMaintenanceWindow(device: ID, id: ID!): MaintenanceWindow!


		updateCommandDeviceSetpoint(device: ID!, setpoint: ID!, value: String): String

		createCommandDeviceCalibration(device: ID!, input: CommandProgramDeviceCalibrationInput): CommandProgramDeviceCalibration
		updateCommandDeviceCalibration(device: ID!, id: ID!, input: CommandProgramDeviceCalibrationInput): CommandProgramDeviceCalibration
		deleteCommandDeviceCalibration(device: ID!, id: ID!): CommandProgramDeviceCalibration
	}

	type Subscription {
		watchingDevice(device: ID!): [HiveUser]
	}

	type CommandDeviceScreen {
		id: ID
		name: String

		provisionCode: String

		provisioned: Boolean
		createdAt: DateTime

		device: CommandDevice
	}

	input DeviceScreenInput {
		name: String
		developer: Boolean
	}

	input CommandDeviceInput {
		name: String
		network_name: String
		program: String
		peripherals: [CommandDevicePeripheralInput]
		deviceSnapshot: [CommandDeviceSnapshotInput]
	}

	input CommandDeviceWhere {
		id: ID
		network_name: String
	}

	type CommandDeviceSetpointCalibration {
		id: ID
		setpoint: CommandDeviceSetpoint
		value: String
	}

	type CommandDevice  {
		id: ID! 
		name: String

		screens: [CommandDeviceScreen]

		watching: [HiveUser]

		maintenanceWindows: [MaintenanceWindow]

		activeProgram: CommandProgram 

		network_name: String

		dataLayout: [DataLayout]

		calibrations: [CommandProgramDeviceCalibration] 
		setpoints: [CommandDeviceSetpointCalibration]

		peripherals: [CommandDevicePeripheral] 
		
		deviceSnapshot: [CommandDeviceSnapshot]

		alarms: [DeviceAlarm]

		operatingMode: String
		operatingState: String

		waitingForActions: [CommandProgramAction]

		online: Boolean
		lastSeen: DateTime

		reports: [CommandReportPage] 

		organisation: HiveOrganisation 
	}

	type DeviceAlarm {
		id: ID

		message: String
		cause: String

		createdAt: DateTime
	}

	input MaintenanceWindowInput {
		startTime: DateTime
		endTime: DateTime
	}

	type MaintenanceWindow {
		id: ID

		startTime: DateTime
		endTime: DateTime

		owner: String

		device: CommandDevice
	}

	

	type DataLayout {
		id: ID
		label: String
		type: String
	  
		children: [DataLayout]

		parent: DataLayout
	  
		device: CommandDevice
	}

	input CommandDeviceSnapshotInput {
		key: String
		value: String
		placeholder: String
	}

	type CommandDeviceSnapshot {
		key: String
		value: String
		placeholder: String
	}

	input CommandDevicePeripheralInput {
		id: String
		name: String
		type: String

		ports: Int
		
		mappedDevices: [PeripheralMapInput]
		connectedDevices: [CommandPeripheralProductInput]
	}

	input CommandPeripheralProductInput {
		id: String
		deviceId: String
		vendorId: String
		name: String

		port: String
		connections: [CommandPeripheralDatapointInput]
	}

	input CommandPeripheralDatapointInput {
		id: String
		direction: String
		key: String
		type: String
	}


	type CommandDevicePeripheral {
		id: ID! 
		name: String
		type: String
		
		ports: Int

		connectedDevices: [CommandDevicePeripheralProduct] 
		mappedDevices: [CommandDevicePeripheralMap] 

		device: CommandDevice 
	}

	input CommandProgramDeviceCalibrationInput {
		placeholder: String
		stateItem: String
		min: String
		max: String
	}

	type CommandProgramDeviceCalibration {
		id: ID 
		device: CommandDevice 

		placeholder: CommandProgramDevicePlaceholder 
		stateItem: CommandProgramDeviceState 

		min: String
		max: String
	}

	type CommandDevicePeripheralProduct {
		id:ID 
		deviceId: String
		vendorId: String
		name: String

		port: String

		peripheral: CommandDevicePeripheral 

		connections: [CommandPeripheralProductDatapoint]
	}

	type CommandPeripheralProductDatapoint {
		id: ID
		direction: String
		key: String
		type: String

		product: CommandDevicePeripheralProduct
	}

	input PeripheralMapInput {
		port: String
		key: String
		device: String
		value: String
	}

	type CommandDevicePeripheralMap {
		id: ID! 
		port: String
		key: CommandPeripheralProductDatapoint 
		device: CommandProgramDevicePlaceholder
		value: CommandProgramDeviceState
	}

	interface CommandDevicePeripheralPort {
		port: String
	}

	`]);

	return {
		typeDefs,
		resolvers
	}
}