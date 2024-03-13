import { PrismaClient, Prisma } from "@hive-command/data";
import moment from "moment";
import { Pool } from "pg";
import {unit as mathUnit} from 'mathjs';
import { nanoid } from "nanoid";
import { stringify as csvStringify } from 'csv';

export default (prisma: PrismaClient) => {

    const typeDefs = `
	    type Query {
			commandDeviceValue(device: String, bus : String, port : String): [CommandDeviceValue]
			commandDeviceTimeseries(deviceId: String, device: String, valueKey: String, startDate: String): [CommandDeviceTimeseriesData]
			commandDeviceTimeseriesTotal(deviceId: String, device: String, valueKey: String, startDate: String, endDate: String): CommandDeviceTimeseriesTotal
		}
		

		type Mutation {
			createCommandDeviceAnalytic(page: ID, input: CommandDeviceAnalyticInput): CommandDeviceAnalytic
			updateCommandDeviceAnalyticGrid(device: ID, page: ID, grid: [CommandDeviceAnalyticInput]): [CommandDeviceAnalytic]
			updateCommandDeviceAnalytic(page: ID, id: ID, input: CommandDeviceAnalyticInput): CommandDeviceAnalytic
			deleteCommandDeviceAnalytic(page: ID, id: ID): CommandDeviceAnalytic

			createCommandAnalyticPage(device: ID, input: CommandAnalyticPageInput!): CommandAnalyticPage!
			updateCommandAnalyticPage(device: ID, id: ID, input: CommandAnalyticPageInput!): CommandAnalyticPage!
			deleteCommandAnalyticPage(device: ID, id: ID): CommandAnalyticPage!
		}

		input CommandAnalyticPageInput {
			name: String
		}

		input CommandAnalyticPageWhere{
			ids: [ID]
		}
	
		type CommandAnalyticPage {
			id: ID
	
			name: String
			charts: [CommandDeviceAnalytic]
	
			createdAt: DateTime
			
			device: CommandDevice
		}

		input CommandDeviceAnalyticInput {
			id: ID

			x: Int
			y: Int
			width: Int
			height: Int

			total: Boolean
			type: String

			tagId: String
			subkeyId: String

			unit: String
			timeBucket: String

			device: String
		}

		type CommandDeviceAnalytic {
			id: ID! 
			x: Int
			y: Int
			width: Int
			height: Int
	
			total: Boolean
			type: String

			tag: CommandProgramTag
			subkey: CommandProgramTypeField

			unit: String
			timeBucket: String

			values(startDate: DateTime, endDate: DateTime, format: String): [CommandDeviceTimeseriesData]
			totalValue(startDate: DateTime, endDate: DateTime): CommandDeviceTimeseriesTotal

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
		CommandDeviceAnalytic: {
			values: async (root: any, args: {startDate: Date, endDate?: Date, format?: string}) => {

				const format = args.format || 'json';

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

				console.log({root});

				let query = ``;

				let params = [root.page?.device?.id, root.tag?.id]
				// console.log("Analaytics values")

				const afterTime = args.startDate ? moment(args.startDate) : undefined;

				let beforeTime = args.endDate ? moment(args.endDate) : args.startDate ? moment(args.startDate).add(1, 'week') : undefined;

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

				const timeBucketString = root.timeBucket || '5 minute';

				const timeBucket = mathUnit(timeBucketString).toNumber('seconds');
				
				try{
					const result = await prisma.$queryRaw<any[]>`
					SELECT 
						placeholder,
						"deviceId",
						key,
						time_bucket_gapfill(${timeBucket}::decimal * '1 second'::interval, "lastUpdated") as time, 
						locf(avg(value::float)) as value
					FROM "DeviceValue" 
						WHERE "deviceId"=${root.page?.device?.id} AND placeholder=${root.tag?.name}
						 ${afterTime ? Prisma.sql`AND "lastUpdated" >= ${afterTime.toDate()}` : Prisma.empty}
						 ${beforeTime ? Prisma.sql`AND "lastUpdated" < ${beforeTime.toDate()}`: Prisma.empty}
						 ${root.subkey ? Prisma.sql`AND key=${root.subkey?.name}` : Prisma.empty}
						 
						GROUP BY placeholder, "deviceId", key, time ORDER BY time ASC`



						const jsonResults = (result || []).map((row) => ({
							...row,
							value: row.value || 0,
							timestamp: row.time
						}));

						if(format == 'csv'){
							const csv = await new Promise((resolve, reject) => {
								csvStringify(
									jsonResults, 
									{
										header: true, 
										columns: {
											placeholder: 'device', 
											key: 'subkey', 
											value: 'value', 
											timestamp: 'timestamp'
										}
									},
									(err, output) => {
										if(err) return reject(err);
										resolve(output)
									}
								)
								
							}) 
							return csv;
						}else{
							return jsonResults
						}
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
				
				const { startDate, endDate } = args

				let beforeTime = endDate ? moment(endDate) : startDate ? moment(startDate).add(1, 'week') : undefined
				const afterTime = moment(startDate)

				if(beforeTime && moment(beforeTime).isAfter(moment())){
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

					
				const { unit } = root;
				let unitTimeDimension = 60; //60 = minutedata, 60 * 60 = hrdata, 60 * 60 * 24 = daydata
						
				if(unit){
					try{
						let nu = mathUnit(unit);	
						if(nu.units.length >= 2){
							unitTimeDimension = mathUnit(nu.units[1].unit.name).toNumber('seconds')
						}
					}catch(e){
						console.error("Error making unit", e);
					}
				}

				const result = await prisma.$queryRaw<any[]>`
				SELECT 			
					sum(SUB.total) as total
				FROM 
						(SELECT	(NULLIF(value, '0')::numeric / ${unitTimeDimension}) * EXTRACT(EPOCH from (LEAD("lastUpdated") over (order by "lastUpdated") - "lastUpdated")) as total
						FROM
							"DeviceValue"
						WHERE
							"deviceId" = ${root.page?.device?.id}
							AND placeholder = ${root.tag?.name}
							AND key = ${root.subkey?.name}
							AND "lastUpdated" >= ${afterTime.toDate()}
							AND "lastUpdated" < ${beforeTime?.toDate()}
						GROUP by "deviceId", placeholder, key, "lastUpdated", value
						) as SUB
				`;

				
				return result?.[0]
			}
		},
		Mutation: {
			createCommandAnalyticPage: async (root: any, args: any, context: any) => {
				const id = nanoid();

				const device = await prisma.device.update({
					where: {id: args.device},
					data: {
						analyticPages: {
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
						analyticPages: true
					}
				})

				return device.analyticPages.find((a) => a.id == id)
			},
			updateCommandAnalyticPage: async (root: any, args: any, context: any) => {

				const device = await prisma.device.update({
					where: {
						id: args.device
					},
					data: {
						analyticPages: {
							update: {
								where: {id: args.id},
								data: {
									name: args.input.name,
								}
							}
						}
					},
					include: {
						analyticPages: true
					}
				})

				return device.analyticPages?.find((a) => a.id == args.id);
			},
			deleteCommandAnalyticPage: async (root: any, args: any, context: any) => {
				return await prisma.device.update({
					where: {
						id: args.device
					},
					data: {
						analyticPages: {
							delete: {
								id: args.id
							}
						}
					}
				})
			},
			createCommandDeviceAnalytic: async (root: any, args: any) => {

				let subkey = {};
				if( args.input.subkeyId ){
					subkey = { subkey: { connect : {id: args.input.subkeyId } } };
				}

				return await prisma.analyticPageChart.create({
					data: {
						id: nanoid(),
						type: args.input.type,
						total: args.input.total || false,

						x: args.input.x,
						y: args.input.y,
						width: args.input.width,
						height: args.input.height,

						tag: {
							connect: {id: args.input.tagId}
						},
						...subkey,
						unit: args.input.unit,
						timeBucket: args.input.timeBucket,
						page: {
							connect: {id: args.page}
						}
					}
				})
			},
			updateCommandDeviceAnalytic: async (root: any, args: any) => {

				let subkey = {};
				if( args.input.subkeyId ){
					subkey = { subkey: { connect : {id: args.input.subkeyId } } };
				}

				return await prisma.analyticPageChart.update({
					where: {id: args.id},
					data: {
						type: args.input.type,
						total: args.input.total || false,

						x: args.input.x,
						y: args.input.y,
						width: args.input.width,
						height: args.input.height,

						tag: {
							connect: {id: args.input.tagId}
						},
						...subkey,
						unit: args.input.unit,
						timeBucket: args.input.timeBucket

					}
				})
			},
			updateCommandDeviceAnalyticGrid: async (root: any, args: any) => {
				const {device, grid} = args;

				return await Promise.all(grid.map(async (grid_item: any) => {
					let updateQuery : any = {};

					if(grid_item.x) updateQuery['x'] = grid_item.x;
					if(grid_item.y) updateQuery['y'] = grid_item.y;
					if(grid_item.width) updateQuery['width'] = grid_item.width;
					if(grid_item.height) updateQuery['height'] = grid_item.height;

					const result = await prisma.analyticPageChart.update({
						where: {id: grid_item.id},// device: {id: device}
						data: updateQuery
					})
					return result
				}))
			},
			deleteCommandDeviceAnalytic: async (root: any, args: any) => {
				return await prisma.analyticPageChart.delete({where: {id: args.id}})
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