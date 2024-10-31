import { PrismaClient, Prisma } from "@hive-command/data";
import moment from "moment";
import { Pool } from "pg";
import {unit as mathUnit} from 'mathjs';
import { nanoid } from "nanoid";
import { stringify as csvStringify } from 'csv';
import xlsx from 'xlsx'
import { GetObjectCommand, DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
const {getSignedUrl} = require("@aws-sdk/s3-request-presigner");

const client = new S3Client({region: 'ap-southeast-2'});

export default (prisma: PrismaClient) => {

    const typeDefs = `

		type Mutation {
			createCommandDeviceReport(device: ID, input: CommandDeviceReportInput): CommandDeviceReport
			updateCommandDeviceReport(device: ID, id: ID, input: CommandDeviceReportInput): CommandDeviceReport
			deleteCommandDeviceReport(device: ID, id: ID): CommandDeviceReport

			createCommandDeviceReportInstance(device: ID, report: ID): CommandDeviceReportInstance

			createCommandDeviceReportField(report: ID, input: CommandDeviceReportFieldInput!): CommandDeviceReportField!
			updateCommandDeviceReportField(report: ID, id: ID, input: CommandDeviceReportFieldInput!): CommandDeviceReportField!
			deleteCommandDeviceReportField(report: ID, id: ID): CommandDeviceReportField!
		}

		input CommandDeviceReportFieldInput {
			device: String
			key: String
			bucket: String
		}

		input CommandDeviceReportInput {
			name: String

			recurring: Boolean

			startDate: DateTime
			endDate: DateTime

			reportLength: String
		}

		type CommandDeviceReportInstance {
			id: ID

			fileId: String

			done: Boolean
		  
			startDate: DateTime
			endDate: DateTime
		  
			version: String
		  
			report: CommandDeviceReport
		  
			url: String

			createdAt: DateTime
		}

		type CommandDeviceReport {
			id: ID! 

			name: String
			fields: [CommandDeviceReportField]
			
			recurring: Boolean

			startDate: DateTime
			endDate: DateTime
			reportLength: String
			
			device: CommandDevice 

			instances: [CommandDeviceReportInstance]

			createdAt: DateTime
		}

		type CommandDeviceReportField {
			id: ID!

			device: CommandProgramTag
		  
			key: CommandProgramTypeField

			createdAt: DateTime
		  
			bucket: String
		}

    `

    const resolvers = {
		CommandDeviceReportInstance: {
			// endDate: (root: any) => {
			// }
			url: async (root: any) => {
				try{
					const getCommand = new GetObjectCommand({Bucket: process.env.REPORT_BUCKET || 'test-bucket', Key: `${root.id}.xlsx`});

					return getSignedUrl(client, getCommand, {expiresIn: 3600});
				}catch(err){

				}
			}
		},
		Mutation: {
			createCommandDeviceReport: async (root: any, args: any, context: any) => {
				const id = nanoid();

				const device = await prisma.device.update({
					where: {id: args.device},
					data: {
						reports: {
							create: [{
								id: id,
								name: args.input.name,
								recurring: args.input.recurring,
								startDate: args.input.startDate,
								endDate: args.input.endDate || null,
								reportLength: !args.input.reportLength ? moment(args.input.startDate).diff(moment(args.input.endDate), 'seconds') + 's' : args.input.reportLength
								// reports: [],
							}]
						}
					},
					include: {
						reports: true
					}
				})

				return device.reports.find((a) => a.id == id)
			},
			updateCommandDeviceReport: async (root: any, args: any, context: any) => {

				const device = await prisma.device.update({
					where: {
						id: args.device
					},
					data: {
						reports: {
							update: {
								where: {id: args.id},
								data: {
									version: nanoid(),
									name: args.input.name,
									recurring: args.input.recurring,
									startDate: args.input.startDate,
									endDate: args.input.endDate || null,
									reportLength: (args.input.reportLength == null || args.input.reportLength == undefined) ? moment(args.input.startDate).diff(moment(args.input.endDate), 'seconds') + 's' : args.input.reportLength
								}
							}
						}
					},
					include: {
						reports: true
					}
				})

				return device.reports?.find((a) => a.id == args.id);
			},
			deleteCommandDeviceReport: async (root: any, args: any, context: any) => {

				const reports = await prisma.deviceReportInstance.findMany({
					where: {
						report: {
							id: args.id
						}
					}
				})

				await Promise.all(reports.map(async (report) => {
					const deleteCmd = new DeleteObjectCommand({
						Key: report.fileId,
                        Bucket: process.env.REPORT_BUCKET || "test-bucket",
					})

					await client.send(deleteCmd)
				}))
				
				return await prisma.device.update({
					where: {
						id: args.device
					},
					data: {
						reports: {
							delete: {
								id: args.id
							}
						}
					}
				})
			},
			createCommandDeviceReportInstance: async (root: any, args: any) => {
				const report = await prisma.deviceReport.findFirst({
					where: {
						device: {id: args.device},
						id: args.report
					}
				})
				if(!report) throw new Error('No device report');
				if(report?.recurring) throw new Error(`Can't instantiate recurring reports manually`);
				if(!report.endDate) throw new Error('Need endDate for report compilation');

				const id = nanoid();
				
				return await prisma.deviceReportInstance.create({
					data: {
						id,
						startDate: report.startDate,
						endDate: report.endDate,
						report: {connect: {id: report.id}},
                        version: report.version,
                        fileId: `${id}.xlsx`,
						done: false
					}
				})

			},
			createCommandDeviceReportField: async (root: any, args: any) => {

				let key = {};
				if( args.input.key ){
					key = { key: { connect : {id: args.input.key } } };
				}

				let device = {}
				if(args.input.device){
					device = {device: {connect: {id: args.input.device}}}
				}

				const [ field, report ] = await Promise.all([
					prisma.deviceReportField.create({
					data: {
						id: nanoid(),

						bucket: args.input.bucket,
						...device,
						
						...key,
						report: {
							connect: {id: args.report}
						}
					}
				}),
				prisma.deviceReport.update({
					where: {
						id: args.report
					},
					data: {
						version: nanoid()
					}
				})]);
				return field;
			},
			updateCommandDeviceReportField: async (root: any, args: any) => {

				let key = {};
				if( args.input.key ){
					key = { key: { connect : {id: args.input.key } } };
				}else {
					key = {key: {disconnect: true}}
				}

				let device = {}
				if(args.input.device){
					device = {device: {connect: {id: args.input.device}}}
				}else{
					device = {device: {disconnect: true}}
				}

				const [field, report] = await Promise.all([
				prisma.deviceReportField.update({
					where: {id: args.id},
					data: {
						bucket: args.input.bucket,
						...device,						
						...key
					}
				}),
				prisma.deviceReport.update({
					where: {
						id: args.report
					},
					data: {
						version: nanoid()
					}
				})])
				return field;
			},
			deleteCommandDeviceReportField: async (root: any, args: any) => {
				const [ field, report ] = await Promise.all([
				 prisma.deviceReportField.delete({where: {id: args.id}}),
				prisma.deviceReport.update({
					where: {
						id: args.report
					},
					data: {
						version: nanoid()
					}
				})])
				return field;
			}
		}
    }

    return {
        typeDefs,
        resolvers
    }
}