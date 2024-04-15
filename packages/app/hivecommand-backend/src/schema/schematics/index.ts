import { PrismaClient } from "@hive-command/data";
import { mergeResolvers } from '@graphql-tools/merge'

import fetch from 'node-fetch'
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import gql from "graphql-tag";
import { nanoid } from "nanoid";
import { subject } from "@casl/ability";

import { LexoRank } from 'lexorank';
import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda'
import moment from "moment";
import { HeadObjectCommand, PutObjectCommand, S3Client, NotFound, GetObjectCommand } from "@aws-sdk/client-s3";

export default (prisma: PrismaClient) => {

	const lambda = new LambdaClient({ region: 'ap-southeast-2' })

	const s3Client = new S3Client({ region: 'ap-southeast-2' })

	const resolvers = mergeResolvers([
		{
			CommandSchematicVersion: {
				createdBy: (root: any) => {
					return { id: root.createdBy }
				},
				compiled: async (root: any) => {
					if (root.compiled) {
						return true;
					} else {
						const headCmd = new HeadObjectCommand({
							Bucket: process.env.SCHEMATIC_BUCKET || '',
							Key: root?.id,
						})

						try {
							const res = await s3Client.send(headCmd);

							await prisma.electricalSchematicVersion.update({
								where: {
									id: root.id
								},
								data: {
									compiled: true
								}
							})
							return true;
						} catch (e) {
							if (e instanceof NotFound) {
								return false;
							}
						}
					}
				}
			},
			Query: {
				commandSchematics: async (root: any, args: any, context: any) => {

					if (!context?.jwt?.acl?.can('read', 'CommandSchematic')) throw new Error('Not allowed to read SchematicList');

					let filter = args.where || {}
					const programs = await prisma.electricalSchematic.findMany({
						where: { ...filter, organisation: context.jwt.organisation },
						include: {
							pages: true,
							templates: true,
							versions: true
						}
					});

					return programs.filter((a) => context?.jwt?.acl?.can('read', subject('CommandSchematic', a)))
				},

			},
			Mutation: {
				createCommandSchematic: async (root: any, args: { input: { name: string, templatePacks: string[] } }, context: any) => {
					if (!context?.jwt?.acl.can('create', 'CommandSchematic')) throw new Error('Cannot create new CommandSchematic');

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
				updateCommandSchematic: async (root: any, args: { id: string, input: { name: string, templatePacks: string[] } }, context: any) => {
					const currentProgram = await prisma.electricalSchematic.findFirst({ where: { id: args.id, organisation: context?.jwt?.organisation } });

					if (!currentProgram) throw new Error('CommandSchematic not found');
					if (!context?.jwt?.acl.can('update', subject('CommandSchematic', currentProgram))) throw new Error('Cannot update CommandSchematic');

					const program = await prisma.electricalSchematic.update({
						where: { id: args.id },
						data: {
							name: args.input.name,
							// templatePacks: {
							// 	set: args.input.templatePacks.map((x) => ({id: x}))
							// }
						}
					})

					return program
				},
				deleteCommandSchematic: async (root: any, args: { id: string }, context: any) => {
					const currentProgram = await prisma.electricalSchematic.findFirst({ where: { id: args.id, organisation: context?.jwt?.organisation } });
					if (!currentProgram) throw new Error('CommandSchematic not found');
					if (!context?.jwt?.acl.can('delete', subject('CommandSchematic', currentProgram))) throw new Error('Cannot delete CommandSchematic');

					const res = await prisma.electricalSchematic.delete({ where: { id: args.id } })
					return res != null
				},
				createCommandSchematicVersion: async (root: any, args: any, context: any) => {

					console.log("Getting schematic");

					const schematic : any = await prisma.electricalSchematic.findFirst({
						where: {
							id: args.id,
							organisation: context?.jwt?.organisation
						},
						include: {
							pages: true,
							versions: true
						}
					})
					
					console.log("Creating new schematic version");

					const { versions } = schematic || {};

					const nextVersion = (versions?.slice()?.sort((a, b) => b.rank - a.rank)?.[0]?.rank || 0) + 1;

					if(schematic)
						delete schematic.versions;

					const version = await prisma.electricalSchematicVersion.create({
						data: {
							id: nanoid(),
							data: schematic || {},
							rank: nextVersion,
							commit: args.input.commit,
							createdBy: context?.jwt?.id,
							schematic: { connect: { id: args.id } }
						}
					})

					console.log("New version created, pushing sourceFiles");

					const sourceKey = `sources/${version.id}`;

					const putCmd = new PutObjectCommand({
						Bucket: process.env.SCHEMATIC_BUCKET,
						Key: sourceKey
					})

					const url = await getSignedUrl(s3Client, putCmd)

					console.log("Created pesigned post")

					const sourceFile = JSON.stringify({
						...schematic,
						version: (version?.rank || 1),
						versionDate: moment(version?.createdAt).format('DD/MM/YY')
					});

					console.log("Posting ", sourceFile.length / 1024 / 1024, "MB")

					await fetch(
						url,
						{
							method: 'PUT',
							body: sourceFile
						})

					console.log("Sent!")
					// await s3Client.send(putCmd);

					const invokeCommand = new InvokeCommand({
						FunctionName: process.env.EXPORT_LAMBDA || '',
						Payload: JSON.stringify({
							sourceKey,
							targetKey: version.id
							// ...currentProgram, 
							// // version: (version?.rank || 0) + 1,
							// version: (version?.rank || 1), 
							// versionDate: moment(version?.createdAt).format('DD/MM/YY') 
						})
					})

					lambda.send(invokeCommand)

					console.log("Lambda triggered")

					return nextVersion + 1;
				},
				exportCommandSchematic: async (root: any, args: { id: string }, context: any) => {

					const currentProgram = await prisma.electricalSchematic.findFirst({
						where: {
							id: args.id,
							organisation: context?.jwt?.organisation
						},
						include: {
							pages: true,
							versions: true
						}
					})

					const version = currentProgram?.versions?.sort((a, b) => b.rank - a.rank)?.[0];


					if (!version?.compiled) {

						const headCmd = new HeadObjectCommand({
							Bucket: process.env.SCHEMATIC_BUCKET || '',
							Key: root?.id,
						})

						try {
							const res = await s3Client.send(headCmd);

							await prisma.electricalSchematicVersion.update({
								where: {
									id: root.id
								},
								data: {
									compiled: true
								}
							})
							
						} catch (e) {
							if (e instanceof NotFound) {
								throw new Error("Version not compiled yet");
							}
						}
					}

					if (!version) throw new Error("No version found");
					// if(version?.compiled){

					const getCmd = new GetObjectCommand({
						Bucket: process.env.SCHEMATIC_BUCKET,
						Key: version.id
					})

					const url = await getSignedUrl(s3Client, getCmd, { expiresIn: 3600 });
					// }else{
					// 	const headCmd = new HeadObjectCommand({
					// 		Bucket: process.env.SCHEMATIC_BUCKET || '',
					// 		Key: version?.id,
					// 	})

					// 	try{
					// 		const res = await s3Client.send(headCmd);

					// 	// if(res.)
					// 	}catch(e){
					// 		if(e instanceof NotFound){
					// 			throw new Error("Schematic not ready yet");
					// 		}
					// 	}
					// }

					// const invokeCommand = new InvokeCommand({
					// 	FunctionName: process.env.EXPORT_LAMBDA || '',
					// 	Payload: JSON.stringify({
					// 		program: { 
					// 			...currentProgram, 
					// 			// version: (version?.rank || 0) + 1,
					// 			version: (version?.rank || 1), 
					// 			versionDate: moment(version?.createdAt).format('DD/MM/YY') 
					// 		}
					// 	})
					// })

					// const result = await lambda.send(invokeCommand)

					// if (result.Payload) {
					// 	let url = Buffer.from(result.Payload).toString('utf-8');
					// 	return url.substring(1, url.length - 1);
					// } else {
					// 	throw new Error("No payload received");
					// }

					return url;
				},
				createCommandSchematicPage: async (root: any, args: { schematic: string, input: any }, context: any) => {

					const lastPage = await prisma.electricalSchematicPage.findFirst({
						where: {
							schematicId: args.schematic
						},
						orderBy: {
							rank: 'desc'
						}
					})

					const { rank } = lastPage || {}


					let aboveRank = LexoRank.parse(rank || LexoRank.min().toString())
					let belowRank = LexoRank.parse(LexoRank.max().toString())

					let newRank = aboveRank.between(belowRank).toString()

					console.log({ rank, aboveRank, belowRank, newRank })

					return await prisma.electricalSchematicPage.create({

						data: {
							id: nanoid(),
							name: args.input.name,
							nodes: args.input.nodes || [],
							edges: args.input.edges || [],
							rank: newRank.toString(),
							templateId: args.input.templateId,
							schematic: {
								connect: { id: args.schematic }
							}
						}
					});

				},
				updateCommandSchematicPage: async (root: any, args: { schematic: string, id: string, input: any }, context: any) => {
					return await prisma.electricalSchematicPage.update({
						where: {
							id: args.id,
						},
						data: {
							name: args.input.name,
							nodes: args.input.nodes,
							edges: args.input.edges,
							templateId: args.input.templateId,
							schematic: {
								connect: { id: args.schematic }
							}
						}
					})
				},
				deleteCommandSchematicPage: async (root: any, args: { schematic: string, id: string }, context: any) => {
					const res = await prisma.electricalSchematicPage.delete({ where: { id: args.id } })
					return res != null;
				},
				updateCommandSchematicPageOrder: async (root: any, args: { schematic: string, id: string, above: string, below: string }, context: any) => {

					const schematic = await prisma.electricalSchematic.findFirst({
						where: {
							id: args.schematic,
							organisation: context?.jwt?.organisation
						},
						include: {
							pages: true
						}
					})

					if (!schematic) throw new Error("Schematic not found");

					console.log(args);

					const pages = schematic?.pages?.sort((a, b) => (a.rank || '').localeCompare(b.rank || ''))


					const aboveIx = pages?.find((a) => a.id == args.above)?.rank;
					const belowIx = pages?.find((a) => a.id == args.below)?.rank;


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

					const result = await prisma.electricalSchematicPage.update({
						where: {
							id: args?.id,
						},
						data: {
							rank: newRank.toString()
						}
					})

					return result.rank == newRank.toString();
				},
				createCommandSchematicPageTemplate: async (root: any, args: { schematic: string, input: any }, context: any) => {
					return await prisma.electricalSchematicPageTemplate.create({
						data: {
							...args.input,
							id: nanoid(),
							schematic: {
								connect: { id: args.schematic }
							}
						}
					});
				},
				updateCommandSchematicPageTemplate: async (root: any, args: { schematic: string, id: string, input: any }, context: any) => {
					return await prisma.electricalSchematicPageTemplate.update({
						where: {
							id: args.id,
						},
						data: {
							...args.input
						}
					});

				},
				deleteCommandSchematicPageTemplate: async (root: any, args: { schematic: string, id: string }, context: any) => {
					const res = await prisma.electricalSchematicPageTemplate.delete({
						where: {
							id: args.id,
						}
					});
					return res != null;
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

		createCommandSchematicVersion(id: ID!, input: CommandSchematicVersionInput): String
		exportCommandSchematic(id: ID!): String

        createCommandSchematicPage(schematic: ID, input: CommandSchematicPageInput): CommandSchematicPage!
        updateCommandSchematicPage(schematic: ID, id: ID, input: CommandSchematicPageInput): CommandSchematicPage!
        deleteCommandSchematicPage(schematic: ID, id: ID): Boolean!


		createCommandSchematicPageTemplate(schematic: ID, input: CommandSchematicPageTemplateInput): CommandSchematicPageTemplate
		updateCommandSchematicPageTemplate(schematic: ID, id: ID, input: CommandSchematicPageTemplateInput): CommandSchematicPageTemplate
		deleteCommandSchematicPageTemplate(schematic: ID, id: ID): Boolean!

		updateCommandSchematicPageOrder(schematic: ID, id: String, above: String, below: String): Boolean
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
		versions: [CommandSchematicVersion]

        pages: [CommandSchematicPage]
		templates: [CommandSchematicPageTemplate]

		createdAt: DateTime 

		organisation: HiveOrganisation
	}

	input CommandSchematicVersionInput {
		commit: String
	}

	type CommandSchematicVersion {
		id: ID
	  
		rank: Int

		compiled: Boolean
	  
		data: JSON
	  
		commit: String
	  
		createdAt: DateTime
	  
		createdBy: HiveUser
	  
		schematic: CommandSchematic 
	}

    input CommandSchematicPageInput{
        name: String

        nodes: JSON
        edges: JSON

		templateId: String
    }

    type CommandSchematicPage {
        id: ID!
        name: String

		rank: String

		template: CommandSchematicPageTemplate

        nodes: JSON
        edges: JSON
    }

	input CommandSchematicPageTemplateInput {
		name: String
		nodes: JSON
	}

	type CommandSchematicPageTemplate {
		id: ID!
		name: String

		nodes: JSON
	}


`
	return {
		typeDefs,
		resolvers
	}
}