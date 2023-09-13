import { PrismaClient } from "@hive-command/data";
import { mergeResolvers } from '@graphql-tools/merge'

import gql from "graphql-tag";
import { nanoid } from "nanoid";
import { subject } from "@casl/ability";

import { LexoRank } from 'lexorank';
import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda'

export default (prisma: PrismaClient) => {
	
	const lambda = new LambdaClient({ region: 'ap-southeast-2'})

	const resolvers = mergeResolvers([
		{
			
			Query: {
				commandSchematics: async (root: any, args: any, context: any) => {

					if(!context?.jwt?.acl?.can('read', 'CommandSchematic')) throw new Error('Not allowed to read SchematicList');

					let filter = args.where || {}
					const programs = await prisma.electricalSchematic.findMany({
						where: {...filter, organisation: context.jwt.organisation},
                        include: {
                            pages: true
                        }
                    });

					return programs.filter((a) => context?.jwt?.acl?.can('read', subject('CommandSchematic', a) ))
				},
				
			},
			Mutation: {
				createCommandSchematic: async (root: any, args: {input: {name: string, templatePacks: string[]}}, context: any) => {
					if(!context?.jwt?.acl.can('create', 'CommandSchematic')) throw new Error('Cannot create new CommandSchematic');

					const program = await prisma.electricalSchematic.create({
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
				updateCommandSchematic: async (root: any, args: {id: string, input: {name: string, templatePacks: string[]}}, context: any) => {
					const currentProgram = await prisma.program.findFirst({where: {id: args.id, organisation: context?.jwt?.organisation}});

					if(!currentProgram) throw new Error('Program not found');
					if(!context?.jwt?.acl.can('update', subject('CommandSchematic', currentProgram) )) throw new Error('Cannot update CommandSchematic');
					
					const program = await prisma.electricalSchematic.update({
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
				deleteCommandSchematic: async (root: any, args: {id: string}, context: any) => {
					const currentProgram = await prisma.electricalSchematic.findFirst({where: {id: args.id, organisation: context?.jwt?.organisation}});
					if(!currentProgram) throw new Error('CommandSchematic not found');
					if(!context?.jwt?.acl.can('delete', subject('CommandSchematic', currentProgram) )) throw new Error('Cannot delete CommandSchematic');
					
					const res = await prisma.electricalSchematic.delete({where: {id: args.id}})
					return res != null
				},

				exportCommandSchematic: async (root: any, args: {id: string}, context: any) => {
					const currentProgram = await prisma.electricalSchematic.findFirst({
						where: {
							id: args.id,
							organisation: context?.jwt?.organisation
						},
						include: {
							pages: true
						}
					})

					const invokeCommand = new InvokeCommand({
						FunctionName: process.env.EXPORT_LAMBDA || '',
						Payload: JSON.stringify({
							program: currentProgram
						})
					})

					const result = await lambda.send(invokeCommand) 
					// {
					// 	FunctionName: process.env.EXPORT_LAMBDA || '',
					// 	Payload: JSON.stringify({
					// 		program: currentProgram
					// 	})
					// }).promise()

					if(result.Payload)
						return Buffer.from(result.Payload).toString('utf-8')
					else 
						throw new Error("No payload received");
				
				},
                createCommandSchematicPage: async (root: any, args: {schematic: string, input: any}, context: any) => {
                    
					const lastPage = await prisma.electricalSchematicPage.findFirst({
						where: {
							schematicId: args.schematic
						},
						orderBy: {
							rank: 'asc'
						}
					})

					const { rank } = lastPage || {}

					let aboveRank = LexoRank.parse(rank || LexoRank.min().toString())
                    let belowRank = LexoRank.parse(LexoRank.max().toString())

                    let newRank = aboveRank.between(belowRank).toString()

                    return await prisma.electricalSchematicPage.create({
                       
                        data: {
                                    id: nanoid(),
                                    name: args.input.name,
                                    nodes: args.input.nodes,
                                    edges: args.input.edges,
									rank: newRank.toString(),
                                    schematic: {
                                        connect: {id: args.schematic}
                                    }
                        }
                    });

                },
                updateCommandSchematicPage: async (root: any, args: {schematic: string, id: string, input: any}, context: any) => {
                    return await prisma.electricalSchematicPage.update({
                        where: {
                            id: args.id,
                        },
                        data: {
                                    name: args.input.name,
                            nodes: args.input.nodes,
                            edges: args.input.edges,
                                    schematic: {
                                        connect: {id: args.schematic}
                                    }
                        }
                    })
                },
                deleteCommandSchematicPage: async (root: any, args: {schematic: string, id: string}, context: any) => {
                    return await prisma.electricalSchematicPage.delete({where: {id: args.id}})
                },
				updateCommandSchematicPageOrder: async (root: any, args: { schematic: string, oldIx: number, newIx: number }, context: any) => {

					const schematic = await prisma.electricalSchematic.findFirst({
						where: {
							id: args.schematic,
							organisation: context?.jwt?.organisation
						},
						include: {
							pages: true
						}
					})

					if(!schematic) throw new Error("Schematic not found");

					console.log(args);
					
					const pages = schematic?.pages?.sort((a,b) => (a.rank || '').localeCompare(b.rank || ''))

					const oldIx = pages?.[args.oldIx];


					const aboveIx = pages?.[args.newIx]?.rank;

					const belowIx = pages?.[args.newIx + 1]?.rank;

					console.log(oldIx.rank)
					// const result = await prisma.$queryRaw<{id: string, rank: string, lead_rank?: string}>`WITH cte as (
                    //     SELECT id, rank FROM "TimelineItem" 
                    //     WHERE organisation=${context?.jwt?.organisation} AND timeline=${args.input?.timelineId}
                    //     ORDER BY rank
                    // ), cte2 as (
                    //     SELECT id, rank, LEAD(rank) OVER (ORDER BY rank) as lead_rank FROM cte
                    // )
                    // SELECT id, rank, lead_rank FROM cte2 WHERE id=${args.prev}`


					// const { rank, lead_rank } = result?.[0];

                    let aboveRank = LexoRank.parse(aboveIx || LexoRank.min().toString())
                    let belowRank = LexoRank.parse(belowIx || LexoRank.max().toString())

                    let newRank = aboveRank.between(belowRank).toString()
					
					console.log(newRank.toString())

					return await prisma.electricalSchematicPage.update({
						where: {
							id: oldIx?.id,
						},
						data: {
							rank: newRank.toString()
						}
					})
					
				}
			}
		},
	])
	
	const typeDefs = `

	type Query {
		commandSchematics(where: CommandSchematicWhere): [CommandSchematic]!
	}

	type Mutation {
		createCommandSchematic(input: CommandSchematicInput!): CommandSchematic!
		updateCommandSchematic(id: ID!, input: CommandSchematicInput!): CommandSchematic!
		deleteCommandSchematic(id: ID!): Boolean!

		exportCommandSchematic(id: ID!): String

        createCommandSchematicPage(schematic: ID, input: CommandSchematicPageInput): CommandSchematicPage!
        updateCommandSchematicPage(schematic: ID, id: ID, input: CommandSchematicPageInput): CommandSchematicPage!
        deleteCommandSchematicPage(schematic: ID, id: ID): Boolean!


		updateCommandSchematicPageOrder(schematic: ID, oldIx: Int, newIx: Int): Boolean
	}


	input CommandSchematicInput {
		name: String	

		templatePacks: [String]
	}

	input CommandSchematicWhere {
		id: ID
	}


	type CommandSchematic {
		id: ID! 
		name: String

        pages: [CommandSchematicPage]

		createdAt: DateTime 

		organisation: HiveOrganisation
	}

    input CommandSchematicPageInput{
        name: String

        nodes: JSON
        edges: JSON
    }

    type CommandSchematicPage {
        id: ID!
        name: String

		rank: String

        nodes: JSON
        edges: JSON
    }


`
	return {
		typeDefs,
		resolvers
	}
}