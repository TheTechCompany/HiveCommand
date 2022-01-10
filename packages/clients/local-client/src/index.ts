import process from 'process'
import { CommandIdentity } from '@hive-command/identity'
import { CommandLogging } from '@hive-command/logging'

import IODDManager, { IODD } from '@io-link/iodd'
import { sendSMS } from '@hive-command/sms'
import cleanup from 'node-cleanup'
import { Controller } from './controller'
import { Machine } from './machine'
import path from 'path/posix';
import { TerminalDisplay } from './display'

export interface CommandEnvironment {
	id: string;
	type: string;
	name: string;
	devices?: {ix: number, product: string, inputs?: any[], outputs?: any[], iodd: any}[];
}

export interface CommandClientOptions {
	networkInterface?: string;
	storagePath?: string
	commandCenter? : string
	healthCenter?: string;

	privateKey?: string
	discoveryServer?: string

	healthCheck?: {
		number: string,
		message: string,
		interval: number,
		username: string,
		password: string
	}

	ignorePlugins?: string[];

	pluginDir? : string;

	blessed?: boolean;
}

export class CommandClient { 

	private environment : CommandEnvironment[] = [];

	private machine? : Machine;

	private logs : CommandLogging;

	private controller : Controller;

	private identity : CommandIdentity;

	private options : CommandClientOptions;

	private display?: TerminalDisplay;

	constructor(opts: CommandClientOptions){
		this.options = opts;

		this.logs = new CommandLogging();

		this.logs.log(`Starting Command Client...`);

		this.identity = new CommandIdentity({
			identityServer: opts.commandCenter || 'http://localhost:8080',
		});
		
		if(!this.identity) throw new Error("Unable to find credentials");

		this.machine = new Machine({
			pluginDir: opts.pluginDir || path.join(__dirname, `../../../plugins`)
		})

		this.controller = new Controller({
			commandCenter: opts.commandCenter || '',
			valueBank: {
				get: this.machine.getByKey.bind(this),
				getDeviceMode: this.machine.getDeviceMode.bind(this),
				setDeviceMode: this.machine.setDeviceMode.bind(this), 
				requestState: async (device, key, value) => await this.machine?.requestState({device: device, value: {[key]: value}}),
				requestAction: async (device, action) => await this.machine?.requestOperation({device, operation: action})
			},
			machine: this.machine,
		})
		

		if(opts.blessed){
			this.display = new TerminalDisplay(this.machine)
		}

		cleanup(this.shutdown.bind(this))

		process.on('uncaughtException', function (err) {
			console.error(err.stack);
			console.log("Node NOT Exiting...");
		});
	}

	async kill(){

		await this.machine?.shutdown()
		await this.controller.stop();
		
	}


	shutdown(exitCode: number | null, signal: string | null) : boolean | void | undefined {
		new Promise(async (resolve) => {
			console.time("Shutdown");

			console.log("Shutdown requested...", {exitCode, signal});
	
			await this.stop();
			
			console.log("State Machine stopped...");
	
			await this.machine?.shutdown()
			// let pumps = this.deviceMap.getDeviceByType("pump")
	
			// await Promise.all(pumps.map(async (pump) => {
			// 	this.requestOperation({device: pump.name, operation: "Stop"})
			// }))

			if(this.options.healthCheck) await sendSMS(this.options.healthCheck?.number, `HiveCommand Stopped ${signal} ${exitCode}`, this.options.healthCheck?.username, this.options.healthCheck?.password)
	
			console.log("All VSD Pumps stopped");
	
			console.timeEnd("Shutdown")

			process.kill(process.pid, 'SIGINT')
		})
		cleanup.uninstall();
		return false;
	}

	load(payload: any){
		this.machine?.load(payload)
	}

	async stop(){
		await this.machine?.shutdown()
		this.display?.stop()
	}


	// Load the state machine and run
	async start(){
		//Find IO-Buses and Connected Devices
		this.environment = await this.machine?.discoverEnvironment() || []

		this.logs.log(`Found environment ${JSON.stringify(this.environment)}`)

		//Find self identity
		const self = await this.identity.whoami()

		if(!self.identity?.named) throw new Error("No self found, check credentials");

		await this.identity.provideContext(this.environment, this.identity.identity)

		this.logs.log(`Found self ${JSON.stringify(self)}`)

		const credentials = await this.controller.becomeSelf(self)

		this.logs.log(`Found credentials ${JSON.stringify(credentials)}`)

		//Get our command payload

		const commandPayload = await this.identity.getPurpose()
		if(commandPayload.payload){

			if(commandPayload.payload.layout){

				await this.controller.start({
					hostname: self.identity.named, 
					discoveryServer: this.options.discoveryServer || 'http://localhost:8080',
				}, commandPayload.payload.layout)
			}
			await this.machine?.load(commandPayload)
		}
		
		console.log("Starting display")
		this.display?.start()


		await this.machine?.start()

		//Start network and share context with the mothership
		// await this.network.start({
		// 	hostname: self.identity?.named,
		// 	discoveryServer: this.options.discoveryServer,
		// })

		// this.startCyclicRead()

		// await this.readEnvironment(this.environment)
	}
}
