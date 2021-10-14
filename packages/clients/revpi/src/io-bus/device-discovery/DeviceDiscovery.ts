import { discoverDevices, discoverMasters, getIODD, IOMaster } from "@io-link/core"
import IODDManager, { convertIODD, parseIODD } from '@io-link/iodd'
import { EventEmitter } from "events";
export class DeviceDiscovery extends EventEmitter {

	private ioddManager : IODDManager;
	private networkInterface: string;

	private ioMasters: IOMaster[] = []

	constructor(opts: {ioddManager: IODDManager, networkInterface: string}){
		super();
		this.ioddManager = opts.ioddManager
		this.networkInterface = opts.networkInterface
	}


	async discover(){
		console.log("[Command:DeviceManager] Discovering...")
		const masters = await discoverMasters(this.networkInterface)
		console.log("[Command]: Found ${master.length} IO-Link masters")

		masters.forEach((master) => {
			this.emit('NEW:MASTER', master)
		})

		const devices = await Promise.all<{unique: any[], ports: any[]}>((masters || []).map(async (master) => {
			return await discoverDevices(master)
		}))

		const ids = [...new Set(devices.reduce<any[]>((prev, curr) => prev.concat(curr.unique), []))]
		const flat_devices = devices.reduce<any[]>((prev, curr) => prev.concat(curr.ports), [])

		const iodd = await Promise.all(ids.map(async (id) => {
			return await getIODD(this.ioddManager, id)
		}))

		this.ioMasters = masters;
		
		const ioDevices = await Promise.all(flat_devices.map(async (x) => {
			const info = await this.ioddManager.lookupDevice(`${x.vendorId}:${x.deviceId}`)
			let device = {
				...x,
				ix: x.ix + 1,
				master: x.master,
				port: x.ix + 1,
				name: info?.name,
				version: info?.version
			}


			if(info?.iodd) {
				const _iodd = await this.ioddManager.getIODD(info?.iodd)
				// const parsed = await parseIODD(_iodd)
				// const iodd = convertIODD(parsed)

				device.iodd = _iodd;

				this.emit('NEW:DEVICE', device)
				// await this.addDevice(device)
			}

			// if(device.name) await this.opcuaServer.addDevice({name: `${device.master}_${device.port}_${device.name}`, type: type}, {state: {value: DataType.String}})
			
			return device
		}))

		this.emit('FINISHED')

		// return {masters: masters.map((x) => ({id: x.id, name: x.product})), devices: this.devices, iodd}
	}

}