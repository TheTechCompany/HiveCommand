import { discoverMasters, getIODD, discoverDevices } from '@io-link/core'
import IODDManager, { createFilter, IODDBits } from '@io-link/iodd';
import { IOMaster } from '@io-link/core';
import Server from '@hive-command/opcua-server'
// import deviceMap from './ifm-map'
import { DataType, StatusCode, StatusCodes, Variant } from 'node-opcua'
import { convertIODD, IODD, parseIODD } from '@io-link/iodd';
import { IdentityManager } from '../identity';

export class DeviceManager {
	private opcuaServer : Server;

	private ioddManager: IODDManager;

	private networkInterface : string;

	private masters: IOMaster[] = [];
	private devices: {name: string, version: string, port: number, master:number}[] = [];

	private deviceData : {[k: string]: any} = {};

	constructor(opts: {storagePath: string, discoveryServer?: string, networkInterface: string}, identity: IdentityManager){
		this.ioddManager = new IODDManager({
			storagePath: opts.storagePath
		})
		this.networkInterface = opts.networkInterface

		this.opcuaServer = new Server({
			productName: "CommandPilot",
			discoveryServer: opts.discoveryServer
		})

		this.opcuaServer.on('serverRegistered', ()=> {
			console.log("Server Registered")
		})

		this.opcuaServer.addControllerInfo('uptime', DataType.Double, () => identity.identity.uptime)
		this.opcuaServer.addControllerInfo('cpu_cores', DataType.Double, () => identity.identity.hardware.cpus.length)
		this.opcuaServer.addControllerInfo('free_memory', DataType.Double, () => identity.identity.hardware.memory.free)
		// this.opcuaServer.addControllerInfo('cpu_cores', DataType.Double, () => identity.identity.os)
		
	}

	async start(){
		await this.opcuaServer.start()
	}

	registerSubWorker(master: string, port: number, bits: IODDBits[]){
		//Replace with real worker
		const master_hw = this.masters.find((a) => a.id == master)
		const filter = createFilter(bits)
		setInterval(async () => {
			// console.log(this.deviceData)
			const result = await master_hw?.readPort(port)
			if(result?.data){
				// console.log("Read", filter(result?.data?.value))
				this.deviceData[`${master}:${port}`] = filter(result?.data?.value)
			}
		}, 5000)
	}


	async discover(){
		console.log("[Command:DeviceManager] Discovering...")
		const masters = await discoverMasters(this.networkInterface)
		console.log("Discover", masters)

		const devices = await Promise.all<{unique: any[], ports: any[]}>((masters || []).map(async (master) => {
			return await discoverDevices(master)
		}))

		const ids = [...new Set(devices.reduce<any[]>((prev, curr) => prev.concat(curr.unique), []))]
		const flat_devices = devices.reduce<any[]>((prev, curr) => prev.concat(curr.ports), [])

		const iodd = await Promise.all(ids.map(async (id) => {
			return await getIODD(this.ioddManager, id)
		}))

		this.masters = masters;
		this.devices = await Promise.all(flat_devices.map(async (x) => {
			const info = await this.ioddManager.lookupDevice(`${x.vendorId}:${x.deviceId}`)
			let device = {
				...x,
				master: x.master,
				port: x.ix,
				name: info?.name,
				version: info?.version
			}


			if(info?.iodd) {
				const _iodd = this.ioddManager.getIODD(info?.iodd)
			

				device.iodd = _iodd;
				// await this.addDevice(device)
			}

			// if(device.name) await this.opcuaServer.addDevice({name: `${device.master}_${device.port}_${device.name}`, type: type}, {state: {value: DataType.String}})
			
			return device
		}))

		return {masters: masters.map((x) => ({id: x.id, name: x.product})), devices: this.devices, iodd}
	}

}