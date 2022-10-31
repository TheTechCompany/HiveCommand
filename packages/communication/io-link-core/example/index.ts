import { discoverDevices, discoverMasters, IOMaster } from "../src";

(async () => {

	const master = new IOMaster('192.168.88.250')

	master.on('init', async () => {
		const port = await master.getPortInfo(2)
		console.log({port})

	})

	// const masters = await discoverMasters('eth0')
	
	// const devices = await Promise.all(masters.map(async (master) => {
	// 	const devices = await discoverDevices(master)
	// 	return devices
	// }))

	// console.log(devices)


})()