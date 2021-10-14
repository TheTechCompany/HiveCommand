import { DeviceRegister } from "./device-register/DeviceRegister";
import IODDManager from '@io-link/iodd'
import { DeviceDiscovery } from "./device-discovery/DeviceDiscovery";
import { RunnerNetwork } from "../network";

export class IOBus {
	private deviceRegister: DeviceRegister;
	private deviceDiscovery: DeviceDiscovery;
	private ioddManager : IODDManager;

	private network: RunnerNetwork;

	constructor(opts: {storagePath: string, networkInterface: string, network: RunnerNetwork}){
		this.network = opts.network
		this.ioddManager = new IODDManager({
			storagePath: opts.storagePath
		})

		this.deviceDiscovery = new DeviceDiscovery({
			ioddManager: this.ioddManager,
			networkInterface: opts.networkInterface
		})

		this.deviceRegister = new DeviceRegister({storagePath: opts.storagePath, ioddManager: this.ioddManager, network: this.network});

		this.setupListeners()
	}

	async start(){
		await this.deviceDiscovery.discover()
	}

	setupListeners(){
		this.deviceDiscovery.on('NEW:DEVICE', (event) => {
			console.log("Found new device", event)
			this.deviceRegister.registerDevice(event)
		})

		this.deviceDiscovery.on('NEW:MASTER', (event) => {
			this.deviceRegister.registerMaster(event)

		})

		this.deviceDiscovery.on('FINISHED', async (event) => {
			await this.deviceRegister.subscribe()
		})
	}
}