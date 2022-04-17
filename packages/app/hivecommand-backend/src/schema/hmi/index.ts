import { PrismaClient } from "@prisma/client";
import gql from "graphql-tag";
import { nanoid } from 'nanoid';

export default (prisma: PrismaClient) => {
	
	const resolvers = {	
		Query: {
			commandInterfaceDevices: async () => {
				return await prisma.canvasNodeTemplate.findMany()
			}
		},
		Mutation: {
			createCommandProgramInterfaceNode: async (root: any, args: any, context: any) => {
				let deviceUpdate: any = {};
				if(args.input.devicePlaceholder){
					deviceUpdate['devicePlaceholder'] = {
						connect: {id: args.input.devicePlaceholder}
					}
				}
				return await prisma.canvasNode.create({
					data: {
						id: nanoid(),
						x: args.input.x,
						y: args.input.y,
						rotation: args.input.rotation || 0,
						scaleX: args.input.scaleX || 1,
						scaleY: args.input.scaleY || 1,
						z: args.input.z || 1,
						showTotalizer: args.input.showTotalizer || false,
						...deviceUpdate,
						type: {
							connect: {id: args.input.type}
						},
						hmi: {
							connect: { programId: args.program }
						}
					}
				})
			},
			updateCommandProgramInterfaceNode: async (root: any, args: any, context: any) => {
				let deviceUpdate: any = {};
				if(args.input.devicePlaceholder){
					deviceUpdate['devicePlaceholder'] = {
						connect: {id: args.input.devicePlaceholder}
					}
				}
				if(args.input.z) deviceUpdate['z'] = args.input.z;
				if(args.input.showTotalizer) deviceUpdate['showTotalizer'] = args.input.showTotalizer;
				if(args.input.x) deviceUpdate['x'] = args.input.x;
				if(args.input.y) deviceUpdate['y'] = args.input.y;
				if(args.input.rotation) deviceUpdate['rotation'] = args.input.rotation;

				if(args.input.type) deviceUpdate['type'] = { connect: {id: args.input.type} };

				return await prisma.canvasNode.update({
					where: {id: args.id},
					data: {
						...deviceUpdate,
					
						// hmi: {
						// 	connect: { programId: args.program }
						// }
					}
				})
			},
			deleteCommandProgramInterfaceNode: async (root: any, args: any, context: any) => {
				return await prisma.canvasNode.delete({where: {id: args.id}});
			},
			createCommandProgramInterfaceEdge: async (root: any, args: any, context: any) => {
				return await prisma.canvasEdge.create({
					data: {
						id: nanoid(),
						from: {
							connect: {id: args.input.from}
						},
						fromHandle: args.input.fromHandle,
						to: {
							connect: {id: args.input.to}
						},
						toHandle: args.input.toHandle,
						points: args.input.points,
						hmi: {
							connect: { programId: args.program }
						}
					}
				})
			},
			updateCommandProgramInterfaceEdge: async (root: any, args: any, context: any) => {
				return await prisma.canvasEdge.update({
					where: {id: args.id},
					data: {
						from: {
							connect: {id: args.input.from}
						},
						fromHandle: args.input.fromHandle,
						to: {
							connect: {id: args.input.to}
						},
						toHandle: args.input.toHandle,
						points: args.input.points
						// hmi: {
						// 	connect: { programId: args.program }
						// }
					}
				})
			},
			deleteCommandProgramInterfaceEdge: async (root: any, args: any, context: any) => {
				return await prisma.canvasEdge.delete({where: {id: args.id}});
			},
		}
	}
	
	const typeDefs = `

	type Query {
		commandInterfaceDevices: [CommandHMIDevice!]!
	}

	type Mutation {
		createCommandProgramInterfaceNode (program: ID, input: ComandProgramInterfaceNodeInput!): CommandHMINode
		updateCommandProgramInterfaceNode (program: ID, id: ID, input: ComandProgramInterfaceNodeInput!): CommandHMINode
		deleteCommandProgramInterfaceNode (program: ID, id: ID!): CommandHMINode

		createCommandProgramInterfaceEdge (program: ID, input: ComandProgramInterfaceEdgeInput!): CommandHMIEdge
		updateCommandProgramInterfaceEdge (program: ID, id: ID, input: ComandProgramInterfaceEdgeInput!): CommandHMIEdge
		deleteCommandProgramInterfaceEdge (program: ID, id: ID!): CommandHMIEdge
	}

	type CommandProgramHMI {
		id: ID! 
		name: String

		actions: [CommandProgramAction] 

		edges: [CommandHMIEdge]

		groups: [CommandHMIGroup] 
		nodes: [CommandHMINode]
		programs: [CommandProgram]
	}


	union CommandHMINodes = CommandHMINode | CommandHMIGroup

	type CommandHMIGroup {
		id: ID! 
		x: Float
		y: Float

		width: Float
		height: Float

		rotation: Float
		scaleX: Float
		scaleY: Float

		nodes: [CommandHMINode]
		ports: [CommandHMIPort]

		inputs: [CommandHMINode]
		outputs: [CommandHMINode] 
	}

	type CommandHMIPort {
		id: ID! 
		key: String
		x: Float
		y: Float
		length: Float
		rotation: Float
	}

	input ComandProgramInterfaceNodeInput{
		x: Float
		y: Float
		rotation: Float
		scaleX: Float
		scaleY: Float

		z: Int

		showTotalizer : Boolean
		
		type: String
		devicePlaceholder: String
	}

	type CommandHMINode {
		id: ID! 
		x: Float
		y: Float

		rotation: Float
		scaleX: Float
		scaleY: Float

		z: Int

		showTotalizer : Boolean
		
		type: CommandHMIDevice 

		devicePlaceholder: CommandProgramDevicePlaceholder 

		flow: [CommandProgramHMI] 

		inputs: [CommandHMINode] 
		outputs: [CommandHMINode] 
	}

	input ComandProgramInterfaceEdgeInput {
		from: String
		fromHandle: String
		to: String
		toHandle: String
		points: [PointInput]
	}

	type CommandHMIEdge {
		id: ID! 
		from: CommandHMINode
		fromHandle: String
		to: CommandHMINode
		toHandle: String
		points: [Point]
	}


	interface CommandHMINodeFlow  {
		id: ID 
		sourceHandle: String
		targetHandle: String
	}


	type CommandHMIDevice {
		id: ID! 
		name: String

		width: Float
		height: Float

		ports: [CommandHMIDevicePort]
	}

	type CommandHMIDevicePort {
		id: ID! 
		x: Float
		y: Float
		key: String
		rotation: Float
	}

	`

	return {
		typeDefs,
		resolvers
	}
}