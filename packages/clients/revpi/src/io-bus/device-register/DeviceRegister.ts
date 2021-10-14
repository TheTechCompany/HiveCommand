import { IOMaster } from "@io-link/core";
import { DeviceIO } from "../device-io/DeviceIO";
import { IngressServer } from "./CallbackServer";
import fastq from 'fastq'
import path from 'path'
import { existsSync, readFile, readFileSync, writeFileSync } from "fs";
import IODDManager from '@io-link/iodd'
import { RunnerNetwork } from "../../network";
import { Device } from "../device/Device";
import { IODDDevice } from "../device/IODDDevice";
import ifmMap from "../ifm-map";

export class DeviceRegister {
	private devices : {[key: string]: Device} = {};
	private masters : {[key: string]: IOMaster} = {};

	private values : {[key: string]: any} = {};

	private network : RunnerNetwork;

	private io : DeviceIO;
	private callbackServer? : IngressServer;

	private ioddManager: IODDManager;

	private subscriptions : {id: number, result: any, master: string}[] = []
	// private registrationQueue : fastq.queueAsPromised = fastq.promise(this.register.bind(this), 1);

	private opts: { storagePath: string, ioddManager: IODDManager, network: RunnerNetwork };
	constructor(opts: {storagePath: string, ioddManager: IODDManager, network: RunnerNetwork}){
		this.ioddManager = opts.ioddManager
		this.opts = opts;
		this.network = opts.network
		this.io = new DeviceIO();

		// this.callbackServer.setup()
	}

	async webhook(id: number, payload: any){
		// console.debug("Webhook received", id)/

		let subscription = this.subscriptions.find((a) => a.id == id)

		for(var k in payload){
			let parts = k.split('/')
			// console.log("Payload ", parts, payload[k])
			switch(parts[1]){
				case 'iolinkmaster':
					let port = parts[2].match(/\[(.*?)\]/)?.[1]
					if(parts[4] === 'pdin'){
						let dev = this.devices[`${subscription?.master}-${port}`]
						
						// const devIodd = await this.ioddManager.lookupDevice(`${dev?.iodd?.vendorId}-${dev?.iodd?.deviceId}`)
						// if(!devIodd?.iodd) return new Error(`Couldn't find iodd for ${dev.iodd.vendorId}-${dev.iodd.deviceId}`)
						
						// const iodd = await this.ioddManager.getIODDFilter(dev?.iodd)
						dev.registerValue(payload[k].data)
						// payload[k].data = iodd(payload[k].data)
					}
					this.registerDeviceValue(`${subscription?.master}-${port}-${parts[4]}`, payload[k].data)
					break;
				case 'timer[1]':
					break;
				case 'processdatamaster':
					console.log(`IO-Master Temperature: ${payload[k].data}`)
					break;
			}
		}
		// console.log("Subscription", subscription)
		
	}

	async registerDevice(device: any){
		console.log("Registering", device)
		const dev = new IODDDevice(`${device.master}-${device.ix}`, device.ix, device, device.iodd);
		this.devices[`${device.master}-${device.ix}`] = dev

		// this.network.addDevice(dev, (ifmMap as any)[device.name], (key?: string) => {
		// 	console.log("Fetching from registration Callback")
		// 	if(key)
		// 	return this.devices[`${device.master}-${device.ix}`].value?.[key]
		// })

		
		// await this.registrationQueue.push(device)
		// await this.subscribeToDevice(device)
	}

	// async register(event: any){
	// 	const subscription = await this.subscribeToDevice(event)
	// 	console.log(subscription)
	// }

	registerMaster(master: IOMaster){
		console.log("Registering Master", master)
		if(!master.serial) return new Error("No serial found on master");
		this.masters[master.serial] = master;

	}

	writeSubscriptionLock(subscriptions: {master: string, id: number}[]){
		writeFileSync(path.join(this.opts.storagePath, './subscription.lock'), JSON.stringify(subscriptions))
	}

	isSubscriptionLock(){
		if(existsSync(path.join(this.opts.storagePath, './subscription.lock'))){
			const lock = readFileSync(path.join(this.opts.storagePath, './subscription.lock'), 'utf8')
			return JSON.parse(lock)
		}else{
			return false
		}
	}

	async subscribe(){
		this.callbackServer = new IngressServer(8090, this.webhook.bind(this));

		const subscriptionLock = this.isSubscriptionLock();
		if(subscriptionLock){
			console.log("Found subscription lock, unsubscribing now...")
			await Promise.all(subscriptionLock.map(async (lock: {master: string, id: number}) => {
				let currentMaster = this.masters[lock.master];

				let callbackURL = this.callbackServer?.getCallbackURL();
				if(!callbackURL) return;
				await currentMaster.unsubscribe(lock.id, callbackURL)
			}))
			console.log("Unsubscribed from locked subscriptions")
		}	


		let masters = Object.keys(this.masters).map((x) => this.masters[x])
		let allDevices = Object.keys(this.devices).map((x) => this.devices[x])
		
		const subscriptions = await Promise.all(masters.filter((a) => a.serial).map(async (master) => {
			let devices = allDevices.filter((a) => master.serial && a.name.indexOf(master.serial) > -1)

			const result = await master.subscribeToPorts(devices.map((x) => x.port), this.callbackServer?.getCallbackURL())
			
			return {
				...result,
				master: master.serial || ''
			}
		}))

		this.writeSubscriptionLock(subscriptions);

		this.subscriptions = subscriptions

		return subscriptions;
		// if(!master) throw new Error("Device has no controller");

		// return await master.subscribePort(device.ix, this.callbackServer.getCallbackURL())
	}

	registerDeviceValue(device: any, value: any){
		if(this.values[device] !== value){
			console.log(`Device ${device} updated to ${value}`)
			this.values[device] = value;
		}
		// console.log("Devic")
		// this.values[device] = value;
	}

	unregisterDevice(){

	}
}