import { discoverDevices, discoverMasters } from "@io-link/core";

(async () => {
	const masters = await discoverMasters('eth0')
	
	const devices = await Promise.all(masters.map(async (master) => {
		const devices = await discoverDevices(master)
		return devices
	}))

	console.log(devices)
})()