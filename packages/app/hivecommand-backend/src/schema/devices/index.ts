import { PrismaClient } from "@prisma/client";
import gql from "graphql-tag";
import { mergeResolvers, mergeTypeDefs } from '@graphql-tools/merge'
import { nanoid } from "nanoid";
import { Pool } from "pg";
import analytics from "./analytics";

export default (prisma: PrismaClient, pool: Pool) => {

	const {typeDefs: analyticTypeDefs, resolvers: analyticResolvers} = analytics(prisma, pool)
	
	const resolvers = mergeResolvers([
		analyticResolvers,
		{
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
						reports: {
							include: {
								dataKey: true,
								dataDevice: true,
								device: true,
							}
						},
						deviceSnapshot: true,
						peripherals: {
							include: {
								connectedDevices: true,
								mappedDevices: {
									include: {
										device: true,
										key: true,
										value: true
									}
								}
							}
						},
						activeProgram: {
							include: {
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
												conditions: true
											}
										}
									}
								},
								interface: {
									include: {
										nodes: {
											include: {
												type: true,
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
														type: true,
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
				console.log({devices})
				return devices;
			}
		},
		Mutation: {
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

				if(args.input.peripherals){
					peripheralUpdate['peripherals'] = {
						upsert: args.input.peripherals.map((peripheral) => {
							let id = peripheral.id || nanoid()
							return {
								where: {id},
								update: {
									name: peripheral.name,
									type: peripheral.type,
									ports: peripheral.ports,
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
									name: peripheral.name,
									type: peripheral.type,
									ports: peripheral.ports
								}
							}
						})
					}	
				}

				if(args.input.deviceSnapshot && args.where.id) {
					deviceUpdate['deviceSnapshot'] = {
						upsert: args.input.deviceSnapshot.map((snapshot) => ({
							where: {
								key_placeholder_deviceId: {
									key: snapshot.key,
									placeholder: snapshot.placeholder,
									deviceId: args.where.id,
								}
							},
							update: {
								value: snapshot.value
							},
							create: {
								id: nanoid(),
								key: snapshot.key,
								placeholder: snapshot.placeholder,
								deviceId: args.where.id,
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
		`

	
	type Query {
		commandDevices(where: CommandDeviceWhere): [CommandDevice]!
	}

	type Mutation {
		createCommandDevice(input: CommandDeviceInput!): CommandDevice!
		updateCommandDevice(where: CommandDeviceWhere!, input: CommandDeviceInput!): CommandDevice!
		updateCommandDeviceUptime(where: CommandDeviceWhere!, uptime: DateTime): CommandDevice!
		deleteCommandDevice(where: CommandDeviceWhere!): CommandDevice!
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

	type CommandDevice  {
		id: ID! 
		name: String

		activeProgram: CommandProgram 

		network_name: String

		calibrations: [CommandProgramDeviceCalibration] 

		peripherals: [CommandDevicePeripheral] 
		
		deviceSnapshot: [CommandDeviceSnapshot]

		operatingMode: String
		operatingState: String

		waitingForActions: [CommandProgramAction]

		online: Boolean
		lastOnline: DateTime

		reports: [CommandDeviceReport] 

		organisation: HiveOrganisation 
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

	type CommandProgramDeviceCalibration {
		id: ID 
		rootDevice: CommandDevice 

		device: CommandProgramDevicePlaceholder 
		deviceKey: CommandProgramDeviceState 

		min: String
		max: String
	}

	type CommandDevicePeripheralProduct {
		id:ID 
		deviceId: String
		vendorId: String
		name: String

		peripheral: CommandDevicePeripheral 

		connections: [CommandPeripheralProductDatapoint]
	}

	type CommandPeripheralProductDatapoint {
		direction: String
		key: String
		type: String

		product: CommandDevicePeripheralProduct
	}

	type CommandDevicePeripheralMap {
		id: ID! 
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