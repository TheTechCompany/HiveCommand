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
														conditions: true
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
			updateCommandDevice: async (root: any, args: {id: string, input: {name: string, network_name: string, program: string}}, context: any) => {
				return await prisma.device.update({
					where: {id: args.id},
					data: {
						name: args.input.name,
						network_name: args.input.network_name,
						activeProgram: {
							connect: {id: args.input.program}
						}
					}
				})
			},
			updateCommandDeviceUptime: async (root: any, args: {id: any, uptime: any}, context: any) => {
				let query : any = {};
				
				if(args.id) query.id = args.id;

				return await prisma.device.update({where: query, data: {lastSeen: args.uptime}})
				
			},
			deleteCommandDevice: async (root: any, args: {id: string}, context: any) => {
				return await prisma.device.delete({where: {id: args.id}});
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
		updateCommandDevice(id: ID!, input: CommandDeviceInput!): CommandDevice!
		updateCommandDeviceUptime(id: ID!, uptime: DateTime): CommandDevice!
		deleteCommandDevice(id: ID!): CommandDevice!
	}

	input CommandDeviceInput {
		name: String
		network_name: String
		program: String
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
		
		operatingMode: String
		operatingState: String

		waitingForActions: [CommandProgramAction]

		online: Boolean
		lastOnline: DateTime

		reports: [CommandDeviceReport] 

		organisation: HiveOrganisation 
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