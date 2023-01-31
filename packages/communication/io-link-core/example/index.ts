import { discoverDevices, discoverMasters, IOMaster } from "../src";

(async () => {

	const master = new IOMaster('192.168.47.137')

	master.on('init', async () => {
		
		// master.
		// const ipResp = await master.getIP();
		// console.log({ipResp: ipResp?.data})

		const res = await master.getPortInfo(1)
		console.log({res});
		// console.log("Set IP");
		// const res = await master.setIP('192.168.44.155') //151

		// console.log(res?.config)

		// const data = res?.data;
		// console.log(data)


		// const port = await master.getPortInfo(2)
		// console.log({port})

	})

	// const masters = await discoverMasters('eth0')
	
	// const devices = await Promise.all(masters.map(async (master) => {
	// 	const devices = await discoverDevices(master)
	// 	return devices
	// }))

	// console.log(devices)


})()