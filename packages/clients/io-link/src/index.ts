#!/usr/bin/env node
import { discoverMasters, discoverDevices } from '@io-link/core'

(async () => {
	console.log(`IO-Link Discovering`)
	const masters = await discoverMasters('eth0')	
	console.log(`IO-Link Discovered ${masters.length} masters`)
	
	const result = await Promise.all(masters.map(async (master) => {
		console.log("Discovering master")
		const devices = await discoverDevices(master)
		console.log("Discovered devices", devices)

		const mappedDevices =  await Promise.all(devices.ports.map(async (port) => {
			console.log({port})

			// let ioddDef = await this.ioddManager.lookupDevice(`${port.vendorId}:${port.deviceId}`)
			// if(!ioddDef) {
			// 	console.log("NO IODD", port)
			// 	return port;
			// }
			// let iodd = await this.ioddManager.getIODD(ioddDef?.iodd)

			return {
				...port,
				port: `${port.ix + 1}`,
				// iodd: iodd,
				// inputs: iodd?.function?.inputs?.map((x) => {
				// 		return x?.struct?.map((y) => {
				// 			return {
				// 				key: `${y.name}-${y.bits.subindex}`,
				// 				type: y?.bits?.type
				// 			}
				// 		})
				// 	}).reduce((prev, curr) => prev.concat(curr), [])
				// ,
				// outputs: iodd?.function?.outputs?.map((x) => {
				// 	return x?.struct?.map((y) => {
				// 		return {
				// 			key: `${y.name}-${y.bits.subindex}`,
				// 			type: y?.bits?.type
				// 		}
				// 	})
				// }).reduce((prev, curr) => prev.concat(curr), [])
			}
		}))

		console.log("Discovered devices", {devices})

		// const iodd = await Promise.all(devices.unique.map(async (id) => {
		// 	return await getIODD(this.ioddManager, id)
		// }))

		return {
			id: master.serial,
			name: master.product,
			api: master,
			devices: mappedDevices
		}
	}))

	console.log({result})
	
})()