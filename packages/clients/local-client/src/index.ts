import process from 'process'

import log, { LogLevelDesc} from 'loglevel'

import { CommandIdentity } from '@hive-command/identity'
import { CommandLogging } from '@hive-command/logging'

import IODDManager, { IODD } from '@io-link/iodd'
import { sendSMS } from '@hive-command/sms'
import cleanup from 'node-cleanup'
import { Controller } from './controller'
import { Machine } from './machine'
import path from 'path/posix';

import { AlarmEngine } from './alarm-engine'
import { readFileSync } from 'fs'

const pkg = require('../package.json')

export interface CommandEnvironment {
	id: string;
	type: string;
	name: string;
	devices?: {ix: number, product: string, inputs?: any[], outputs?: any[], iodd: any}[];
}

export interface CommandClientOptions {
	networkInterface?: string;
	storagePath?: string

	hostname: string;

	purposeFile?: string;

	// commandCenter? : string //Web server to connect to
	discoveryServer?: string

	// healthCenter?: string; //Health montior endpoint potentially same as commandCenter

	privateKey?: string

	healthCheck: {
		number: string,
		message: string,
		username: string,
		password: string
	}

	ignorePlugins?: string[];

	pluginDir? : string;

	blessed?: boolean;

	logLevel?: LogLevelDesc
}

export class CommandClient { 

	private environment : CommandEnvironment[] = [];

	private machine? : Machine;

	private logs : CommandLogging;

	private controller : Controller;

	private identity : CommandIdentity;

	private options : CommandClientOptions;

	private alarmEngine : AlarmEngine;


	constructor(opts: CommandClientOptions){
		this.options = opts;

		this.logs = new CommandLogging();

		log.setLevel(opts.logLevel || 'info')

		log.info(`Starting HiveCommand Client: v${pkg.version}`)
		// this.logs.log(`Starting Command Client...`);

		this.identity = new CommandIdentity({
			identityServer: `http://${opts.discoveryServer}:8080` || 'http://localhost:8080',
		});
		
		if(!this.identity) throw new Error("Unable to find credentials");

		this.machine = new Machine({
			pluginDir: opts.pluginDir || path.join(__dirname, `../../../plugins`)
		})

		// if(this.options.healthCheck){
			console.log("Setting up Alarm Engine")
			this.alarmEngine = new AlarmEngine({
				number: this.options.healthCheck?.number,
				username: this.options.healthCheck?.username,
				password: this.options.healthCheck?.password,
				messagePrefix: this.options.healthCheck.message
			})
		// }


		this.controller = new Controller({
			commandCenter: `http://${opts.discoveryServer}:8080` || '',
			valueBank: {
				get: (dev, key) => this.machine?.getByKey(dev, key),
				getDeviceMode: this.machine.getDeviceMode.bind(this),
				setDeviceMode: this.machine.setDeviceMode.bind(this), 
				requestState: async (device, key, value) => await this.machine?.requestState({device: device, state: {[key]: value}}),
				requestAction: async (device, action) => await this.machine?.requestOperation({device, operation: action}),

				getVariable: (key) => this.machine?.getVariable(key),
				setVariabe: (key, value) => this.machine?.setVariable(key, value),

				getSetpoint: (id) => this.machine?.getSetpoint(id),
				setSetpoint: (id, value) => this.machine?.setSetpoint(id, value),

				runOneshot: async (flow) => await this.machine?.runOneshot(flow),
				stopOneshot: async (flow) => await this.machine?.stopOneshot(flow),
				isRunning: (flow) => this.machine?.isRunning(flow) != undefined,
			},
			alarmEngine: this.alarmEngine,
			machine: this.machine,
		})
		


		cleanup(this.shutdown.bind(this))

		process.on('uncaughtException', function (err) {
			console.error(err.stack);
			console.log("Node NOT Exiting...");
		});
	}

	async kill(){
		await this.machine?.stopProgram()
		await this.machine?.stop()
		await this.controller.stop();
		
	}


	shutdown(exitCode: number | null, signal: string | null) : boolean | void | undefined {
		new Promise(async (resolve) => {
			console.time("Shutdown");

			console.log("Shutdown requested...", {exitCode, signal});
	
			await this.stop();
			
			console.log("State Machine stopped...");
	
			await this.machine?.stopProgram()
			await this.machine?.stop()
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

	async setup(){
		console.log("Discovering environment")
		this.environment = await this.machine?.discoverEnvironment() || []

		// this.logs.log(`Found environment ${JSON.stringify(this.environment)}`)

		//Find self identity
		// const self = await this.identity.whoami()
		// console.log("Identity", {self})

		// if(!self.identity?.named) throw new Error("No self found, check credentials");

		console.log("Sending context");
		// await this.identity.provideContext(this.environment, this.identity.identity)

		// this.logs.log(`Found self ${JSON.stringify(self)}`)

		// const credentials = await this.controller.becomeSelf(self)
		// console.log({credentials})

		// this.logs.log(`Found credentials ${JSON.stringify(credentials)}`)

		//Get our command payload

		if(!this.options.purposeFile) throw new Error('No purpose file given');

		const payload = readFileSync(this.options.purposeFile, 'utf8')
		const commandPayload = JSON.parse(payload) //await this.identity.getPurpose()

		console.log("Purpose", JSON.stringify({commandPayload}))
		if(commandPayload.payload){

			const { layout, actions, setpoints, variables } = commandPayload.payload;

			// if(layout){

				// console.log({setpoints, variables})

				await this.controller.start({
					hostname: this.options.hostname,
					discoveryServer: `opc.tcp://${this.options.discoveryServer}:4840` || 'http://localhost:8080',
				}, {
					layout: layout || [], 
					actions: actions || [],
					setpoints: setpoints || [],
					variables: variables || []
				})
			// }
			await this.machine?.load(commandPayload)
		}
	}

	async stop(){
		await this.machine?.stop()
	}


	// Load the state machine and run
	async start(){
		//Find IO-Buses and Connected Devices
		
		
		// this.display?.start()

		// this.display?.render()

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
