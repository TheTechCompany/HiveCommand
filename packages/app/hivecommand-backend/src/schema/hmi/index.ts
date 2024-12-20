import { PrismaClient } from "@hive-command/data";
import gql from "graphql-tag";
import axios from 'axios';
import { nanoid } from 'nanoid';

export default (prisma: PrismaClient) => {

	const load_exports = async (_require: (name: string) => any, url: string) => {

		let resp = await axios.get(url);
		
		const data = resp.data;

		const exports : any = {};
		const module = { exports };
		const func = new Function("require", "module", "exports", data);
		func(_require, module, exports);
		return module.exports;
	}

	const resolvers = {
		CommandProgramHMI: {
			localHomepage: (root: any) => {
				return root.localHomepage?.length > 0;
			},
			remoteHomepage: (root: any) => {
				return root.remoteHomepage?.length > 0;
			}
		},
		CommandHMIDevicePack: {
			elements: async (root: any, args: any, context: any) => {
				if(!root.url) return root.elements || [];
				let contents = await axios.get(root.url);
				let data = contents.data;

				let baseRequirements : any = {};

				let base_url = root.url?.split('/')
				base_url.splice(-1, 1)
				base_url = base_url.join('/') + '/'

				let requirementFetch : any = [];

				const _initialRequire = (name: string) => {
					if(!(name in baseRequirements)){
						let isPath = name.indexOf('./') == 0
						let isSubNpm = (name.match(/\//g) || []).length > 1;
						
						let data : any;

						if(!requirementFetch[name]) {
							
						
							requirementFetch[name] = ((async () => {
								let url : any;

								if(isPath){
									url = new URL(name.substring(2, name.length) + '.js', base_url).toString();

									try{
									data = await axios.get(url);
									}catch(e){
										url = new URL(name.substring(2, name.length) + '/index.js', base_url).toString();
										data = await axios.get(url)
									
									}

								}else{
									if(!isSubNpm){
										let pkg = await axios.get(`https://cdn.jsdelivr.net/npm/${name}/package.json`)

										url = new URL(pkg.data.main, `https://cdn.jsdelivr.net/npm/${name}/`).toString();

										base_url = url;

										data = await axios.get(url)
									}
									
								}

								if(!url) return;

								const m_name = name;
								const m = data //await axios.get(url)

								let exports = {};
								let module = {exports};
								try{
									// let func = new Function('require', 'module', 'exports', m.data)
									// func(_initialRequire(base_url), module, exports)
									baseRequirements[m_name] = await load_exports(_initialRequire, url)// module.exports;
								}catch(e){
									console.log({e, name})
								}

							}))
						}

						// const module = await Loader(base_url, name.substring(2, name.length) + '.js')
						// baseRequirements[name] = module;
					}
				}


				const _requires = (name: string) => {
			
					if(!(name in baseRequirements)){
						console.log("Loader", name)
						// return await Loader(base_url, name.substring(2, name.length) + '.js')
					}
					return baseRequirements[name]
				}

			
				const load = await load_exports(_initialRequire, root.url)
				
				await Promise.all(Object.keys(requirementFetch).map((x) => requirementFetch[x]()))

				const module = await load_exports(_requires, root.url)

				return Object.keys(module).map((key, ix) => ({
					id: ix,
					name: key
				}))
			}
		},
		Query: {
			commandInterfaceDevicePacks: async (root: any, args: any, context: any) => {
				
				let filter : any[] = [
					{
						owner: context?.jwt?.organisation
					}
				];

				if(args.registered){
					filter.push({
						registeredBy: {
							has: context?.jwt?.organisation
						}
					})
				}else{
					filter.push({
						public: true
					})
				}


				return await prisma.canvasNodeTemplatePack.findMany({
					where: {
						OR: filter,
						id: args.id
					},
					include: {
						elements: true
					}
				});
			},
			commandInterfaceDevices: async () => {
				return await prisma.canvasNodeTemplate.findMany()
			}
		},
		Mutation: {
			createCommandProgramInterface: async (root: any, args: any, context: any) => {

				let id = nanoid();

				let homepageUpdates : any = {};
				if(args.input.localHomepage){
					homepageUpdates['localHomepage'] = {connect: {id: id}};
				}
				
				if(args.input.remoteHomepage){
					homepageUpdates['remoteHomepage'] = {connect: {id}}
				}

				const hmi = await prisma.programHMI.create({
					data: {
						id,
						name: args.input.name,
						programId: args.program
					}
				})

				if(Object.keys(homepageUpdates).length > 0){
					await prisma.program.update({
						where: {
							id: args.program,
						},
						data: {
							...homepageUpdates
							// interface: {
							// 	create: {
							// 		id: nanoid(),
							// 		name: args.input.name
							// 	}
							// }
						}
					})
				}
				return hmi;
			},
			updateCommandProgramInterface: async (root: any, args: any, context: any) => {

				const hmi = await prisma.program.findFirst({where: {id: args.program}})

				let homepageUpdates : any = {};

				if(args.input.localHomepage){
					homepageUpdates['localHomepage'] = {connect: {id: args.id}};
				}else{
					if(hmi?.localHomepageId == args.id){
						homepageUpdates['localHomepage'] = {disconnect: true}
					}
				}
				
				if(args.input.remoteHomepage){
					homepageUpdates['remoteHomepage'] = {connect: {id: args.id}}
				}else{
					if(hmi?.remoteHomepageId == args.id){
						homepageUpdates['remoteHomepage'] = {disconnect: true}
					}
				}

				return await prisma.program.update({
					where: {
						id: args.program
					},
					data: {
						...homepageUpdates,
						
						interface: {
							update: {
								where: {
									id: args.id
								},
								data: {
									name: args.input.name
								}
							}
						}
					}
				})
			},
			deleteCommandProgramInterface: async (root: any, args: any, context: any) => {
				return await prisma.program.update({
					where: {
						id: args.program,
					},
					data: {
						interface: {
							delete: {
								id: args.id
							}
						}
					}
				})
			},
			createCommandInterfacePack: async (root: any, args: any, context: any) => {
				return await prisma.canvasNodeTemplatePack.create({
					data: {
						id: nanoid(),
						name: args.input.name,
						description: args.input.description,
						url: args.input.url,
						provider: args.input.provider,
						public: args.input.public,
						owner: context?.jwt?.organisation
					}
				})
			},
			updateCommandInterfacePack: async (root: any, args: any, context: any) => {
				return await prisma.canvasNodeTemplatePack.update({
					where: {
						id: args.id,
					},
					data: {
						name: args.input.name,
						description: args.input.description,
						public: args.input.public,
						url: args.input.url,
						provider: args.input.provider
					}
				})
			},
			deleteCommandInterfacePack: async (root: any, args: any, context: any) => {
				return await prisma.canvasNodeTemplatePack.delete({
					where: {
						id: args.id
					}
				})
			},
			createCommandInterfaceDevice: async (root: any, args: any) => {
				return await prisma.canvasNodeTemplate.create({
					data: {
						id: nanoid(),
						...args.input,
						packId: args.pack
					}
				})
			},
			updateCommandInterfaceDevice: async (root: any, args: any) => {
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
			
				return await prisma.canvasNode.create({
					data: {
						id: nanoid(),
						x: args.input.x,
						y: args.input.y,
						options: args.input.options,
						rotation: args.input.rotation || 0,
						width: args.input.width,
						height: args.input.height,

						zIndex: args.input.zIndex || 1,
						showTotalizer: args.input.showTotalizer || false,
						...deviceUpdate,
						type: args.input.type,
						hmi: {
							connect: { id: args.hmi }
						}
					}
				})
			},

		
			updateCommandProgramInterfaceNode: async (root: any, args: any, context: any) => {
				let deviceUpdate: any = {};
			
				if (args.input.showTotalizer != undefined) deviceUpdate['showTotalizer'] = args.ianput.showTotalizer;
				if (args.input.x != undefined) deviceUpdate['x'] = args.input.x;
				if (args.input.y != undefined) deviceUpdate['y'] = args.input.y;

				if(args.input.zIndex != undefined) deviceUpdate['zIndex'] = args.input.zIndex;

				if (args.input.scaleX != undefined) deviceUpdate['scaleX'] = args.input.scaleX;
				if (args.input.scaleY != undefined) deviceUpdate['scaleY'] = args.input.scaleY;

				if (args.input.width != undefined) deviceUpdate['width'] = args.input.width;
				if (args.input.height != undefined) deviceUpdate['height'] = args.input.height;

				if (args.input.rotation != undefined) deviceUpdate['rotation'] = args.input.rotation;
				if (args.input.type) deviceUpdate['type'] = args.input.type //{ connect: { id: args.input.type } };

				if(args.input.template || args.input.template === null){
					if(args.input.template === null){
						deviceUpdate['dataTransformer'] = {
							delete: true
						}
					}else{
						let update : any = {};
						if(args.input.templateOptions){
							update = {
								options: args.input.templateOptions
							}
						}
					 	deviceUpdate['dataTransformer'] = {
							upsert: {
								update: {
									template: {
										connect: {id: args.input.template}
									},
									...update
								},
								create: {
									id: nanoid(),
									template: {
										connect: {id: args.input.template}
									},
									...update
								}
							}
						};
					}
				}

				if(args.input.options) deviceUpdate['options'] = args.input.options;

				if(args.input.children){
					const createChildren = args.input.children.filter((a: any) => !a.id).map((x: any) => ({...x, id: nanoid()}))
					const updateChildren = args.input.children.filter((a: any) => a.id)

					let create : any = {};
					let update : any = {};
					let deleteQuery : any = {}

					let deleteIds = createChildren.map((x: any) => x.id).concat(updateChildren.map((x: any) => x.id))

					if(createChildren.length > 0){
						create = {
							createMany: {
								data: createChildren.map((child: any) => ({
									id: child.id,
									x: child.x,
									y: child.y,
									options: child.options,
									rotation: child.rotation || 0,
									width: child.width,
									height: child.height,
									zIndex: child.zIndex || 1,
									showTotalizer: child.showTotalizer || false,
									templateId: child.type,
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
									options: child.options,
									rotation: child.rotation || 0,
									width: child.width,
									height: child.height,
									zIndex: child.zIndex || 1,
									showTotalizer: child.showTotalizer || false,
									templateId: child.type,
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
						fromPoint: args.input.fromPoint,
						to: {
							connect: { id: args.input.to }
						},
						toPoint: args.input.toPoint,
						toHandle: args.input.toHandle,
						points: args.input.points,
						hmi: {
							connect: { 
								id: args.hmi
							}
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
						fromPoint: args.input.fromPoint,
						to: {
							connect: { id: args.input.to }
						},
						toHandle: args.input.toHandle,
						toPoint: args.input.toPoint,
						points: args.input.points
						// hmi: {
						// 	connect: { programId: args.program }
						// }
					}
				})
			},
			deleteCommandProgramInterfaceEdge: async (root: any, args: any, context: any) => {
				return await prisma.canvasEdge.delete({ where: { id: args.id } });
			}
		}
	}


	
	const typeDefs = `

	type Query {
		commandInterfaceDevicePacks(id: ID, registered: Boolean): [CommandHMIDevicePack]
		commandInterfaceDevices: [CommandHMIDevice!]!
	}

	type Mutation {
		createCommandInterfacePack (input: CommandHMIDevicePackInput): CommandHMIDevicePack
		updateCommandInterfacePack (id: ID!, input: CommandHMIDevicePackInput): CommandHMIDevicePack
		deleteCommandInterfacePack (id: ID!): CommandHMIDevicePack

		createCommandInterfaceDevice (pack: ID, input: CommandHMIDeviceInput): CommandHMIDevice
		updateCommandInterfaceDevice (pack: ID, id: ID!, input: CommandHMIDeviceInput) : CommandHMIDevice
		deleteCommandInterfaceDevice (pack: ID, id: ID!): CommandHMIDevice

		createCommandProgramInterface (program: ID, input: CommandProgramInterfaceInput!): CommandProgramHMI
		updateCommandProgramInterface (program: ID, id: ID!, input: CommandProgramInterfaceInput!): CommandProgramHMI
		deleteCommandProgramInterface (program: ID, id: ID!): CommandProgramHMI

		createCommandProgramInterfaceNode (program: ID, hmi: ID, input: ComandProgramInterfaceNodeInput!): CommandHMINode
		updateCommandProgramInterfaceNode (program: ID, hmi: ID, id: ID, input: ComandProgramInterfaceNodeInput!): CommandHMINode
		deleteCommandProgramInterfaceNode (program: ID, hmi: ID, id: ID!): CommandHMINode

		
		createCommandProgramInterfaceEdge (program: ID, hmi: ID, input: ComandProgramInterfaceEdgeInput!): CommandHMIEdge
		updateCommandProgramInterfaceEdge (program: ID, hmi: ID, id: ID, input: ComandProgramInterfaceEdgeInput!): CommandHMIEdge
		deleteCommandProgramInterfaceEdge (program: ID, hmi: ID, id: ID!): CommandHMIEdge

	}

	input CommandProgramInterfaceInput {
		name: String

		localHomepage: Boolean
		remoteHomepage: Boolean
	}

	type CommandProgramHMI {
		id: ID
		name: String

		localHomepage: Boolean
		remoteHomepage: Boolean

		edges: [CommandHMIEdge]

		nodes: [CommandHMINode]
		programs: [CommandProgram]
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
		width: Float
		height: Float

		scaleX: Float
		scaleY: Float

		options: JSONObject

		zIndex: Float

		showTotalizer : Boolean
		
		type: String

		template: String
		templateOptions: JSON

		children: [ComandProgramInterfaceNodeInput]
		ports: [CommandHMIPortInput]
	}
	

	type CommandHMINode {
		id: ID! 
		x: Float
		y: Float

		zIndex: Float

		rotation: Float

		scaleX: Float
		scaleY: Float

		width: Float
		height: Float

		options: JSONObject

		showTotalizer : Boolean
		
		type: String 

		dataTransformer: CommandDataTransformer

		children: [CommandHMINode]
		ports: [CommandHMIPort]

		flow: [CommandProgramHMI] 

		inputs: [CommandHMINode] 
		outputs: [CommandHMINode] 
	}

	input ComandProgramInterfaceEdgeInput {
		from: String
		fromHandle: String
		fromPoint: JSON
		to: String
		toHandle: String
		toPoint: JSON
		points: [PointInput]
	}



	type CommandHMIEdge {
		id: ID! 
		from: CommandHMINode
		fromHandle: String
		fromPoint: JSON
		to: CommandHMINode
		toPoint: JSON
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

	input CommandHMIDevicePackInput {
		name: String
		description: String
		public: Boolean

		url: String
		provider: String
	}

	type CommandHMIDevicePack {
		id: ID!
		name: String

		provider: String
		url: String

		description: String

		public: Boolean

		elements: [CommandHMIDevice]
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