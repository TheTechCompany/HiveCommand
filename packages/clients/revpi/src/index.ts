import { CommandIdentity } from '@hive-command/identity'
import { CommandStateMachine, ProcessNode } from '@hive-command/state-machine'
import { CommandLogging } from '@hive-command/logging'
import { AssignmentPayload, CommandNetwork, PayloadResponse } from '@hive-command/network'
import IOLinkPlugin from './plugins/IO-Link';
import RevPiPlugin from './plugins/RevPi';
import { BasePlugin } from './plugins/Base';
import IODDManager, { IODD } from '@io-link/iodd'
import { ValueBank } from './io-bus/ValueBank';

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
	privateKey?: string
	discoveryServer?: string
}

export class CommandClient { 

	private environment : CommandEnvironment[] = [];

	private plugins : BasePlugin[];

	private machine? : CommandStateMachine;

	private logs : CommandLogging;

	private network : CommandNetwork;

	private identity : CommandIdentity;

	private ioddManager : IODDManager;

	private valueBank : ValueBank;

	private options : CommandClientOptions;

	private cycleTimer?: any;

	private portAssignment: AssignmentPayload[] = []

	constructor(opts: CommandClientOptions){
		this.options = opts;

		this.valueBank = new ValueBank();

		this.valueBank.on('REQUEST_STATE', this.requestState.bind(this))

		this.ioddManager = new IODDManager({
			storagePath: opts.storagePath || '/tmp'
		})

		this.plugins = [
			new IOLinkPlugin(opts.networkInterface || 'eth0', this.ioddManager),
			new RevPiPlugin()
		]

		this.logs = new CommandLogging();

		this.logs.log(`Starting Command Client...`);

		this.identity = new CommandIdentity();
		
		if(!this.identity) throw new Error("Unable to find credentials");

		this.logs.log(`Found credentials for control surface...`);

		this.logs.log(`Starting network...`);

		this.network = new CommandNetwork({
			baseURL: opts.commandCenter, 
			valueBank: this.valueBank
		});

		this.requestOperation = this.requestOperation.bind(this);
		// this.machine = new CommandStateMachine({
			
		// });

		// this.readEnvironment = this.readEnvironment.bind(this);
	}

	async requestState(event: {bus: string | null, port: string, value: any}){
		let busDevice = this.environment.find((a) => a.id == event.bus)
		let plugin = this.plugins.find((a) => a.TAG == busDevice?.type)
		console.log("REQUESTING STATE FROM ", event.bus, event.port, event.value)
		
		if(!event.bus) return;

		//An object value is a partial state to merge before sending else its a value
		if(typeof(event.value) == "object"){
			let prevState = this.valueBank.get(event.bus, event.port)
			event.value = {
				...prevState,
				...event.value
			}
		}
		
		await plugin?.write(event.bus, event.port, event.value);
	}

	//Request state + translator for name
	async requestOperation(event: {device: string, operation: string}){
		console.log("Requesting operation with device name - StateMachine")
		let busPort = this.portAssignment.find((a) => a.id == event.device)
		if(!busPort?.bus || !busPort.port) return new Error("No bus-port found");

		this.requestState({
			bus: busPort?.bus,
			port: busPort?.port,
			value: event.operation
		})
	}

	async discoverEnvironment(){
		//Run discovery for all loaded plugins
		let environment = await Promise.all(this.plugins.map(async (plugin) => {
			const discovered = await plugin.discover()

			console.log("Discovered Plugin Environment", discovered);
			return {
				plugin: plugin.TAG,
				discovered
			}
		}))
		return environment.reduce<{type: string, id: string, name: string}[]>((prev, curr) => {
			return prev.concat(curr.discovered.map((x: any) => ({...x, type: curr.plugin})))
		}, [])
	}

	// async readEnvironment(env: {type: string, id: string, name: string}[]){
	// 	const envValue = await Promise.all(env.map(async (bus) => {
	// 		let plugin = this.plugins.find((a) => a.TAG == bus.type)

	// 		const value = await plugin?.read(bus.id)
	// 		if(!value) return
	// 		this.valueBank.setMany(bus.id, value); //[bus.id] = value || [];
	// 		return value;
	// 	}))
	// 	console.log("ENV VALUE", envValue)
	// 	return envValue
	// }	

