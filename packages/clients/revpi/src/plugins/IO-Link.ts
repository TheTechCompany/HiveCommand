import { discoverDevices, IOMaster, discoverMasters, getIODD } from "@io-link/core";
import { BasePlugin } from "./Base";
import IODDManager, { createFilter, IODD } from '@io-link/iodd'

export default class IOLinkPlugin extends BasePlugin {
	public TAG : string = "IO-LINK";

	private networkInterface : string;

	private ioddManager: IODDManager;

	private masters : {id?: string, name?: string, api: IOMaster, devices: any[]}[] = []; 

	constructor(networkInterface : string, ioddManager: IODDManager){
		super();
		this.networkInterface = networkInterface;
		this.ioddManager = ioddManager
	}

	async read(bus: string){
		let master = this.masters.find((a) => a.id == bus)

		return await Promise.all((master?.devices || []).map(async (device) => {
			const value = await master?.api.readPort(device.ix + 1)
			const iodd : IODD = device.iodd;
			const filter = createFilter(iodd.function.inputs.map((x) => x.struct.map((y) => {
				let bits = y.bits;
				bits.name = y.name;
				return bits
			})).reduce((prev, curr) => prev.concat(curr), []))
			return {
				port: device.ix + 1,
				value: filter(value?.data?.value)
			}
		}))
	}

	async discover(){
		const masters = await discoverMasters(this.networkInterface)	

		this.masters = await Promise.all(masters.map(async (master) => {
			
			const devices = await discoverDevices(master)

			const iodd = await Promise.all(devices.unique.map(async (id) => {
				return await getIODD(this.ioddManager, id)
			}))
			

			return {
				id: master.serial,
				name: master.product,
				api: master,
				devices: await Promise.all(devices.ports.map(async (port) => {
					let ioddDef = await this.ioddManager.lookupDevice(`${port.vendorId}:${port.deviceId}`)
					if(!ioddDef) return port;
					let iodd = await this.ioddManager.getIODD(ioddDef?.iodd)
					return {
						...port,
						iodd:iodd
					}
				}))
			}
		}))
		return this.masters.map((x) => ({
			id: x.id,
			name: x.name,
			devices: x.devices
		}))
	}
}