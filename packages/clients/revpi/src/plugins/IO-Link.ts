import { discoverDevices, discoverMasters, getIODD } from "@io-link/core";
import { BasePlugin } from "./Base";
import IODDManager from '@io-link/iodd'

export default class IOLinkPlugin extends BasePlugin {
	public TAG : string = "IO-LINK";

	private networkInterface : string;

	private ioddManager: IODDManager;

	constructor(networkInterface : string, ioddManager: IODDManager){
		super();
		this.networkInterface = networkInterface;
		this.ioddManager = ioddManager
	}

	async discover(){
		const masters = await discoverMasters(this.networkInterface)	

		return await Promise.all(masters.map(async (master) => {
			
			const devices = await discoverDevices(master)

			const iodd = await Promise.all(devices.unique.map(async (id) => {
				return await getIODD(this.ioddManager, id)
			}))
			

			return {
				id: master.serial,
				name: master.product,
				devices: devices.ports.map(async (port) => {
					let ioddDef = await this.ioddManager.lookupDevice(`${port.vendorId}:${port.deviceId}`)
					if(!ioddDef) return port;
					let iodd = this.ioddManager.getIODD(ioddDef?.iodd)
					return {
						...port,
						iodd:iodd
					}
				})
			}
		}))
	}
}