	// startCyclicRead(cycle_time: number = 10 * 1000){
	// 	this.cycleTimer = setInterval(() => this.readEnvironment(this.environment), cycle_time)
	// }

	// stopCyclicRead(){
	// 	clearInterval(this.cycleTimer)
	// }

	async discoverSelf(){
		//Discover the identity of the self
		return await this.network.whoami()
	}

	async subscribeToBusSystem(env: {type: string, id: string, name: string}[]){
		await Promise.all(env.map(async (bus) => {
			let plugin = this.plugins.find((a) => a.TAG == bus.type)

			await plugin?.subscribe(bus.id)

			//TODO DEDUPE this
			plugin?.on('PORT:VALUE', (event) => {
				console.log(event)
				this.valueBank.set(event.bus, event.port, event.value)
			})
		}))
	}

	getBlockType(type: string){
		console.log("Get TYpe", type)
		switch(type){
			case 'Trigger':
			case 'Action':
				return 'action';
			case 'Clock':
				return 'timer';
			case 'Cycle':
				return 'action'; //TODO pid
		}
	}

	async loadMachine(commandPayload: PayloadResponse){
		let payload = commandPayload.payload?.command;
		let layout = commandPayload.payload?.layout;

		if(layout) this.portAssignment = layout;


		let nodes = (payload || []).map((action) : ProcessNode => {
			let deviceId = action.configuration?.find((a) => a.key == 'device')?.value;
			let operation = action.configuration?.find((a) => a.key == 'operation')?.value;

			let actions = action.actions?.map((action) => ({
				device: action.target,
				operation: action.key
			}))

			// if(deviceId && operation){
			// 	actions.push({device: deviceId, operation})
			// }
			
			return {
				id: action.type == "Trigger" ? "origin" : action.id,
				extras: {
					blockType: this.getBlockType(action.type) || 'action',
					timer: action.configuration?.find((a) => a.key == 'timeout')?.value,
					actions: actions
				}
			}
		}).reduce((prev, curr) => {
			return {
				...prev,
				[curr.id]: curr
			}
		}, {})

		console.log(nodes)

		let paths = payload?.map((action) => {
			return action.next?.map((next) => {
				return {
					id: next.id,
					source: action.type == "Trigger" ? 'origin' : action.id,
					target: next.target
				}
			})
			
		}).reduce((prev, curr) => {
			return prev.concat(curr)
		}, []).filter((a) => a).reduce((prev, curr) => {
			return {
				...prev,
				[curr.id]: curr
			}
		}, {})

		console.log(`Received command payload, starting state machine`)
		this.machine = new CommandStateMachine({
			processes: [{
				id: 'default',
				name: 'Default',
				nodes: nodes,
				links: paths,
				sub_processes: []
			}]
		})

		this.machine.on('REQUEST:OPERATION', this.requestOperation)
		
		// this.machine.start()

		console.log(`State machine started`)
	}

	async start(){
		//Find IO-Buses and Connected Devices
		this.environment = await this.discoverEnvironment()

		this.logs.log(`Found environment ${JSON.stringify(this.environment)}`)

		//Find self identity
		const self = await this.discoverSelf()

		if(!self.identity?.named) throw new Error("No self found, check credentials");

		await this.network.provideContext(this.environment, this.identity.identity)

		this.logs.log(`Found self ${JSON.stringify(self)}`)
		const credentials = await this.network.becomeSelf(self)

		this.logs.log(`Found credentials ${JSON.stringify(credentials)}`)

		//Get our command payload

		const commandPayload = await this.network.getPurpose()
		if(commandPayload.payload){

			if(commandPayload.payload.layout){
				await this.network.start({
					hostname: self.identity.named,
					discoveryServer: this.options.discoveryServer
				}, commandPayload.payload.layout)
			}
			await this.loadMachine(commandPayload)
		}


		//Start network and share context with the mothership
		// await this.network.start({
		// 	hostname: self.identity?.named,
		// 	discoveryServer: this.options.discoveryServer,
		// })

		await this.subscribeToBusSystem(this.environment);

		// this.startCyclicRead()

		// await this.readEnvironment(this.environment)
	}
}
