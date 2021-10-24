import { discoverDevices, IOMaster, discoverMasters, getIODD } from "@io-link/core";
import { BasePlugin } from "../Base";
import IODDManager, { createFilter, createGulper, IODD } from '@io-link/iodd'
import { IngressServer } from "./CallbackServer";
import { SubscriptionLock } from '@hive-command/subscription-lock'

export default class IOLinkPlugin extends BasePlugin {
	public TAG : string = "IO-LINK";

	private ingressServer: IngressServer;

	private networkInterface : string;

	private ioddManager: IODDManager;

	private masters : {id?: string, name?: string, api: IOMaster, devices: any[]}[] = []; 

	private subscriptions : {id: number, result: any, master: string}[] = []

	private lock : SubscriptionLock

	constructor(networkInterface : string, ioddManager: IODDManager){
		super();

		this.lock = new SubscriptionLock({path: `/tmp/`})

		this.ingressServer = new IngressServer(9000, this.webhook.bind(this))
		this.networkInterface = networkInterface;
		this.ioddManager = ioddManager
	}

	// async read(bus: string){
	// 	let master = this.masters.find((a) => a.id == bus)

	// 	return await Promise.all((master?.devices || []).map(async (device) => {
	// 		const value = await master?.api.readPort(device.ix + 1)

	// 		const iodd : IODD = device.iodd;
	// 		const filter = createFilter(iodd.function.inputs.map((x) => x.struct.map((y) => {
	// 			let bits = y.bits;
	// 			bits.name = y.name;
	// 			return bits
	// 		})).reduce((prev, curr) => prev.concat(curr), []))
	// 		return {
	// 			port: device.ix + 1,
	// 			value: filter(value?.data?.value)
	// 		}
	// 	}))
	// }

	webhook(id: number, payload: any){
		console.log("Webhook", id, this.subscriptions, payload)
		let subscription = this.subscriptions.find((a) => a.id == id)

		for(var k in payload){
			let parts = k.split('/')
			// console.log("Payload ", parts, payload[k])
			switch(parts[1]){
				case 'iolinkmaster':
					let port = parts[2].match(/\[(.*?)\]/)?.[1]
					if(parts[4] == 'pdin'){
						// let dev = this.devices[`${subscription?.master}-${port}`]
					
						let device = this.masters.find((a) => a.id == subscription?.master)?.devices.find((a) => `${(a.ix + 1)}` == port)

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
					//  if(parts[4] == 'pdout'){
					// 	let device = this.masters.find((a) => a.id == subscription?.master)?.devices.find((a) => `${(a.ix + 1)}` == port)
						
					// 	if(!device) return

					// 	if(!payload[k].data) return;

					// 	const iodd : IODD = device.iodd;
					// 	const filter = createFilter(iodd.function.outputs.map((x) => x.struct.map((y) => {
					// 		let bits = y.bits;
					// 		bits.name = y.name;
					// 		return bits
					// 	})).reduce((prev, curr) => prev.concat(curr), []))

					// 	this.emit('PORT:VALUE', {
					// 		bus: subscription?.master,
					// 		port: port,
					// 		value: filter(payload[k].data)
					// 	})

					// }
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

		console.log("IO-Link Subscribing", this.masters, bus)
		let m = this.masters.find((a) => a.id == bus);
		let devices = m?.devices || [];
		let master = m?.api
		console.log("Subscribing to ports", devices.map((x) => x.ix))
		const subscription = await master?.subscribeToPorts(devices.map((x) => x.ix + 1), this.ingressServer.getCallbackURL())
		
		if(!master) return;

		this.lock.addSubscription({
			master: master.serial || '',
			id: subscription?.id || -1
		})

		this.subscriptions.push({
			id: -1,
			...subscription,
			result: '',
			master: m?.id || ''
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
						port: `${port.ix + 1}`,
						iodd: iodd,
						inputs: iodd?.function?.inputs?.map((x) => {
								return x?.struct?.map((y) => {
									return {
										key: `${y.name}-${y.bits.subindex}`,
										type: y?.bits?.type
									}
								})
							}).reduce((prev, curr) => prev.concat(curr), [])
						,
						outputs: iodd?.function?.outputs?.map((x) => {
							return x?.struct?.map((y) => {
								return {
									key: `${y.name}-${y.bits.subindex}`,
									type: y?.bits?.type
								}
							})
						}).reduce((prev, curr) => prev.concat(curr), [])
					}
				}))
			}
		}))

		const subscriptionLock = this.lock.isSubscriptionLock();
		if(subscriptionLock){
			console.log("Found subscription lock, unsubscribing now...")
			await Promise.all(subscriptionLock.map(async (lock: {master: string, id: number}) => {
				let currentMaster = this.masters.find((a) => a.id == lock.master)?.api;

				let callbackURL = this.ingressServer.getCallbackURL();
				if(!callbackURL) return;
				await currentMaster?.unsubscribe(lock.id, callbackURL)
			}))
			console.log("Unsubscribed from locked subscriptions")
		}	

		return this.masters.map((x) => ({
			id: x.id,
			name: x.name,
			devices: x.devices
		}))
	}


	async write(bus: string | null, port: string, value: any){
		let master = this.masters.find((a) => a.id == bus)
		let device = master?.devices.find((a) => `${a.ix + 1}` == `${port}`);
	
		let iodd : IODD = device.iodd;

		let gulper = createGulper(iodd.function.outputs.map((func) => {
			return func.struct.map((x) => ({
				...x.bits,
				name: x.name
			}))
		}).reduce((prev, curr) => prev.concat(curr), []))

		let newValue = gulper(value)
		await master?.api.writePort(parseInt(port), newValue)
	}
}