import { PrismaClient } from "@hive-command/data";
import { mergeResolvers } from '@graphql-tools/merge'

import gql from "graphql-tag";
import { nanoid } from "nanoid";
import { subject } from "@casl/ability";


export default (prisma: PrismaClient) => {
	
	const resolvers = mergeResolvers([
		{
			
			Query: {
				commandSchematics: async (root: any, args: any, context: any) => {

					if(!context?.jwt?.acl?.can('read', 'CommandSchematic')) throw new Error('Not allowed to read SchematicList');

					let filter = args.where || {}
					const programs = await prisma.electricalSchematic.findMany({
						where: {...filter, organisation: context.jwt.organisation}
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
					const currentProgram = await prisma.program.findFirst({where: {id: args.id, organisation: context?.jwt?.organisation}});
					if(!currentProgram) throw new Error('Program not found');
					if(!context?.jwt?.acl.can('delete', subject('CommandSchematic', currentProgram) )) throw new Error('Cannot delete CommandSchematic');
					
					const res = await prisma.electricalSchematic.delete({where: {id: args.id}})
					return res != null
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

		createdAt: DateTime 

		organisation: HiveOrganisation
	}


`
	return {
		typeDefs,
		resolvers
	}
}