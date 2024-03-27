import { PrismaClient, Prisma } from "@hive-command/data";
import moment from "moment";
import { Pool } from "pg";
import {unit as mathUnit} from 'mathjs';
import { nanoid } from "nanoid";
import { stringify as csvStringify } from 'csv';
import xlsx from 'xlsx'

export default (prisma: PrismaClient) => {

    const typeDefs = `

		type Mutation {
			downloadDeviceReports(device: ID, report: ID, startDate: DateTime, endDate: DateTime): CommandDeviceReportInstance

			createCommandDeviceReport(device: ID, input: CommandDeviceReportInput): CommandDeviceReport
			updateCommandDeviceReport(device: ID, id: ID, input: CommandDeviceReportInput): CommandDeviceReport
			deleteCommandDeviceReport(device: ID, id: ID): CommandDeviceReport

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
			xlsx: String

			startDate: DateTime
			endDate: DateTime

			report: CommandDeviceReport
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
		CommandDeviceReport: {
			// endDate: (root: any) => {
			// }
		},
		Mutation: {
			downloadDeviceReports: async (root: any, args: any, context: any) => {

				const report = await prisma.deviceReport.findFirst({
					where: {
						device: {
							id: args.device
						},
						id: args.report
					},
					include: {
						fields: {
							include: {
								device: true,
								key: true
							}
						}
					}
				})


				const id = nanoid();

				console.time(`Creating workbook ${id}`)

				const workbook = xlsx.utils.book_new();

				const fields = (report?.fields || []).filter((a) => a.bucket && a.device);

				for(var i = 0; i < (fields || []).length; i++){
					const field = fields[i];

					console.time(`Creating worksheet ${i}-${id}`)

					const period = mathUnit(field.bucket || '1 minute').toNumber('seconds');

					const result : any[] = await prisma.$queryRaw`
						SELECT placeholder, key, avg(value::float) as value, time_bucket_gapfill(${period}::decimal * '1 second'::interval, "lastUpdated") as time 
						FROM "DeviceValue"
						WHERE "deviceId" = ${args.device} 
						AND placeholder=${field.device?.name}
						${field.key ? Prisma.sql` AND key=${field.key?.name}` : Prisma.empty} 
						AND "lastUpdated" > ${args?.startDate} 
						AND "lastUpdated" < ${args.endDate}
						GROUP BY placeholder, key, time ORDER BY time ASC
					`

					const sheet = xlsx.utils.json_to_sheet(result.map((x) => ({...x, time: new Date(x).getTime() })));
					xlsx.utils.book_append_sheet(workbook, sheet, `${field.device?.name}${field.key ? '.'+ field.key?.name : ''}`)

					console.timeEnd(`Creating worksheet ${i}-${id}`)
				}

				console.timeEnd(`Creating workbook ${id}`)


				return {
					xlsx: Buffer.from(xlsx.write(workbook, {type: 'buffer', bookType: 'xlsx'})).toString('base64')
				}
			},
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

				console.log({args})
				const device = await prisma.device.update({
					where: {
						id: args.device
					},
					data: {
						reports: {
							update: {
								where: {id: args.id},
								data: {
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
			createCommandDeviceReportField: async (root: any, args: any) => {

				let key = {};
				if( args.input.key ){
					key = { key: { connect : {id: args.input.key } } };
				}

				let device = {}
				if(args.input.device){
					device = {device: {connect: {id: args.input.device}}}
				}

				return await prisma.deviceReportField.create({
					data: {
						id: nanoid(),

						bucket: args.input.bucket,
						...device,
						
						...key,
						report: {
							connect: {id: args.report}
						}
					}
				})
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

				return await prisma.deviceReportField.update({
					where: {id: args.id},
					data: {
						bucket: args.input.bucket,
						...device,						
						...key
					}
				})
			},
			deleteCommandDeviceReportField: async (root: any, args: any) => {
				return await prisma.deviceReportField.delete({where: {id: args.id}})
			}
		}
    }

    return {
        typeDefs,
        resolvers
    }
}