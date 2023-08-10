import { PrismaClient } from "@hive-command/data";
import gql from "graphql-tag";
import axios from 'axios';
import { nanoid } from 'nanoid';

export default (prisma: PrismaClient) => {

	const load_exports = async (_require: (name: string) => any, url: string) => {

		let resp = await axios.get(url);
		
		const data = resp.data;

		console.log({data})

		const exports : any = {};
		const module = { exports };
		const func = new Function("require", "module", "exports", data);
		func(_require, module, exports);
		return module.exports;
	}

	const resolvers = {
		CommandProgramHMI: {
			nodes: (root: any) => {
				return root.jsonNodes;
			},
			edges: (root: any) => {
				return root.jsonEdges;
			},
			localHomepage: (root: any) => {
				return root.localHomepage?.length > 0;
			},
			remoteHomepage: (root: any) => {
				return root.remoteHomepage?.length > 0;
			}
		},
		CommandHMIDevicePack: {
			elements: async (root: any, args: any, context: any) => {
				console.log({root})
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
						console.log({name, base_url})
						// console.log("Init Loader")

						let isPath = name.indexOf('./') == 0
						let isSubNpm = (name.match(/\//g) || []).length > 1;
						
						let data : any;

						if(!requirementFetch[name]) {
							
						
							requirementFetch[name] = ((async () => {
								let url : any;

								if(isPath){
									// console.log({base_url})
									url = new URL(name.substring(2, name.length) + '.js', base_url).toString();

									try{
									data = await axios.get(url);
									}catch(e){
										url = new URL(name.substring(2, name.length) + '/index.js', base_url).toString();
										data = await axios.get(url)
									
									}
									// if(data.data.indexOf("Couldn't find the requested file") == 0){
									// 	}

									console.log({data: data.data})

									// console.log({url})
									// url = base_url + name.substring(2, name.length) + '.js';
								}else{
									// url = `https://cdn.jsdelivr.net/npm/${name}`

									console.log({isSubNpm, name})

									if(!isSubNpm){
										let pkg = await axios.get(`https://cdn.jsdelivr.net/npm/${name}/package.json`)

										url = new URL(pkg.data.main, `https://cdn.jsdelivr.net/npm/${name}/`).toString();

										base_url = url;

										data = await axios.get(url)
									}
									// url = new URL()
									// if(!isSubNpm){
									// 	// console.log(`https://cdn.jsdelivr.net/npm/${name}/package.json`)
									// 	let pkg = await axios.get(`https://cdn.jsdelivr.net/npm/${name}/package.json`);
									// 	// const data = pkg.data
									// 	// console.log({pkg})
									// 	try{
									// 	let pkgJson = pkg.data
									// 	url = new URL(pkgJson.main, `https://cdn.jsdelivr.net/npm/${name}/`).toString();
										
									// 	}catch(e){
									// 		console.error(`Couldnt parse package for ${name}`)
									// 	}
										
									// }else{
									// 	// url += '.js'
									// }
									// base_url = url;
								}

								if(!url) return;

								const m_name = name;
								const m = data //await axios.get(url)
								// console.log({m_name, m})

								// console.log({m: m.data, mData: m.data.length, name});

								let exports = {};
								let module = {exports};
								try{
									// let func = new Function('require', 'module', 'exports', m.data)
									// func(_initialRequire(base_url), module, exports)
									baseRequirements[m_name] = await load_exports(_initialRequire, url)// module.exports;
									console.log({exports: JSON.stringify(module.exports)})
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
					console.log({name})
			
					if(!(name in baseRequirements)){
						console.log("Loader", name)
						// return await Loader(base_url, name.substring(2, name.length) + '.js')
					}
					return baseRequirements[name]
				}

			
				const load = await load_exports(_initialRequire, root.url)
				
				console.log("Start fetch")
				await Promise.all(Object.keys(requirementFetch).map((x) => requirementFetch[x]()))

				const module = await load_exports(_requires, root.url)

				console.log({ module })
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
						jsonEdges: args.input.edges,
						jsonNodes: args.input.nodes,
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

				console.log({input: args, homepageUpdates})

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
									name: args.input.name,
									jsonNodes: args.input.nodes,
									jsonEdges: args.input.edges
									// nodes
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

			updateCommandProgramInterfaceNodeTemplateConfiguration: async (root: any, args: any, context: any) => {
				const transformer = await prisma.canvasDataTransformer.findFirst({where: {nodeId: args.node}});
				
				if(!transformer) throw new Error("No transformer found");
				
				const res = await prisma.canvasDataTransformer.update({
					where: {
						nodeId: args.node
					},
					data: {
						configuration: {
							upsert: [{
								where: {
									fieldId_transformerId: {
										fieldId: args.field,
										transformerId: transformer?.id
									}
								},
								create: {
									id: nanoid(),
									fieldId: args.field,
									value: args.value
								},
								update: {
									value: args.value || null
								}
							}]
						}
					}
				})
				return res != null;
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
					 	deviceUpdate['dataTransformer'] = {
							upsert: {
								update: {
									template: {
										connect: {id: args.input.template}
									}
								},
								create: {
									id: nanoid(),
									template: {
										connect: {id: args.input.template}
									}
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

					console.log({updateChildren: JSON.stringify(updateChildren)})
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

		
		updateCommandProgramInterfaceNodeTemplateConfiguration (node: ID, field: ID, value: String): Boolean

		createCommandProgramInterfaceEdge (program: ID, hmi: ID, input: ComandProgramInterfaceEdgeInput!): CommandHMIEdge
		updateCommandProgramInterfaceEdge (program: ID, hmi: ID, id: ID, input: ComandProgramInterfaceEdgeInput!): CommandHMIEdge
		deleteCommandProgramInterfaceEdge (program: ID, hmi: ID, id: ID!): CommandHMIEdge

		createCommandProgramInterfaceGroup (program: ID, node: ID, input: ComandProgramInterfaceGroupInput!): CommandHMIGroup
		updateCommandProgramInterfaceGroup (program: ID, node: ID, id: ID, input: ComandProgramInterfaceGroupInput!): CommandHMIGroup
		deleteCommandProgramInterfaceGroup (program: ID, node: ID, id: ID!): CommandHMIGroup
	}

	input CommandProgramInterfaceInput {
		name: String

		nodes: JSON
		edges: JSON

		localHomepage: Boolean
		remoteHomepage: Boolean
	}

	type CommandProgramHMI {
		id: ID
		name: String

		localHomepage: Boolean
		remoteHomepage: Boolean

		edges: JSON

		nodes: JSON
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
		width: Float
		height: Float

		scaleX: Float
		scaleY: Float

		options: JSONObject

		zIndex: Float

		showTotalizer : Boolean
		
		type: String

		template: String

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