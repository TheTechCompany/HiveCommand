import { PrismaClient } from "@hive-command/data";
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
			createCommandDeviceReport(input: CommandDeviceReportInput): CommandDeviceReport
			updateCommandDeviceReportGrid(device: ID, grid: [CommandDeviceReportInput]): [CommandDeviceReport]
			updateCommandDeviceReport(id: ID, input: CommandDeviceReportInput): CommandDeviceReport
			deleteCommandDeviceReport(id: ID): CommandDeviceReport
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
				let query = `SELECT 
								placeholder,
								deviceId,
								key,
								time_bucket_gapfill('5 minute', "lastUpdated") as time, 
								COALESCE(avg(value::float), 0) as value
							FROM "DeviceValue" 
								WHERE deviceId=${root.device?.id} AND placeholder=${root.dataDevice?.id}`;

				let params = [root.device?.id, root.dataDevice?.id]
				// console.log("Analaytics values")

				if(args.startDate){
					// params.push(new Date(args.startDate).toISOString())
					let beforeTime = moment(args.startDate).add(1, 'week');
					if(moment(beforeTime).isAfter(moment())){
						beforeTime = moment();
					}
					const afterTime = moment(args.startDate).toISOString();
					
					params.push(afterTime)
					params.push(beforeTime.toISOString());

					query += ` AND "lastUpdated" >= ${afterTime} AND "lastUpdated" < ${beforeTime.toISOString()}`
				}
				if(root.dataKey?.key) {
					params.push(root.dataKey?.key)

					query += ` AND key=$${params.length}`
				}

				query += ` GROUP BY placeholder, deviceId, key, time ORDER BY time ASC`
				// console.log("Analaytics values", JSON.stringify({pool}))

				// console.log(query, params)

				const result = await prisma.$queryRaw<any[]>`${query}`


				// const result = await client.query(
				// 	query,
				// 	params
				// )				

				// console.log("Analaytics values")

				// await client.release()
				return (result || []).map((row) => ({
					...row,
					timestamp: row.time
				}));
			},
			totalValue: async (root: any, args: any, context: any) => {
					// const client = await pool.connect()

				const { startDate } = args

				let beforeTime = moment(startDate).add(1, 'week')
				const afterTime = moment(startDate).toISOString();

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


				const query = `
					SELECT 			
						sum(SUB.total) as total
					FROM 
						(
							SELECT (try_cast(value, 0) / ${/*timeDimension ||*/ 60}) * EXTRACT(EPOCH from (LEAD("lastUpdated") over (order by "lastUpdated") - "lastUpdated")) as total
							FROM
								"DeviceValue"
							WHERE
								deviceId = ${root.device?.id}
								AND placeholder = ${root.dataDevice?.id}
								AND key = ${root.dataKey?.key}
								AND "lastUpdated" >= ${afterTime}
								AND "lastUpdated" < ${beforeTime.toISOString()}
							GROUP by deviceId, placeholder, key, "lastUpdated", value
						) as SUB
				`

				const result = await prisma.$queryRaw<any[]>`${query}`;

				
				console.log({rows: result})
				return result?.[0]
			}
		},
		Mutation: {
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
						device: {
							connect: {id: args.input.device}
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