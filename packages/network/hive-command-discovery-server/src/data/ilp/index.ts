"use strict"

import { PrismaClient } from "@hive-command/data"
import net from "net"
import { Pool, PoolClient } from "pg"

// const client = new net.Socket()


export const publishToILP = async (
	prisma: PrismaClient,
	rows: {
		device : string,
		deviceId : string,
		value : string,
		valueKey : string
	}[]) => {
	

		await Promise.all(rows.map(async (row) => {
			await prisma.deviceValue.create({
				data: {
					lastUpdated: new Date(),
					deviceId: row.device,
					placeholder: row.deviceId,
					key: row.valueKey,
					value: row.value
				}
			})



			// await .query(`
			// 	INSERT INTO command_device_values 
			// 	(timestamp, device, deviceId, valueKey, value) 
			// 	VALUES 
			// 	(NOW(), $1, $2, $3, $4)
			// `, [row.device, row.deviceId, row.valueKey, row.value])
		}))	

		// return new Promise((resolve, reject) => {
			
		// 	// client.connect(port, host.uri, () => {

				
		// 		const new_rows = rows.map((row) => {
		// 			return `commandDeviceValues,device=${row.device},deviceId=${row.deviceId},valueKey=${row.valueKey} value="${row.value}" ${Date.now() * 1e6}`
		// 		})
				
		// 		function write(idx: number) {
		// 			if (idx === new_rows.length) {
		// 				// so.destroy()
		// 				resolve(idx);
		// 				return
		// 			}
			
		// 			socket.write(new_rows[idx] + "\n", (err) => {
		// 			if (err) {
		// 				console.error(err)
		// 				reject(err);
		// 			}
		// 			write(++idx)
		// 			})
		// 		}
			
		// 		write(0)
				
		// 	// })

		// })
}
