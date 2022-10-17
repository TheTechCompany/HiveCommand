import { PrismaClient, Prisma } from "@hive-command/data";
import moment from "moment";
import { Pool } from "pg";
import {unit as mathUnit} from 'mathjs';
import { nanoid } from "nanoid";

export default (prisma: PrismaClient) => {

    const typeDefs = `
	    type Query {
			commandDeviceValue(device: String, bus : String, port : String): [CommandDeviceValue]
			commandDeviceTimeseries(deviceId: String, device: String, valueKey: String, startDate: String): [CommandDeviceTimeseriesData]
			commandDeviceTimeseriesTotal(deviceId: String, device: String, valueKey: String, startDate: String, endDate: String): CommandDeviceTimeseriesTotal
		
		}

		type Mutation {
			createCommandDeviceReport(page: ID, input: CommandDeviceReportInput): CommandDeviceReport
			updateCommandDeviceReportGrid(device: ID, page: ID, grid: [CommandDeviceReportInput]): [CommandDeviceReport]
			updateCommandDeviceReport(page: ID, id: ID, input: CommandDeviceReportInput): CommandDeviceReport
			deleteCommandDeviceReport(page: ID, id: ID): CommandDeviceReport

			createCommandReportPage(device: ID, input: CommandReportPageInput!): CommandReportPage!
			updateCommandReportPage(device: ID, id: ID, input: CommandReportPageInput!): CommandReportPage!
			deleteCommandReportPage(device: ID, id: ID): CommandReportPage!
		}

		input CommandReportPageInput {
			name: String
		}
	
		type CommandReportPage {
			id: ID
	
			name: String
			reports: [CommandDeviceReport]
	
			createdAt: DateTime
			
			device: CommandDevice
		}

		input CommandDeviceReportInput {
			id: ID
			x: Int
			y: Int
			width: Int
			height: Int

			total: Boolean
			type: String

			dataDevice: String
			dataKey: String

			device: String
		}

		type CommandDeviceReport {
			id: ID! 
			x: Int
			y: Int
			width: Int
			height: Int
	
			dataDevice: CommandProgramDevicePlaceholder 
			dataKey: CommandProgramDeviceState
			total: Boolean
			type: String

			values(startDate: DateTime): [CommandDeviceTimeseriesData]
			totalValue(startDate: DateTime): CommandDeviceTimeseriesTotal

			device: CommandDevice 
		}

        type CommandDeviceTimeseriesTotal  {
            total: Float
        }

        type CommandDeviceTimeseriesData  {
            device: String
            deviceId: String 
            valueKey: String
            value: String
            timestamp: DateTime
        }

        type CommandDeviceValue {
            device: String
            deviceId: String
            value: String
            valueKey: String
        }

    `

    const resolvers = {
		CommandDeviceReport: {
			values: async (root: any, args: {startDate: Date}) => {
				// const client = await pool.connect()
				// console.log("Analaytics values")
		
				/*

  placeholder String
  key String
  value String

  lastUpdated DateTime @default(now())

  device Device @relation(name: "hasSnapshots", fields: [deviceId], references: [id])
  deviceId String 
				*/
				let query = ``;

				let params = [root.device?.id, root.dataDevice?.id]
				// console.log("Analaytics values")

				const afterTime = args.startDate ? moment(args.startDate).set('hour', 0).set('minute', 0) : undefined

				let beforeTime = args.startDate ? moment(args.startDate).add(1, 'week').set('hour', 0).set('minute', 0) : undefined;

				if(beforeTime && moment(beforeTime).isAfter(moment())){
					beforeTime = moment();
				}
				
				// if(args.startDate){
				// 	// params.push(new Date(args.startDate).toISOString())
				// 	let beforeTime = moment(args.startDate).add(1, 'week');
				// 	if(moment(beforeTime).isAfter(moment())){
				// 		beforeTime = moment();
				// 	}
				// 	const afterTime = moment(args.startDate).toISOString();
					
				// 	params.push(afterTime)
				// 	params.push(beforeTime.toISOString());

				// 	query += ` `
				// }
				// if(root.dataKey?.key) {
				// 	params.push(root.dataKey?.key)

				// 	query += ` `
				// }

				// query += ` `
				// console.log("Analaytics values", JSON.stringify({pool}))

				// console.log(query, params)

				
				try{
					const result = await prisma.$queryRaw<any[]>`
					SELECT 
						placeholder,
						"deviceId",
						key,
						time_bucket_gapfill('5 minute', "lastUpdated") as time, 
						COALESCE(avg(value::float), 0) as value
					FROM "DeviceValue" 
						WHERE "deviceId"=${root.device?.id} AND placeholder=${root.dataDevice?.name}
						 ${afterTime ? Prisma.sql`AND "lastUpdated" >= ${afterTime.toDate()}` : Prisma.empty}
						 ${beforeTime ? Prisma.sql`AND "lastUpdated" < ${beforeTime.toDate()}`: Prisma.empty}
						 AND key=${root.dataKey?.key}
						GROUP BY placeholder, "deviceId", key, time ORDER BY time ASC`


						return (result || []).map((row) => ({
							...row,
							timestamp: row.time
						}));
				}catch(e){
					console.log({e})
				}

				// const result = await client.query(
				// 	query,
				// 	params
				// )				

				// console.log("Analaytics values")

				// await client.release()
			
			},
			totalValue: async (root: any, args: any, context: any) => {
					// const client = await pool.connect()

				if(!root.total) return null;
				
				const { startDate } = args

				let beforeTime = moment(startDate).add(1, 'week').set('hour', 23).set('minute', 59)
				const afterTime = moment(startDate).set('hour', 0).set('minute', 0)

				if(moment(beforeTime).isAfter(moment())){
					beforeTime = moment();
				}

				// const session = driver.session()

				//TODO get time dimension

				// const unitResult = await session.run(`
				// 	MATCH (:CommandDevice {id: $id})-[:RUNNING_PROGRAM]->(:CommandProgram)-[:USES_DEVICE]->(device:CommandProgramDevicePlaceholder {name: $name})-[:USES_TEMPLATE]->()-->(stateItem:CommandProgramDeviceState {key: $key})
				// 	OPTIONAL MATCH (device)-[:MAPS_UNIT]->(unitConfig:CommandProgramDeviceUnit)-[:MAPS_STATE_UNIT]->(stateItem)
				// 	RETURN unitConfig{.*}
				// `, { id: deviceId, name: device, key: valueKey })

				// const unitConfig = unitResult.records?.[0]?.get(0)

				// let timeDimension = 60; //divide value by 60 to go from minutes to seconds, divide by 3,600 to go from hours to seconds

				// console.log({unitConfig})
				// if(unitConfig && (unitConfig.displayUnit || unitConfig.inputUnit)){
				// 	let unitRegex = /(.+)\/(.+)/
				// 	let [ fullText, unit, dimension ] = (unitConfig.displayUnit ? unitConfig.displayUnit.match(unitRegex) : unitConfig.inputUnit.match(unitRegex)) || [];
					

				// 	if(dimension != undefined){
				// 		try{
				// 			let timeUnit = mathUnit(dimension).to('seconds');
				// 			console.log("Found", {unit, dimension})

				// 			timeDimension = timeUnit.toNumber()
				// 			console.log({timeDimension})
				// 		}catch(e) {
				// 			console.error("Could not parse time unit", {unit, dimension, e})
				// 		}
				// 	}

				// }

				/*
	
					(

						*

			
			
						
			
						 */

		
				const result = await prisma.$queryRaw<any[]>`
				SELECT 			
					sum(SUB.total) as total
				FROM 
						(SELECT	(NULLIF(value, '0')::numeric / ${60}) * EXTRACT(EPOCH from (LEAD("lastUpdated") over (order by "lastUpdated") - "lastUpdated")) as total
						FROM
							"DeviceValue"
						WHERE
							"deviceId" = ${root.device?.id}
							AND placeholder = ${root.dataDevice?.name}
							AND key = ${root.dataKey?.key}
							AND "lastUpdated" >= ${afterTime.toDate()}
							AND "lastUpdated" < ${beforeTime.toDate()}
						GROUP by "deviceId", placeholder, key, "lastUpdated", value
						) as SUB
				`;

				
				return result?.[0]
			}
		},
		Mutation: {
			createCommandReportPage: async (root: any, args: any, context: any) => {
				const id = nanoid();

				const device = await prisma.device.update({
					where: {id: args.device},
					data: {
						reports: {
							create: [{
								id: id,
								name: args.input.name,
								// reports: [],
								createdAt: new Date(),
								owner: context?.jwt?.id
							}]
						}
					},
					include: {
						reports: true
					}
				})

				return device.reports.find((a) => a.id == id)
			},
			updateCommandReportPage: async (root: any, args: any, context: any) => {

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
									reports: args.input.reports
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
			deleteCommandReportPage: async (root: any, args: any, context: any) => {
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
			createCommandDeviceReport: async (root: any, args: any) => {
				return await prisma.deviceReport.create({
					data: {
						id: nanoid(),
						type: args.input.type,
						total: args.input.total || false,

						x: args.input.x,
						y: args.input.y,
						width: args.input.width,
						height: args.input.height,

						dataDevice: {
							connect: {id: args.input.dataDevice}
						},
						dataKey: {
							connect: {id: args.input.dataKey}
						},
						page: {
							connect: {id: args.page}
						}
					}
				})
			},
			updateCommandDeviceReport: async (root: any, args: any) => {
				return await prisma.deviceReport.update({
					where: {id: args.id},
					data: {
						type: args.input.type,
						total: args.input.total || false,

						x: args.input.x,
						y: args.input.y,
						width: args.input.width,
						height: args.input.height,
						dataDeviceId: args.input.dataDevice,
						dataKeyId: args.input.dataKey
					}
				})
			},
			updateCommandDeviceReportGrid: async (root: any, args: any) => {
				const {device, grid} = args;

				return await Promise.all(grid.map(async (grid_item: any) => {
					let updateQuery : any = {};

					if(grid_item.x) updateQuery['x'] = grid_item.x;
					if(grid_item.y) updateQuery['y'] = grid_item.y;
					if(grid_item.width) updateQuery['width'] = grid_item.width;
					if(grid_item.height) updateQuery['height'] = grid_item.height;

					const result = await prisma.deviceReport.update({
						where: {id: grid_item.id},// device: {id: device}
						data: updateQuery
					})
					return result
				}))
			},
			deleteCommandDeviceReport: async (root: any, args: any) => {
				return await prisma.deviceReport.delete({where: {id: args.id}})
			}
		},
        Query : {
			commandDeviceTimeseriesTotal: async (root: any, args: {
				deviceId: string, //device in quest
				device: string, //deviceId in quest
				valueKey?: string,
				startDate?: string,
			}) => {
				
				// // const client = await pool.connect()

				// const { deviceId, device, valueKey, startDate } = args

				// let beforeTime = moment(startDate).add(1, 'week')
				// const afterTime = moment(startDate).toISOString();

				// if(moment(beforeTime).isAfter(moment())){
				// 	beforeTime = moment();
				// }

				// const session = driver.session()

				// const unitResult = await session.run(`
				// 	MATCH (:CommandDevice {id: $id})-[:RUNNING_PROGRAM]->(:CommandProgram)-[:USES_DEVICE]->(device:CommandProgramDevicePlaceholder {name: $name})-[:USES_TEMPLATE]->()-->(stateItem:CommandProgramDeviceState {key: $key})
				// 	OPTIONAL MATCH (device)-[:MAPS_UNIT]->(unitConfig:CommandProgramDeviceUnit)-[:MAPS_STATE_UNIT]->(stateItem)
				// 	RETURN unitConfig{.*}
				// `, { id: deviceId, name: device, key: valueKey })

				// const unitConfig = unitResult.records?.[0]?.get(0)

				// let timeDimension = 60; //divide value by 60 to go from minutes to seconds, divide by 3,600 to go from hours to seconds

				// console.log({unitConfig})
				// if(unitConfig && (unitConfig.displayUnit || unitConfig.inputUnit)){
				// 	let unitRegex = /(.+)\/(.+)/
				// 	let [ fullText, unit, dimension ] = (unitConfig.displayUnit ? unitConfig.displayUnit.match(unitRegex) : unitConfig.inputUnit.match(unitRegex)) || [];
					

				// 	if(dimension != undefined){
				// 		try{
				// 			let timeUnit = mathUnit(dimension).to('seconds');
				// 			console.log("Found", {unit, dimension})

				// 			timeDimension = timeUnit.toNumber()
				// 			console.log({timeDimension})
				// 		}catch(e) {
				// 			console.error("Could not parse time unit", {unit, dimension, e})
				// 		}
				// 	}

				// }


				// const query = `
				// 	SELECT 			
				// 		sum(SUB.total) as total
				// 	FROM 
				// 		(
				// 			SELECT (try_cast(value, 0) / ${timeDimension || 60}) * EXTRACT(EPOCH from (LEAD(timestamp) over (order by timestamp) - timestamp)) as total
				// 			FROM
				// 				command_device_values
				// 			WHERE
				// 				device = $1
				// 				AND deviceId = $2
				// 				AND valueKey = $3
				// 				AND timestamp >= $4
				// 				AND timestamp < $5
				// 			GROUP by deviceId, device, valueKey, timestamp, value
				// 		) as SUB
				// `//startDate
				// //date_trunc('week', NOW()) 
				// const result = await pool.query(query, [deviceId, device, valueKey, afterTime, beforeTime.toISOString() ])
				// // await client.release()

				// console.log({rows: result.rows})
				// session.close()
				// return result.rows?.[0]
			},
			commandDeviceTimeseries: async (root: any, args: {
				deviceId: string, //device in quest
				device: string, //deviceId in quest
				valueKey?: string,
				startDate?: string,
			}) => {
				// const client = await pool.connect()

		
				// let query = `SELECT 
				// 				device,
				// 				deviceId,
				// 				valueKey,
				// 				time_bucket_gapfill('5 minute', "timestamp") as time, 
				// 				COALESCE(avg(value::float), 0) as value
				// 			FROM command_device_values 
				// 				WHERE deviceId=$1 AND device=$2`;
				// let params = [args.device, args.deviceId]

				// if(args.startDate){
				// 	// params.push(new Date(args.startDate).toISOString())
				// 	let beforeTime = moment(args.startDate).add(1, 'week');
				// 	if(moment(beforeTime).isAfter(moment())){
				// 		beforeTime = moment();
				// 	}
				// 	const afterTime = moment(args.startDate).toISOString();
					
				// 	params.push(afterTime)
				// 	params.push(beforeTime.toISOString());

				// 	query += ` AND timestamp >= $3 AND timestamp < $4`
				// }
				// if(args.valueKey) {
				// 	params.push(args.valueKey)

				// 	query += ` AND valueKey=$${params.length}`
				// }

				// query += ` GROUP BY device, deviceId, valueKey, time ORDER BY time ASC`

				// const result = await pool.query(
				// 	query,
				// 	params
				// )
				// console.log({query, rows: result.rows, params})
				

				// // await client.release()
				// return result.rows?.map((row) => ({
				// 	...row,
				// 	timestamp: row.time
				// }));
			},
			commandDeviceValue: async (root: any, args: {
				bus: string,
				device: string,
				port: string
			}) => {

				// const values = await DeviceValue.find({device: args.device});

				// // const client = await pgClient.connect()

				// // let where = ``;
				// // let whereClause : string[] = []
				// // let whereArgs : {key: string, value: string}[] = []

				// // if(args.bus) {
				// // 	// whereClause.push(`bus=$1`)
				// // 	whereArgs.push({value: args.bus, key: 'bus'})
				// // }

				// // if(args.device){
				// // 	whereArgs.push({value: args.device, key: 'device'})
				// // 	// whereClause.push(`device=$2`)
				// // }

				// // if(args.port){
				// // 	whereArgs.push({value: args.port, key: 'bus'})
				// // }

				// // if(whereClause.length > 0){
				// // 	where += `WHERE ${whereArgs.map((x, ix) => `${x.key}=$${ix + 1}`).join(' AND ')}`
				// // }


				// // const values = await client.query(
				// // 	`SELECT * FROM commandDeviceValues ${where} LATEST BY device,deviceId,valueKey`,
				// // 	[whereArgs.map((x) => x.value)]
				// // )

				// // await client.release()
				
				// return values;
			}
		},
    }

    return {
        typeDefs,
        resolvers
    }
}