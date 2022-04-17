import { PrismaClient } from "@prisma/client";
import moment from "moment";
import { Pool } from "pg";
import {unit as mathUnit} from 'mathjs';

export default (prisma: PrismaClient, pool: Pool) => {

    const typeDefs = `
	    type Query {
			commandDeviceValue(device: String, bus : String, port : String): [CommandDeviceValue]
			commandDeviceTimeseries(deviceId: String, device: String, valueKey: String, startDate: String): [CommandDeviceTimeseriesData]
			commandDeviceTimeseriesTotal(deviceId: String, device: String, valueKey: String, startDate: String, endDate: String): CommandDeviceTimeseriesTotal
		
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