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

					let result;
					const { where } = args;

					if(where){
						//Query timeseries
						result = await prisma.deviceValue.findMany({
							where: {
								deviceId: root.id,
								lastUpdated: {
									gte: where.startDate,
									lte: where.endDate
								}
							},
							orderBy: {
								lastUpdated: 'desc'
							}
							
						})
					}else{
						//Get data from mongocache
						result = await cache.DeviceValue.find({
							deviceId: root.id
						});
					}
					// console.log(await cache.DeviceValue.find())
					

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
								charts: {
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

						deviceMapping: {
							include: {
								device: {
									include: {
										type: true
									}
								},
								deviceState: true
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
												// devicePlaceholder: {
												// 	include: {
												// 		type: {
												// 			include: {
												// 				actions: true,
												// 				state: true
												// 			}
												// 		},
												// 		setpoints: true,
												// 		interlocks: {
												// 			include: {
												// 				device: true,
												// 				inputDevice: true,
												// 				inputDeviceKey: true,
												// 				assertion: {
												// 					include: {
												// 						setpoint: true,
												// 						variable: true
												// 					}
												// 				},
												// 				action: true
												// 			}
												// 		}
												// 	}
												// },
												children: true,
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
					deviceName: setpoint?.setpoint.device?.tag,
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
						provisioned: false,
						provisionCode: Moniker.choose(),
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
			},
			connectCommandDeviceData: async (root: any, args: any, context: any) => {
				return await prisma.device.update({
					where: {
						id: args.where.id,
					},
					data: {
						deviceMapping: {
							create: [{
								id: nanoid(),
								path: args.input.path,
								deviceState: {
									connect: {id: args.input.deviceState}
								},
								device: {
									connect: {id: args.input.device}
								}
							}]
						}
					}
				})
			},
			updateCommandDeviceData: async (root: any, args: any, context: any) => {
				return await prisma.device.update({
					where: {
						id: args.where.id
					},
					data: {
						deviceMapping: {
							update: {
								where: {
									id: args.input.id
								},
								data: {
									path: args.input.path
								}
							}
						}
					}
				})
			},
			disconnectCommandDeviceData: async (root: any, args: any, context: any) => {
				return await prisma.device.update({
					where: {
						id: args.where.id
					},
					data: {
						deviceMapping: {
							delete: [{
									id: args.input.id
							}]
						}
					}
				})
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

		connectCommandDeviceData(where: CommandDeviceWhere!, input: ConnectDevicesInput!): CommandDeviceMapping
		updateCommandDeviceData(where: CommandDeviceWhere!, input: ConnectDevicesInput!): CommandDeviceMapping
		disconnectCommandDeviceData(where: CommandDeviceWhere!, input: ConnectDevicesInput!): CommandDeviceMapping

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

	input ConnectDevicesInput {
		id: ID
		device: ID
		deviceState: ID
		path: String
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

	input CommandDeviceSnapshotWhere {
		startDate: DateTime
		endDate: DateTime
		blocks: Float
	}

	type CommandDevice  {
		id: ID! 
		name: String

		provisioned: Boolean
		provisionCode: String

		screens: [CommandDeviceScreen]

		watching: [HiveUser]

		maintenanceWindows: [MaintenanceWindow]

		activeProgram: CommandProgram 

		network_name: String

		dataLayout: JSON

		deviceMapping: [CommandDeviceMapping]

		calibrations: [CommandProgramDeviceCalibration] 
		setpoints: [CommandDeviceSetpointCalibration]
		
		deviceSnapshot(where: CommandDeviceSnapshotWhere): [CommandDeviceSnapshot]

		alarms: [DeviceAlarm]

		operatingMode: String
		operatingState: String

		waitingForActions: [CommandProgramAction]

		online: Boolean
		lastSeen: DateTime

		reports: [CommandReportPage] 

		organisation: HiveOrganisation 
	}

	type CommandDeviceMapping {
		id: ID

		path: String

		deviceState: CommandProgramDeviceState 

		device: CommandProgramDevicePlaceholder
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

	

	input CommandDeviceSnapshotInput {
		key: String
		value: String
		placeholder: String
	}

	type CommandDeviceSnapshot {
		key: String
		value: String
		placeholder: String
		lastUpdated: DateTime
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

	`]);

	return {
		typeDefs,
		resolvers
	}
}