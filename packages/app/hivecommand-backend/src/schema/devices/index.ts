import { PrismaClient } from "@hive-command/data";
import gql from "graphql-tag";
import { mergeResolvers, mergeTypeDefs } from '@graphql-tools/merge'
import { nanoid } from "nanoid";
import { Pool } from "pg";
import analytics from "./analytics";
import reports from './reports';

import { Channel } from "amqplib";
import { GraphQLContext } from "../../context";
import { PubSubChannels, redis } from "../../context/pubsub";
import { subject } from '@casl/ability'

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
export default (prisma: PrismaClient) => {

	const {typeDefs: analyticTypeDefs, resolvers: analyticResolvers} = analytics(prisma)
	const {typeDefs: reportTypeDefs, resolvers: reportResolvers} = reports(prisma);
	
	const resolvers = mergeResolvers([
		analyticResolvers,
		reportResolvers,
		{
			DeviceAlarm: {
				ack: (root: any) => {
					// console.log({root})
					return root.ackBy?.id != null && root.ackBy?.id != undefined
				}
			},
			CommandDevice: {
				analyticPages: async (root: any, args: any, content: any) => {
					let reportWhere : any = {};
					if(args?.where?.ids){
						reportWhere = {id: { in: args?.where?.ids }}
					}
	
					const device = await prisma.device.findFirst({
						where: {
							id: root.id,
						},
						include: {
							analyticPages: {
								where: reportWhere,
								include: {
									charts: {
										include: {
											tag: {
												include: {
													type: true
												}
											},
											subkey: true,
											page: {
												include: {
													device: true
												}
											}
										}
									},
									device: true
								}
							},
						}
					})
					
					return device?.analyticPages || [];
				},
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
						const results = await redis.HGETALL(`device:${root.id}:values`);

						result = Object.keys(results).map((r) => {
							return {
								deviceId: root.id,
								placeholder: r?.split(':')?.[0],
								key: r?.split(':')?.[1],
								value: results?.[r]
							}
						})
						// //Get data from mongocache
						// result = await prisma.deviceValue.findMany({
						// 	where: {
						// 		deviceId: root.id,
						// 	},
						// 	orderBy: {
						// 		lastUpdated: 'desc'
						// 	},
						// 	distinct: ['deviceId', 'placeholder', 'key']
						// })

						// result = await cache.DeviceValue.find({
						// 	deviceId: root.id
						// });
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
				if(
					!context.jwt.acl.can('read', 'CommandDevice') &&
					!context.jwt.acl.can('control', 'CommandDevice')
				) throw new Error("Not allowed to access device list");

		
				let whereArg : any = {};
				if(args.where){
					if(args.where.id) whereArg['id'] = args.where.id;
					if(args.where.network_name) whereArg['network_name'] = args.where.network_name;
				}

				const devices = await prisma.device.findMany({
					where: {organisation: context.jwt.organisation, ...whereArg}, 
					include: {
						maintenanceWindows: true,
						alarms: {
							include: {
								cause: true
							}
						},
						screens: true,
						reports: {
							include: {
								instances: true,
								fields: {
									include: {
										device: {
											include: {
												type: true
											}
										},
										key: true
									}
								}
							}
						},
						// values: {
						// 	where: {lastUpdated: {gt: new Date()}},
						// 	orderBy: {lastUpdated: 'desc'},
						// },

				
						activeProgram: {
							include: {
								remoteHomepage: true,
								localHomepage: true,
								templatePacks: true,
								alarms: true,
								components: {
									include: {
										main: true,
										properties: {
											include: {
												type: true
											}
										},
										files: true
									}
								},
								tags: {
									include: {
										type: true
									}
								},
								types: {
									include: {
										fields: true
									}
								},
								interface: {
									include: {
										nodes: {
											include: {
												dataTransformer: {
													include: {
														configuration: {
															include: {
																field: true
															}
														},
														template: {
															include: {
																outputs: true,
																inputs: true,
																edges: {
																	include: {
																		to: true,
																		from: true
																	}
																}
															}
														}
													}
												},
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
									}
								},
								
							}
						}
					}
				}) || []

				return devices.filter((device) => {
					const sub = subject('CommandDevice', device);
					return context.jwt.acl.can('read', sub) || context.jwt.acl.can('control', sub)
				})?.map((device) => {
					return {
						...device,
						alarms: device?.alarms?.map((alm) => ({ ...alm, ackBy: alm.ackBy ? {id: alm.ackBy} : undefined }))
					}
				});
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
			acknowledgeCommandDeviceAlarm: async (root: any, args: any, context: any) => {
				const sub = subject('CommandDevice', {id: args.device, organisation: context?.jwt?.organisation});

				if(!context.jwt.acl.can('control', sub)){
					throw new Error("Access to alarms not allowed");
				}

				const alm = await prisma.alarm.findFirst({
					where: {
						id: args.alarm,
						device: {
							id: args.device,
							organisation: context?.jwt?.organisation
						}
					}
				})

				if(!alm?.ackBy != null && alm?.ackAt != null) throw new Error("Alarm already acknowledged");

				const alarm = await prisma.alarm.update({
					where: {
						id: args.alarm,
						device: {
							id: args.device,
							organisation: context?.jwt?.organisation
						}
					},
					data: {
						ackBy: context?.jwt?.id,
						ackAt: new Date()
					}
				})
				return alarm != null;

			},
			unacknowledgeCommandDeviceAlarm: async (root: any, args: any, context: any) => {
				const sub = subject('CommandDevice', {id: args.device, organisation: context?.jwt?.organisation});

				if(!context.jwt.acl.can('control', sub)){
					throw new Error("Access to alarms not allowed");
				}

				const alarm = await prisma.alarm.update({
					where: {
						id: args.alarm,
						device: {
							id: args.device,
							organisation: context?.jwt?.organisation
						}
					},
					data: {
						ackBy: null,
						ackAt: null
					}
				})
				return alarm != null;
			},
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
			}
		}
	}])

	//		waitingForActions: [CommandProgramAction] 


	/*

	*/
	const typeDefs = mergeTypeDefs([
		analyticTypeDefs,
		reportTypeDefs,
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

		acknowledgeCommandDeviceAlarm(device: ID, alarm: ID): Boolean
		unacknowledgeCommandDeviceAlarm(device: ID, alarm: ID): Boolean
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

		deviceSnapshot(where: CommandDeviceSnapshotWhere): [CommandDeviceSnapshot]

		alarms: [DeviceAlarm]

		operatingMode: String
		operatingState: String

		online: Boolean
		lastSeen: DateTime

		analyticPages(where: CommandAnalyticPageWhere): [CommandAnalyticPage] 
		reports: [CommandDeviceReport]

		organisation: HiveOrganisation 

		createdAt: DateTime
	}

	
	type DeviceAlarm {
		id: ID

		message : String

		severity : String
	  
		cause : CommandProgramAlarm
	  
		ack : Boolean
		ackBy : HiveUser
		ackAt : DateTime
	  
		createdAt : DateTime
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

	

	`]);

	return {
		typeDefs,
		resolvers
	}
}