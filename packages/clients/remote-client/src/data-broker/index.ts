import { Pool, PoolClient, } from 'pg'

import { Models, connect_data, disconnect_data } from '@hive-command/data'
const { DeviceValue } = Models;

export class DataBroker {

	private pool? : Pool;
	private client? : PoolClient;

	constructor(){

		// connect_data()
	}

	async connect(){
		await connect_data()
		this.pool = new Pool({
			// database: 'qdb',
			host: process.env.TIMESERIES_HOST,
			port: 5432,
			user: 'postgres',
			password: process.env.TIMESERIES_PASSWORD,
		})

		this.client = await this.pool.connect()
	}

	async disconnect(){
		await this.client?.release()
		await disconnect_data()
	}

	async writeEntry(device: string, deviceId: string, valueKey: string, value: any){
		if(!this.client){
			this.client = await this.pool?.connect()
		}

		console.log("Write", device, deviceId, valueKey, value)

		await Promise.all([
			(async () => {
				await this.client?.query(`
					INSERT INTO command_device_values
					(timestamp, device, deviceId, valueKey, value)
					VALUES
					(NOW(), $1, $2, $3, $4)
				`, [device, deviceId, valueKey, value])
			})(),
			(async () => {
				await DeviceValue.updateOne({
					device,
					deviceId,
					valueKey
				}, {
					$set: {
						device,
						deviceId,
						value,
						valueKey,
					}
				}, {upsert: true})
			})()
		])
	}


}