import { PrismaClient } from "@hive-command/data";
import { mergeResolvers } from '@graphql-tools/merge'
// import io from './io'
import alarms from "./alarms";
import tags from './tags';
import types from './types';
import dataScopes from './scopes';

import gql from "graphql-tag";
import { nanoid } from "nanoid";
import components from "./components";
import { subject } from "@casl/ability";

export default (prisma: PrismaClient) => {
	
	// const { typeDefs: ioTypeDefs, resolvers: ioResolvers } = io(prisma)
	const { typeDefs: tagTypeDefs, resolvers: tagResolvers } = tags(prisma);
	const { typeDefs: typeTypeDefs, resolvers: typeResolvers } = types(prisma);
	const { typeDefs: alarmTypeDefs, resolvers: alarmResolvers } = alarms(prisma);
	const { typeDefs: dataScopeTypeDefs, resolvers: dataScopeResolver } = dataScopes(prisma)
	const { typeDefs: componentTypeDefs, resolvers: componentResolvers } = components(prisma);

	const resolvers = mergeResolvers([
		{
			CommandProgram: {
				components: (root: any, args: any) => {
					let c = [];
					if(args.where){
						c = root.components?.filter((a) => a.id == args.where?.id)
					}else{
						c=  root.components;
					}

					return c;
				}
			},
			Query: {
				commandPrograms: async (root: any, args: any, context: any) => {

					if(!context?.jwt?.acl?.can('read', 'CommandProgram')) throw new Error('Not allowed to read ProgramList');

					let filter = args.where || {}
					const programs = await prisma.program.findMany({
						where: {...filter, organisation: context.jwt.organisation
					}, include: {
						remoteHomepage: true,
						localHomepage: true,
						alarms: true,
						alarmPathways: true,
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
						templates: {
							include: {
								inputs: true,
								outputs: true,
								edges: {
									include: {
										from: true,
										to: true
									}
								}
							}
						},
						templatePacks: {
							include: {
								elements: true
							}
						},
						dataScopes: {
							include: {
								plugin: true
							}
						},
						tags: {
							include: {
								type: {
									include: {
										type: true
									}
								},
								scope: true
							}
						},
						types: {
							include: {
								usedByTagType: {
									include: {
										tag: true
									}
								},
								fields: {
									include: {
										type: true
									}
								}
							}
						},
						interface: {
							include: {
								localHomepage: true,
								remoteHomepage: true,
								nodes: {
									include: {
										// devicePlaceholder: true,
										inputs: true,
										outputs: true,
										children: true,
										ports: true,

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
										}
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
								}
							}
						},
						// devices: {
						// 	include: {
						// 		type: {include: {actions: true, state: true}},
						// 		plugins: {
						// 			include: {
						// 				plugin: true,
						// 				config: {
						// 					include: {
						// 						key: true
						// 					}
						// 				}
						// 			}
						// 		}
						// 	}
						// }
					}});

					return programs.filter((a) => context?.jwt?.acl?.can('read', subject('CommandProgram', a) ))
				},
				
			},
			Mutation: {
				createCommandProgram: async (root: any, args: {input: {name: string, templatePacks: string[]}}, context: any) => {
					if(!context?.jwt?.acl.can('create', 'CommandProgram')) throw new Error('Cannot create new CommandProgram');

					const program = await prisma.program.create({
						data: {
							id: nanoid(),
							name: args.input.name,
							templatePacks: {
								connect: (args.input.templatePacks || []).map((x) => ({id: x}))
							},
							interface: {
								create: {
									id: nanoid(),
									name: 'Default'
								}
							},
							organisation: context.jwt.organisation
						}
					})
					return program;
				},
				updateCommandProgram: async (root: any, args: {id: string, input: {name: string, templatePacks: string[]}}, context: any) => {
					const currentProgram = await prisma.program.findFirst({where: {id: args.id, organisation: context?.jwt?.organisation}});

					if(!currentProgram) throw new Error('Program not found');
					if(!context?.jwt?.acl.can('update', subject('CommandProgram', currentProgram) )) throw new Error('Cannot update CommandProgram');
					
					let templatePackUpdate: any = {};
					if(args.input.templatePacks){
						templatePackUpdate = {
							templatePacks: {
								set: args.input.templatePacks.map((x) => ({id: x}))
							}
						}
					}

					const program = await prisma.program.update({
						where: {id: args.id},
						data: {
							name: args.input.name,
							...templatePackUpdate
						}
					})

					return program
				},
				deleteCommandProgram: async (root: any, args: {id: string}, context: any) => {
					const currentProgram = await prisma.program.findFirst({where: {id: args.id, organisation: context?.jwt?.organisation}});
					if(!currentProgram) throw new Error('Program not found');
					if(!context?.jwt?.acl.can('delete', subject('CommandProgram', currentProgram) )) throw new Error('Cannot delete CommandProgram');
					
					const res = await prisma.program.delete({where: {id: args.id}})
					return res != null
				}
			}
		},
		tagResolvers,
		typeResolvers,
		alarmResolvers,
		dataScopeResolver,
		componentResolvers
	])
	
	const typeDefs = `

	${tagTypeDefs}
	${typeTypeDefs}
	${alarmTypeDefs}
	${dataScopeTypeDefs}
	${componentTypeDefs}

	type Query {
		commandPrograms(where: CommandProgramWhere): [CommandProgram]!
	}

	type Mutation {
		createCommandProgram(input: CommandProgramInput!): CommandProgram!
		updateCommandProgram(id: ID!, input: CommandProgramInput!): CommandProgram!
		deleteCommandProgram(id: ID!): Boolean!

	}


	input CommandProgramInput {
		name: String	

		templatePacks: [String]
	}

	input CommandProgramWhere {
		id: ID
	}

	input CommandProgramDeviceWhere {
		id: ID
	}

	input CommandProgramComponentWhere {
		id: ID
	}
	
	type CommandProgram {
		id: ID! 
		name: String

		dataScopes: [CommandProgramDataScope]
		templatePacks: [CommandHMIDevicePack]

		components(where: CommandProgramComponentWhere): [CommandProgramComponent]

		interface: [CommandProgramHMI]

		localHomepage: CommandProgramHMI
		remoteHomepage: CommandProgramHMI

		alarms: [CommandProgramAlarm] 
		alarmPathways: [CommandProgramAlarmPathway]

		tags: [CommandProgramTag]
		types: [CommandProgramType]
		templates: [CommandTemplateTransformer]

		createdAt: DateTime 

		usedOn: CommandDevice 

		organisation: HiveOrganisation
	}



	input PointInput {
		x: Float
		y: Float
	}

	type Point {
		x: Float
		y: Float
	}


`
	return {
		typeDefs,
		resolvers
	}
}