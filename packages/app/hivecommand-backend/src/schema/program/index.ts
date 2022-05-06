import { PrismaClient } from "@prisma/client";
import { mergeResolvers } from '@graphql-tools/merge'
import io from './io'
import variables from "./variables";

import gql from "graphql-tag";
import { nanoid } from "nanoid";

export default (prisma: PrismaClient) => {
	
	const { typeDefs: ioTypeDefs, resolvers: ioResolvers } = io(prisma)
	const { typeDefs: variableTypeDefs, resolvers: variableResolvers } = variables(prisma)

	const resolvers = mergeResolvers([
		{
			CommandProgram: {
				devices: async (root: any, args: any, context: any) => {
					let whereArgs : any = {program: {id: root.id}};

					if(args.where?.id) whereArgs['id'] = args.where?.id;
					
					return await prisma.programFlowIO.findMany({
						where: whereArgs,
						include: {
							type: {
								include: {
									actions: true, 
									state: true
								}
							},
							interlocks: {
								include: {
									action: true,
									inputDevice: true,
									inputDeviceKey: true,
									assertion: {
										include: {
											setpoint: true,
											variable: true
										}
									}
								}
							},
							setpoints: {
								include: {
									key: true
								}
							}
						}
					})
				},
				variables: async (root: any, args: any, context: any) => {
					return await prisma.programVariable.findMany({
						where: {program: {id: root.id}}
					})
				}
			},
			Query: {
				commandPrograms: async (root: any, args: any, context: any) => {
					let filter = args.where || {}
					return await prisma.program.findMany({
						where: {...filter, organisation: context.jwt.organisation
					}, include: {
						program: {
							include: {
								parent: true,
								children: true
							}
						},
						interface: {
							include: {
								nodes: {
									include: {
										type: true,
										devicePlaceholder: true,
										inputs: true,
										outputs: true,
										children: {
											include: {
												type: true,
												devicePlaceholder: true
											}
										},
										ports: true
									}
								},
								// groups: {
								// 	include: {
								// 		nodes: {
								// 			include: {
								// 				type: true
								// 			}
								// 		},
								// 		ports: true
								// 	}
								// },
								edges: {
									include: {
										from: true,
										to: true,
										
									}
								},
								actions: {
									include: {
										flow: true
									}
								}
							}
						}
						// devices: {include: {type: {include: {actions: true, state: true}}}}
					}});
				},
				commandProgramFlows: async (root: any, args: any) => {
					let filter : any = {};
					if(args.where.program) {
						filter['program'] = {id: args.where.program}
					}
					if(args.where.id){
						filter['id'] = args.where.id
					}

					const flow = await prisma.programFlow.findMany({
						where: filter, 
						include: {
							nodes: {
								include: {
									actions: {
										include: {device: true, request: true}
									}
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
					});
					return flow;

				}
			},
			Mutation: {
				createCommandProgram: async (root: any, args: {input: {name: string}}, context: any) => {
					const program = await prisma.program.create({
						data: {
							id: nanoid(),
							name: args.input.name,
							program: {
								create: {
									id: nanoid(),
									name: 'Default'
								}
							},
							interface: {
								create: {
									id: nanoid()
								}
							},
							organisation: context.jwt.organisation
						}
					})
					return program;
				},
				updateCommandProgram: async (root: any, args: {id: string, input: {name: string}}, context: any) => {
					const program = await prisma.program.update({
						where: {id: args.id},
						data: {
							name: args.input.name
						}
					})

					return program
				},
				deleteCommandProgram: async (root: any, args: {id: string}, context: any) => {
					const res = await prisma.program.delete({where: {id: args.id}})
					return res != null
				},

				createCommandProgramFlow: async (root: any, args: any) => {
					let parentQuery : any = {};

					if(args.input.parent){
						parentQuery['parent'] = {
							connect: {id: args.input.parent}
						}
					}else{
						parentQuery['program'] = {
							connect: {id: args.program}
						}
					}

					const flow = await prisma.programFlow.create({
						data: {
							id: nanoid(),
							name: args.input.name,
							...parentQuery,
							
						}
					})

					return flow;
				},
				updateCommandProgramFlow: async (root: any, args: any) => {
					const flow = await prisma.programFlow.update({
						where: {id: args.id},
						data: {
							name: args.input.name
						}
					})

					return flow
				},
				deleteCommandProgramFlow: async (root: any, args: any) => {
					const res = await prisma.programFlow.delete({where: {id: args.id}})
					return res != null
				},
				createCommandProgramFlowNode: async (root: any, args: any) => {
					const flowNode = await prisma.programFlowNode.create({
						data: {
							id: nanoid(),
							x: args.input.x,
							y: args.input.y,
							type: args.input.type,
							programFlow: {
								connect: {id: args.flow}
							}
						}
					})
					return flowNode
				},
				updateCommandProgramFlowNode: async (root: any, args: any) => {
					const flowNode = await prisma.programFlowNode.update({
						where: {id: args.id},
						data: {
							x: args.input.x,
							y: args.input.y,
							type: args.input.type
						}
					})
					return flowNode
				},
				deleteCommandProgramFlowNode: async (root: any, args: any) => {
					const res = await prisma.programFlowNode.delete({where: {id: args.id}})
					return res != null
				},
				createCommandProgramFlowNodeAction: async (root: any, args: any) => {
					return await prisma.programFlowNodeAction.create({
						data: {
							id: nanoid(),
							device: {
								connect: {id: args.input.device}
							},
							request: {
								connect: {id: args.input.request}
							},
							node: {
								connect: {id: args.node}
							}
						}
					})
				},
				updateCommandProgramFlowNodeAction: async (root: any, args: any) => {
					return await prisma.programFlowNodeAction.update({
						where: {id: args.id},
						data: {
							device: {
								connect: {id: args.input.device}
							},
							request: {
								connect: {id: args.input.request}
							}
						}
					})
				},
				deleteCommandProgramFlowNodeAction: async (root: any, args: any) => {
					const res = await prisma.programFlowNodeAction.delete({where: {id: args.id}})
					return res != null
				},
				createCommandProgramFlowEdge: async (root: any, args: any) => {
					return await prisma.programFlowEdge.create({
						data: {
							id: nanoid(),
							points: args.input.points,
							from: {connect: {id: args.input.from}},
							fromHandle: args.input.fromHandle,
							to: {connect: {id: args.input.to}},
							toHandle: args.input.toHandle,
							programFlow: {
								connect: {id: args.flow}
							}
						}
					})
				},
				updateCommandProgramFlowEdge: async (root: any, args: any) => {
					return await prisma.programFlowEdge.update({
						where: {id: args.id},
						data: {
							points: args.input.points,
							from: {connect: {id: args.input.from}},
							fromHandle: args.input.fromHandle,
							to: {connect: {id: args.input.to}},
							toHandle: args.input.toHandle
						}
					})
				},
				deleteCommandProgramFlowEdge: async (root: any, args: any) => {
					const res = await prisma.programFlowEdge.delete({where: {id: args.id}})
					return res != null
				},
				createCommandProgramFlowEdgeCondition: async (root: any, args: any) => {
					let assertionCreate : any = {

					};
					if(args.input.assertion.type == 'value'){
						assertionCreate['value'] = args.input.assertion.value;
					}else if(args.input.assertion.type == 'setpoint'){
						assertionCreate['setpoint'] = {
							connect: {id: args.input.assertion.setpoint}
						}
					}else if(args.input.assertion.type == 'variable'){
						assertionCreate['variable'] = {
							connect: {id: args.input.assertion.variable}
						}
					}
					return await prisma.programFlowEdgeCondition.create({
						data: {
							id: nanoid(),
							inputDevice: {
								connect: {id: args.input.inputDevice}
							},
							inputDeviceKey: {
								connect: {id: args.input.inputDeviceKey}
							},
							comparator: args.input.comparator,
							assertion: {
								create: {
									id: nanoid(),
									type: args.input.assertion.type,
									...assertionCreate
								}
							}, 
							edge: {
								connect: {id: args.edge}
							}
							
						}
					})
				},
				updateCommandProgramFlowEdgeCondition: async (root: any, args: any) => {
					let update : any = {};

					let assertionUpdate : any = {};
					if(args.input){
						if(args.input.inputDeviceKey) update['inputDeviceKey'] = {connect: {id: args.input.inputDeviceKey}}
						if(args.input.inputDevice) update['inputDevice'] = {connect: {id: args.input.inputDevice}}

						if(args.input.assertion.type == 'value'){
							assertionUpdate['value'] = args.input.assertion.value;
							assertionUpdate['setpoint'] = {
								disconnect: true
							}
							assertionUpdate['variable'] = {
								disconnect: true
							}
						}else if(args.input.assertion.type == 'setpoint'){
							assertionUpdate['value'] = undefined
							assertionUpdate['setpoint'] = {
								connect: {id: args.input.assertion.setpoint}
							}
							assertionUpdate['variable'] = {
								disconnect: true
							}
						}else if(args.input.assertion.type == 'variable'){
							assertionUpdate['variable'] = {
								connect: {id: args.input.assertion.variable}
							}
							assertionUpdate['setpoint'] = {
								disconnect: true
							}
							assertionUpdate['value'] = undefined
						}
					}
					return await prisma.programFlowEdgeCondition.update({
						where: {id: args.id},
						data: {
							...update,
							comparator: args.input.comparator,
							assertion: {
								update: {
									type: args.input.assertion.type,
									...assertionUpdate
								}
							}
						}
					})
				},
				deleteCommandProgramFlowEdgeCondition: async (root: any, args: any) => {
					const res = await prisma.programFlowEdgeCondition.delete({where: {id: args.id}})
					return res != null
				}
			}
		},
		ioResolvers,
		variableResolvers
	])
	
	const typeDefs = `

	${ioTypeDefs}
	${variableTypeDefs}

	type Query {
		commandPrograms(where: CommandProgramWhere): [CommandProgram]!
		commandProgramFlows(where: CommandProgramFlowWhere): [CommandProgramFlow]!
	}

	type Mutation {
		createCommandProgram(input: CommandProgramInput!): CommandProgram!
		updateCommandProgram(id: ID!, input: CommandProgramInput!): CommandProgram!
		deleteCommandProgram(id: ID!): Boolean!

		createCommandProgramFlow(program: ID, input: CommandProgramFlowInput!): CommandProgramFlow!
		updateCommandProgramFlow(program: ID, id: ID!, input: CommandProgramFlowInput!): CommandProgramFlow!
		deleteCommandProgramFlow(program: ID, id: ID!): Boolean!

		createCommandProgramFlowNode(program: ID, flow: ID, input: CommandProgramFlowNodeInput!): CommandProgramNode!
		updateCommandProgramFlowNode(program: ID, flow: ID, id: ID!, input: CommandProgramFlowNodeInput!): CommandProgramNode!
		deleteCommandProgramFlowNode(program: ID, flow: ID, id: ID!): Boolean!

		createCommandProgramFlowNodeAction(program: ID, flow: ID, node: ID, input: CommandProgramFlowNodeActionInput!): CommandActionItem!
		updateCommandProgramFlowNodeAction(program: ID, flow: ID, node: ID, id: ID, input: CommandProgramFlowNodeActionInput!): CommandActionItem!
		deleteCommandProgramFlowNodeAction(program: ID, flow: ID, node: ID, id: ID!): Boolean!

		createCommandProgramFlowEdge(program: ID, flow: ID, input: CommandProgramFlowEdgeInput!): CommandProgramEdge!
		updateCommandProgramFlowEdge(program: ID, flow: ID, id: ID!, input: CommandProgramFlowEdgeInput!): CommandProgramEdge!
		deleteCommandProgramFlowEdge(program: ID, flow: ID, id: ID!): Boolean!

		createCommandProgramFlowEdgeCondition(program: ID, flow: ID, edge: ID, input: CommandProgramFlowEdgeConditionInput!): CommandProgramEdgeCondition!
		updateCommandProgramFlowEdgeCondition(program: ID, flow: ID, edge: ID, id: ID!, input: CommandProgramFlowEdgeConditionInput!): CommandProgramEdgeCondition!
		deleteCommandProgramFlowEdgeCondition(program: ID, flow: ID, edge: ID, id: ID!): Boolean!
	}


	input CommandProgramInput {
		name: String	
	}

	input CommandProgramWhere {
		id: ID
	}

	input CommandProgramDeviceWhere {
		id: ID
	}

	type CommandProgram {
		id: ID! 
		name: String

		program: [CommandProgramFlow]
		interface: CommandProgramHMI

		devices(where: CommandProgramDeviceWhere): [CommandProgramDevicePlaceholder]
		
		alarms: [CommandProgramAlarm] 
		variables: [CommandProgramVariable]

		createdAt: DateTime 

		usedOn: CommandDevice 

		organisation: HiveOrganisation
	}

	input CommandProgramFlowInput {
		name: String
		parent: String
	}

	input CommandProgramFlowWhere {
		id: ID
		program: ID
	}

	type CommandProgramFlow {
		id: ID! 
		name: String
		parent: CommandProgramFlow
		children: [CommandProgramFlow] 

		nodes: [CommandProgramNode] 
		edges: [CommandProgramEdge]

		program: CommandProgram
	}

	type CommandProgramAction {
		id: ID! 
		name: String
		flow: [CommandProgramFlow]
	}

	type CommandProgramAlarm {
		id: ID! 
		name: String
		trigger: String
	}



	type CommandProgramNodeConfiguration {
		id: ID! 

		key: String
		value: String
	} 

		input CommandProgramFlowNodeInput {
			x: Float
			y: Float

			type: String
		}

	input PointInput {
		x: Float
		y: Float
	}

	type Point {
		x: Float
		y: Float
	}

	input CommandProgramFlowEdgeInput {
		from: ID
		to: ID
		fromHandle: String
		toHandle: String
		points: [PointInput]
	}

	type CommandProgramEdge {
		id: ID!

		points: [Point]
		from: CommandProgramNode
		fromHandle: String

		to: CommandProgramNode
		toHandle: String

		conditions: [CommandProgramEdgeCondition] 
	}

	input CommandProgramFlowEdgeConditionInput {
		inputDevice: ID
		inputDeviceKey: String
		comparator: String
		assertion: CommandAssertionInput
	}

	type CommandProgramEdgeCondition {
		id: ID!

		inputDevice: CommandProgramDevicePlaceholder
		inputDeviceKey: CommandProgramDeviceState 
		comparator: String
		assertion: CommandAssertion

		flow: CommandProgramFlow 
	}


	type CommandProgramNode {
		id: ID! 
		x: Float
		y: Float
		type: String
		flow: [CommandProgramFlow] 

		actions: [CommandActionItem] 
		subprocess: CommandProgramFlow 

		configuration: [CommandProgramNodeConfiguration]


		inputs: [CommandProgramNode]
		outputs: [CommandProgramNode]
	}

	input CommandProgramFlowNodeActionInput {
		id: ID
		device: ID
		request: ID
	}

	type CommandActionItem {
		id: ID! 
		device: CommandProgramDevicePlaceholder 
		request: CommandProgramDeviceAction
		release: Boolean
	}

	type CommandProgramNodeFlowConfiguration {
		id: ID!
		inputDevice: CommandProgramDevicePlaceholder
		inputDeviceKey: CommandProgramDeviceState 
		comparator: String
		assertion: String

		flow: CommandProgramFlow 
	}


`
	return {
		typeDefs,
		resolvers
	}
}