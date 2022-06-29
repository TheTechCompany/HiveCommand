import { PrismaClient } from "@hive-command/data";
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
			createCommandInterfaceDevice: async (root: any, args: any) => {
				return await prisma.canvasNodeTemplate.create({
					data: {
						id: nanoid(),
						...args.input
					}
				})
			},
			updateCommandInterfaceDevice: async (root: any, args: any) => {
				console.log("UPDATE", args.input)
				return await prisma.canvasNodeTemplate.update({
					where: {
						id: args.id
					},
					data: {
						ports: args.input.ports
					}
				})
			},
			deleteCommandInterfaceDevice: async (root: any, args: any) => {
				return await prisma.canvasNodeTemplate.delete({where: {id: args.id}})
			},
			createCommandProgramInterfaceNode: async (root: any, args: any, context: any) => {
				let deviceUpdate: any = {};
				if (args.input.devicePlaceholder) {
					deviceUpdate['devicePlaceholder'] = {
						connect: { id: args.input.devicePlaceholder }
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
							connect: { id: args.input.type }
						},
						hmi: {
							connect: { programId: args.program }
						}
					}
				})
			},
			updateCommandProgramInterfaceNode: async (root: any, args: any, context: any) => {
				let deviceUpdate: any = {};
				if (args.input.devicePlaceholder) {
					deviceUpdate['devicePlaceholder'] = {
						connect: { id: args.input.devicePlaceholder }
					}
				}
				if (args.input.z != undefined) deviceUpdate['z'] = args.input.z;
				if (args.input.showTotalizer != undefined) deviceUpdate['showTotalizer'] = args.input.showTotalizer;
				if (args.input.x != undefined) deviceUpdate['x'] = args.input.x;
				if (args.input.y != undefined) deviceUpdate['y'] = args.input.y;

				if (args.input.scaleX != undefined) deviceUpdate['scaleX'] = args.input.scaleX;
				if (args.input.scaleY != undefined) deviceUpdate['scaleY'] = args.input.scaleY;

				if (args.input.rotation != undefined) deviceUpdate['rotation'] = args.input.rotation;
				if (args.input.type) deviceUpdate['type'] = { connect: { id: args.input.type } };

				if(args.input.children){
					const createChildren = args.input.children.filter((a: any) => !a.id).map((x: any) => ({...x, id: nanoid()}))
					const updateChildren = args.input.children.filter((a: any) => a.id)

					let create : any = {};
					let update : any = {};
					let deleteQuery : any = {}

					let deleteIds = createChildren.map((x: any) => x.id).concat(updateChildren.map((x: any) => x.id))

					console.log({updateChildren: JSON.stringify(updateChildren)})
					if(createChildren.length > 0){
						create = {
							createMany: {
								data: createChildren.map((child: any) => ({
									id: child.id,
									x: child.x,
									y: child.y,
									rotation: child.rotation || 0,
									scaleX: child.scaleX || 1,
									scaleY: child.scaleY || 1,
									z: child.z || 1,
									showTotalizer: child.showTotalizer || false,
									templateId: child.type,
									deviceId: child.devicePlaceholder,
									// type: {connect: {id: child.type}},
								}))
							}
						}
					}
					if(updateChildren.length > 0){
						update = {
							updateMany: updateChildren.map((child: any) => ({
								where: { id: child.id },
								data: {
									x: child.x,
									y: child.y,
									rotation: child.rotation || 0,
									scaleX: child.scaleX || 1,
									scaleY: child.scaleY || 1,
									z: child.z || 1,
									showTotalizer: child.showTotalizer || false,
									templateId: child.type,
									deviceId: child.devicePlaceholder,
								}
							}))
						}
					}
					if(deleteIds){
						deleteQuery = {
							deleteMany: [
								{
									NOT: {
										id: {in: deleteIds}
									}
								}
							]
						}
					}

					console.log({update: JSON.stringify(update), create: JSON.stringify(create)})
					deviceUpdate['children'] = {
						...create,
						...update,
						// ...deleteQuery
					}
				}

				if(args.input.ports){
					const createPorts = args.input.ports.filter((a: any) => !a.id)
					const updatePorts = args.input.ports.filter((a: any) => a.id)

					let create : any = {};
					let update : any = {};

					if(createPorts.length > 0){
						create = {
							createMany: {
								data: args.input.ports.filter((a: any) => !a.id).map((port: any) => ({
									id: nanoid(),
									x: port.x,
									y: port.y,
									key: port.key,
									rotation: port.rotation || 0,
									length: port.length || 1,
								}))
							}
						}
					}

					if(updatePorts.length > 0){
						update = {
							updateMany: args.input.ports.filter((a: any) => a.id).map((port: any) => ({
								where: { id: port.id },
								data: {
									x: port.x,
									y: port.y,
									key: port.key,
									rotation: port.rotation || 0,
									length: port.length || 1,
								}
							}))
						}
					}
					console.log({update: JSON.stringify(update), create: JSON.stringify(create)})

					deviceUpdate['ports'] = {
						...create,
						...update
					}
				}

				return await prisma.canvasNode.update({
					where: { id: args.id },
					data: {
						...deviceUpdate,
						
						// hmi: {
						// 	connect: { programId: args.program }
						// }
					}
				})
			},
			deleteCommandProgramInterfaceNode: async (root: any, args: any, context: any) => {
				return await prisma.canvasNode.delete({ where: { id: args.id } });
			},
			createCommandProgramInterfaceEdge: async (root: any, args: any, context: any) => {
				return await prisma.canvasEdge.create({
					data: {
						id: nanoid(),
						from: {
							connect: { id: args.input.from }
						},
						fromHandle: args.input.fromHandle,
						to: {
							connect: { id: args.input.to }
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
					where: { id: args.id },
					data: {
						from: {
							connect: { id: args.input.from }
						},
						fromHandle: args.input.fromHandle,
						to: {
							connect: { id: args.input.to }
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
				return await prisma.canvasEdge.delete({ where: { id: args.id } });
			},
			createCommandProgramInterfaceGroup: async (root: any, args: any, context: any) => {
				const { nodes, ports } = args.input;

				// console.log(JSON.stringify({ nodes }))
				// return await prisma.canvasNodeGroup.create({
				// 	data: {
				// 		id: nanoid(),
				// 		x: args.input.x || 0,
				// 		y: args.input.y || 0,
				// 		nodes: {

				// 			createMany: {
				// 				data: nodes.map((node: any) => ({
				// 					id: nanoid(),
				// 					x: node.x,
				// 					y: node.y,
				// 					rotation: node.rotation || 0,
				// 					scaleX: node.scaleX || 1,
				// 					scaleY: node.scaleY || 1,
				// 					z: node.z || 1,
				// 					templateId: node.type,
				// 					showTotalizer: node.showTotalizer || false,

				// 				}))
				// 			}
				// 		},
				// 		ports: {

				// 			createMany: {
				// 				data: ports.map((port: any) => ({
				// 					id: nanoid(),
				// 					key: port.key,
				// 					x: port.x,
				// 					y: port.y,
				// 					rotation: port.rotation || 0,
				// 					length: port.length || 1

				// 				}))
				// 			}
				// 		},
				// 		hmi: {
				// 			connect: { programId: args.program }
				// 		}
				// 	}
				// 	// create: {
				// 	// 	nodes: {

				// 	// 	},
				// 	// 	ports: {

				// 	// 	}
				// 	// }


				// })
			},
			updateCommandProgramInterfaceGroup: async (root: any, args: any, context: any) => {
				const { nodes, ports } = args.input;

				// let nodeUpdate : any = {};
				// let portUpdate : any = {};

				// if(nodes && nodes.length > 0) {
				// 	let createNodes = nodes.filter((a: any) => a.id);
				// 	let updateNodes = nodes.filter((a: any) => !a.id);

				// 	if(createNodes.length > 0){
				// 		nodeUpdate['createMany'] = {
				// 			data: createNodes.map((node: any) => ({
				// 					id: nanoid(),
				// 					x: node.x,
				// 					y: node.y,
				// 					rotation: node.rotation || 0,
				// 					scaleX: node.scaleX || 1,
				// 					scaleY: node.scaleY || 1,
				// 					templateId: node.type,
								
				// 			}))
				// 		}
				// 	}
				// 	if(updateNodes.length > 0){
				// 		nodeUpdate['updateMany'] = updateNodes.map((node: any) => ({
				// 			where: { id: node.id },
				// 			data: {
				// 				x: node.x,
				// 				y: node.y,
				// 				rotation: node.rotation || 0,
				// 				scaleX: node.scaleX || 1,
				// 				scaleY: node.scaleY || 1,
				// 				templateId: node.type,
				// 			}
				// 		}))
				// 	}
				// }

				// if(ports && ports.length > 0) {
				// 	let createNodes = ports.filter((a: any) => a.id);
				// 	let updateNodes = ports.filter((a: any) => !a.id);

				// 	if(createNodes.length > 0){
				// 		portUpdate['createMany'] = {
				// 			data: createNodes.map((port: any) => ({
				// 				id: nanoid(),
				// 				key: port.key,
				// 				x: port.x,
				// 				y: port.y,
				// 				rotation: port.rotation || 0,
				// 				length: port.length || 1
				// 			}))
				// 		}
				// 	}

				// 	if(updateNodes.length > 0){
				// 		portUpdate['updateMany'] = updateNodes.map((port: any) => ({
				// 			where: { id: port.id },
				// 			data: {
				// 				key: port.key,
				// 				x: port.x,
				// 				y: port.y,
				// 				rotation: port.rotation || 0,
				// 				length: port.length || 1
				// 			}
				// 		}))
				// 	}
				// }

				// return await prisma.canvasNodeGroup.update({
				// 	where: { id: args.id },
				// 	data: {
				// 		x: args.input.x,
				// 		y: args.input.y,
				// 		nodes: {
				// 			...nodeUpdate
				// 		},
				// 		ports: {
				// 			...portUpdate
				// 		}
				// 	}
				// })
			},
			deleteCommandProgramInterfaceGroup: async (root: any, args: any, context: any) => {
				// return await prisma.canvasNode.update({
				// 	where: { id: args.node },
				// 	data: {
				// 		group: {
				// 			delete: true
				// 		}
				// 	}
				// })
			}
		}
	}


	
	const typeDefs = `

	type Query {
		commandInterfaceDevices: [CommandHMIDevice!]!
	}

	type Mutation {
		createCommandInterfaceDevice (input: CommandHMIDeviceInput): CommandHMIDevice
		updateCommandInterfaceDevice (id: ID!, input: CommandHMIDeviceInput) : CommandHMIDevice
		deleteCommandInterfaceDevice (id: ID!): CommandHMIDevice

		createCommandProgramInterfaceNode (program: ID, input: ComandProgramInterfaceNodeInput!): CommandHMINode
		updateCommandProgramInterfaceNode (program: ID, id: ID, input: ComandProgramInterfaceNodeInput!): CommandHMINode
		deleteCommandProgramInterfaceNode (program: ID, id: ID!): CommandHMINode

		createCommandProgramInterfaceEdge (program: ID, input: ComandProgramInterfaceEdgeInput!): CommandHMIEdge
		updateCommandProgramInterfaceEdge (program: ID, id: ID, input: ComandProgramInterfaceEdgeInput!): CommandHMIEdge
		deleteCommandProgramInterfaceEdge (program: ID, id: ID!): CommandHMIEdge

		createCommandProgramInterfaceGroup (program: ID, node: ID, input: ComandProgramInterfaceGroupInput!): CommandHMIGroup
		updateCommandProgramInterfaceGroup (program: ID, node: ID, id: ID, input: ComandProgramInterfaceGroupInput!): CommandHMIGroup
		deleteCommandProgramInterfaceGroup (program: ID, node: ID, id: ID!): CommandHMIGroup
	}

	type CommandProgramHMI {
		id: ID! 
		name: String

		actions: [CommandProgramAction] 

		edges: [CommandHMIEdge]

		nodes: [CommandHMINode]
		programs: [CommandProgram]
	}


	union CommandHMINodes = CommandHMINode | CommandHMIGroup

	input ComandProgramInterfaceGroupInput {
		x: Float
		y: Float

		nodes: [ComandProgramInterfaceNodeInput]
		ports: [CommandHMIPortInput]
	}

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

	input CommandHMIPortInput {
		id: String
		key: String
		x: Float
		y: Float
		length: Float
		rotation: Float
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
		id: String
		x: Float
		y: Float
		rotation: Float
		scaleX: Float
		scaleY: Float

		z: Int

		showTotalizer : Boolean
		
		type: String
		devicePlaceholder: String

		children: [ComandProgramInterfaceNodeInput]
		ports: [CommandHMIPortInput]
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

		children: [CommandHMINode]
		ports: [CommandHMIPort]

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

	input CommandHMIDeviceInput {
		name: String
		width: Float
		height: Float
		ports: [CommandHMIDevicePortInput]
	}

	type CommandHMIDevice {
		id: ID! 
		name: String

		width: Float
		height: Float

		ports: [CommandHMIDevicePort]
	}

	input CommandHMIDevicePortInput {
		x: Float
		y: Float
		key: String
		rotation: Float
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