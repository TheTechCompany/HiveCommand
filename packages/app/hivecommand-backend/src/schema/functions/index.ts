import { PrismaClient } from "@hive-command/data";
import { mergeResolvers } from '@graphql-tools/merge'

import gql from "graphql-tag";
import { nanoid } from "nanoid";
import { subject } from "@casl/ability";

import { LexoRank } from 'lexorank';

export default (prisma: PrismaClient) => {
	
	const resolvers = mergeResolvers([
		{
	
			Query: {
				commandFunctions: async (root: any, args: any, context: any) => {

					if(!context?.jwt?.acl?.can('read', 'CommandFunction')) throw new Error('Not allowed to read CommandFunction list');

					let filter = args.where || {}
					const programs = await prisma.functionalDescription.findMany({
						where: {...filter, organisation: context.jwt.organisation},
                        include: {
                            pages: {
								include: {
									parent: true,
									children: true
								}
							}
                        }
                    });

					return programs.filter((a) => context?.jwt?.acl?.can('read', subject('CommandFunction', a) )).map((program) => {

						let rootDocs = program?.pages?.slice()?.filter((a) => !a.parent)?.sort((a,b) => a.rank?.localeCompare(b.rank))

						const findLabels = (x: any, parent?: string) => {
							let children = program?.pages?.slice()?.filter((a) => a.parentId == x.id);
							return [{id: x.id, label: parent}, ...(children || [])?.sort((a, b) => a.rank?.localeCompare(b.rank))?.map((a, ix) => findLabels(a, parent + `.${ix + 1}`)).reduce((p, v) => p.concat(v), [])]
						}

						let labels = rootDocs.map((x, ix) => findLabels(x, `S${ix + 1}`)).reduce((p, v) => p.concat(v), [] as any[]);

						console.log(labels)

						let pages = program?.pages?.map((x) => ({
							...x,
							label: labels.find((a) => a.id == x.id)?.label
						}))

						return {
							...program,
							pages
						}
					})
				},
				
			},
			Mutation: {
				createCommandFunction: async (root: any, args: {input: {name: string, templatePacks: string[]}}, context: any) => {
					if(!context?.jwt?.acl.can('create', 'CommandFunction')) throw new Error('Cannot create new CommandFunction');

					const program = await prisma.functionalDescription.create({
						data: {
							id: nanoid(),
							name: args.input.name,
							// templatePacks: {
							// 	connect: (args.input.templatePacks || []).map((x) => ({id: x}))
							// },
							// interface: {
							// 	create: {
							// 		id: nanoid(),
							// 		name: 'Default'
							// 	}
							// },
							organisation: context.jwt.organisation
						}
					})
					return program;
				},
				updateCommandFunction: async (root: any, args: {id: string, input: {name: string, templatePacks: string[]}}, context: any) => {
					const currentProgram = await prisma.functionalDescription.findFirst({where: {id: args.id, organisation: context?.jwt?.organisation}});

					if(!currentProgram) throw new Error('CommandFunction not found');
					if(!context?.jwt?.acl.can('update', subject('CommandFunction', currentProgram) )) throw new Error('Cannot update CommandFunction');
					
					const program = await prisma.functionalDescription.update({
						where: {id: args.id},
						data: {
							name: args.input.name,
							// templatePacks: {
							// 	set: args.input.templatePacks.map((x) => ({id: x}))
							// }
						}
					})
					return program
				},
				deleteCommandFunction: async (root: any, args: {id: string}, context: any) => {
					const currentProgram = await prisma.functionalDescription.findFirst({where: {id: args.id, organisation: context?.jwt?.organisation}});
					if(!currentProgram) throw new Error('CommandFunction not found');
					if(!context?.jwt?.acl.can('delete', subject('CommandFunction', currentProgram) )) throw new Error('Cannot delete CommandFunction');
					
					const res = await prisma.functionalDescription.delete({where: {id: args.id}})
					return res != null
				},
                createCommandFunctionPage: async (root: any, args: {fd: string, input: any}, context: any) => {
                    
					const lastPage = await prisma.functionalDescriptionPage.findFirst({
						where: {
							functionalDescriptionId: args.fd,
							parentId: args.input.parent
						},
						orderBy: {
							rank: 'asc'
						}
					})

					const { rank } = lastPage || {}

					let aboveRank = LexoRank.parse(rank || LexoRank.min().toString())
                    let belowRank = LexoRank.parse(LexoRank.max().toString())

                    let newRank = aboveRank.between(belowRank).toString()

					let parentUpdate = args.input.parent ? {
						parent: {
							connect: {
								id: args.input.parent
							}
						}
					} : {}

                    return await prisma.functionalDescriptionPage.create({
                       
                        data: {
                                    id: nanoid(),
                                    name: args.input.name,
                                    // nodes: args.input.nodes,
                                    // edges: args.input.edges,
									rank: newRank.toString(),
									...parentUpdate,
                                    functionalDescription: {
                                        connect: {id: args.fd}
                                    }
                        }
                    });

                },
                updateCommandFunctionPage: async (root: any, args: {schematic: string, id: string, input: any}, context: any) => {
					let parentUpdate = args.input.parent ? {
						parent: {
							connect: {
								id: args.input.parent
							}
						}
					} : {}

					return await prisma.functionalDescriptionPage.update({
                        where: {
                            id: args.id,
                        },
                        data: {
                            name: args.input.name,
							...parentUpdate


                            // nodes: args.input.nodes,
                            // edges: args.input.edges,
                                    // schematic: {
                                    //     connect: {id: args.schematic}
                                    // }
                        }
                    })
                },
                deleteCommandFunctionPage: async (root: any, args: {schematic: string, id: string}, context: any) => {
                    return await prisma.functionalDescriptionPage.delete({where: {id: args.id}})
                },
				updateCommandFunctionPageOrder: async (root: any, args: { fd: string, id: string, parent: string, above: string, below: string }, context: any) => {

					const fd = await prisma.functionalDescription.findFirst({
						where: {
							id: args.fd,
							organisation: context?.jwt?.organisation
						},
						include: {
							pages: true
						}
					})

					if(!fd) throw new Error("CommandFunction not found");

					
					const pages = fd?.pages?.sort((a,b) => (a.rank || '').localeCompare(b.rank || ''))

					const above = pages?.find((a) => a.id === args.above)?.rank;
					const below = pages?.find((a) => a.id === args.below)?.rank;


					// const result = await prisma.$queryRaw<{id: string, rank: string, lead_rank?: string}>`WITH cte as (
                    //     SELECT id, rank FROM "TimelineItem" 
                    //     WHERE organisation=${context?.jwt?.organisation} AND timeline=${args.input?.timelineId}
                    //     ORDER BY rank
                    // ), cte2 as (
                    //     SELECT id, rank, LEAD(rank) OVER (ORDER BY rank) as lead_rank FROM cte
                    // )
                    // SELECT id, rank, lead_rank FROM cte2 WHERE id=${args.prev}`


					// const { rank, lead_rank } = result?.[0];

                    let aboveRank = LexoRank.parse(above || LexoRank.min().toString())
                    let belowRank = LexoRank.parse(below || LexoRank.max().toString())

                    let newRank = aboveRank.between(belowRank).toString()
					

					let parentUpdate = args.parent ? {
						parent: {
							connect: {
								id: args.parent
							}
						}
					} : {}
					const result = await prisma.functionalDescriptionPage.update({
						where: {
							id: args?.id,
						},
						data: {
							rank: newRank.toString(),
							...parentUpdate
						}
					})

					return result.rank === newRank
					
				}
			}
		},
	])
	
	const typeDefs = `

	type Query {
		commandFunctions(where: CommandFunctionWhere): [CommandFunction]!
	}

	type Mutation {
		createCommandFunction(input: CommandFunctionInput!): CommandFunction!
		updateCommandFunction(id: ID!, input: CommandFunctionInput!): CommandFunction!
		deleteCommandFunction(id: ID!): Boolean!

        createCommandFunctionPage(fd: ID, input: CommandFunctionPageInput): CommandFunctionPage!
        updateCommandFunctionPage(fd: ID, id: ID, input: CommandFunctionPageInput): CommandFunctionPage!
        deleteCommandFunctionPage(fd: ID, id: ID): Boolean!

		updateCommandFunctionPageOrder(fd: ID, id: ID, parent: String, above: String, below: String): Boolean
	}


	input CommandFunctionInput {
		name: String	

	}

	input CommandFunctionWhere {
		id: ID
	}


	type CommandFunction {
		id: ID! 
		name: String

        pages: [CommandFunctionPage]

		createdAt: DateTime 

		organisation: HiveOrganisation
	}

    input CommandFunctionPageInput{
        name: String

        nodes: JSON
        edges: JSON

		parent: String
    }

    type CommandFunctionPage {
        id: ID!
        name: String
		label: String

		rank: String

		parent: CommandFunctionPage
		children: [CommandFunctionPage]

        nodes: JSON
        edges: JSON
    }


`
	return {
		typeDefs,
		resolvers
	}
}