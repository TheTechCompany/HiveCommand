import { discoverDevices, IOMaster, discoverMasters, getIODD } from "@io-link/core";
import { BasePlugin } from "../Base";
import IODDManager, { createFilter, IODD } from '@io-link/iodd'
import { IngressServer } from "./CallbackServer";

export default class IOLinkPlugin extends BasePlugin {
	public TAG : string = "IO-LINK";

	private ingressServer: IngressServer;

	private networkInterface : string;

	private ioddManager: IODDManager;

	private masters : {id?: string, name?: string, api: IOMaster, devices: any[]}[] = []; 

	private subscriptions : {id: number, result: any, master: string}[] = []


	constructor(networkInterface : string, ioddManager: IODDManager){
		super();

		this.ingressServer = new IngressServer(9000, this.webhook.bind(this))
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

	webhook(id: number, payload: any){
		let subscription = this.subscriptions.find((a) => a.id == id)

		for(var k in payload){
			let parts = k.split('/')
			// console.log("Payload ", parts, payload[k])
			switch(parts[1]){
				case 'iolinkmaster':
					let port = parts[2].match(/\[(.*?)\]/)?.[1]
					if(parts[4] === 'pdin'){
						// let dev = this.devices[`${subscription?.master}-${port}`]
					
						let device = this.masters.find((a) => a.id == subscription?.master)?.devices.find((a) => a.port == port)
						if(!device) return
						const iodd : IODD = device.iodd;
						const filter = createFilter(iodd.function.inputs.map((x) => x.struct.map((y) => {
							let bits = y.bits;
							bits.name = y.name;
							return bits
						})).reduce((prev, curr) => prev.concat(curr), []))

						this.emit('PORT:VALUE', {
							bus: subscription?.master,
							port: port,
							value: filter(payload[k].data)
						})
					
						// dev.registerValue(payload[k].data)
					
					}
					// this.registerDeviceValue(`${subscription?.master}-${port}-${parts[4]}`, payload[k].data)
					break;
				case 'timer[1]':
					break;
				case 'processdatamaster':
					console.log(`IO-Master Temperature: ${payload[k].data}`)
					break;
			}
		}
	}

	async subscribe(bus: string){
		let m = this.masters.find((a) => a.id == bus);
		let devices = m?.devices || [];
		let master = m?.api
		const subscription = await master?.subscribeToPorts(devices.map((x) => x.ix), this.ingressServer.getCallbackURL())
		
		if(!master) return;

		this.subscriptions.push({
			id: -1,
			...subscription,
			result: '',
			master: master.serial || ''
		})

		return subscription
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