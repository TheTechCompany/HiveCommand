import process from 'process'
import { CommandIdentity } from '@hive-command/identity'
import { CommandStateMachine, CommandStateMachineMode, ProcessNode } from '@hive-command/state-machine'
import { CommandLogging } from '@hive-command/logging'
import { AssignmentPayload, CommandNetwork, CommandPayloadItem, PayloadResponse } from '@hive-command/network'
import IOLinkPlugin from './plugins/IO-Link';
import RevPiPlugin from './plugins/RevPi';
import { BasePlugin } from './plugins/Base';
import IODDManager, { IODD } from '@io-link/iodd'
import { BusMap } from './io-bus/BusMap';
import { getDeviceFunction, getPluginFunction } from './device-types/AsyncType';
import { nanoid } from 'nanoid';
import { DeviceMap } from './io-bus/DeviceMap';
import { DataType, StatusCodes, Variant } from 'node-opcua';
import { sendSMS } from '@hive-command/sms'
import cleanup from 'node-cleanup'
import client, {Socket} from 'socket.io-client'

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
}

export class CommandClient { 

	private environment : CommandEnvironment[] = [];

	private plugins : BasePlugin[];

	private machine? : CommandStateMachine;

	private logs : CommandLogging;

	private network : CommandNetwork;

	private identity : CommandIdentity;

	private ioddManager : IODDManager;


	private options : CommandClientOptions;

	private cycleTimer?: any;

	private busMap : BusMap;
	private deviceMap : DeviceMap;

	private healthClient: Socket;
	// private portAssignment: AssignmentPayload[] = []

	constructor(opts: CommandClientOptions){
		this.options = opts;

		this.deviceMap = new DeviceMap();
		this.busMap = new BusMap();

		// this.valueBank.on('REQUEST_STATE', this.requestState.bind(this))

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
			valueBank: {
				get: this.getByKey.bind(this),
				getDeviceMode: this.getDeviceMode.bind(this),
				setDeviceMode: this.setDeviceMode.bind(this), 
				requestState: async (device, key, value) => await this.requestState({device: device, value: {[key]: value}}),
				requestAction: async (device, action) => await this.requestOperation({device, operation: action})
			},
			controller: {
				CommandPoint: {
					type: DataType.String,
					get: () => {
						return new Variant({dataType: DataType.String, value: 'Enter Command'})
					},
					set: (value) => {
						let parts = value.value.toString().split('|')
						// if(!parts) return;
						const [ device, action ] = parts;
						
						this.requestOperation({device, operation: action})

						return StatusCodes.Good;
					}
				},
				Mode: {
					type: DataType.String,
					get: () => {
						return new Variant({dataType: DataType.String, value: CommandStateMachineMode[this.machine?.mode || CommandStateMachineMode.DISABLED]})
					},
					set: (value) => {
						this.machine?.changeMode((CommandStateMachineMode as any)[value.value.toString().toUpperCase()])
						return StatusCodes.Good;

					}
				}
			}
		});

		this.writeState = this.writeState.bind(this)
		this.requestOperation = this.requestOperation.bind(this);
		// this.machine = new CommandStateMachine({
			
		// });

		// this.readEnvironment = this.readEnvironment.bind(this);
		this.healthClient = client(this.options.healthCenter || 'ws://localhost:3000');

		this.setupHeartbeat();

		cleanup(this.shutdown.bind(this))

		process.on('uncaughtException', function (err) {
			console.error(err.stack);
			console.log("Node NOT Exiting...");
		});
	}

	async setupHeartbeat(){
		await this.hearbeat();
		await this.liveHeartbeat();
	}

	async liveHeartbeat(){
		this.healthClient.emit('identity:heartbeat')
		setTimeout(() => this.liveHeartbeat(), 5 * 1000)
	}

	async hearbeat(){
		if(!this.options.healthCheck) return;
		
		await sendSMS(this.options.healthCheck?.number,  this.options.healthCheck?.message || 'Hive Command Client is running...', this.options.healthCheck?.username, this.options.healthCheck?.password)

		setTimeout(() => this.hearbeat(), this.options.healthCheck.interval || 60 * 60 * 1000)
	}

	getDeviceMode(device: string){
		return this.deviceMap.getDeviceModeByName(device)
	}

	setDeviceMode(device: string, mode: string){
		return this.deviceMap.setDeviceModeByName(device, mode)
	}

	getByKey(dev: string, key: string){
		return this.machine?.state.getByKey(dev, key)
	}

	async requestState(event: {device: string, value: any}){
		let busPort = this.deviceMap.getDeviceBusPort(event.device)

		let busDevice = this.environment.find((a) => a.id == busPort?.bus)
		let plugin = this.plugins.find((a) => a.TAG == busDevice?.type)
		console.log("REQUESTING STATE FROM ", busPort?.bus, busPort?.port, event.value)
		
		if(!busPort?.bus) return;
		
		let prevState = this.busMap.get(busPort.bus, busPort.port)

		let writeOp: any;
		if(typeof(event.value) == 'object'){

			writeOp = {};
			for(var k in event.value){
				// console.log(k, busPort.state)
				let stateItem = busPort?.state?.find((a) => a.key == k)
				console.log({stateItem})
				if(!stateItem) continue;
				let value = event.value[k];
				if(stateItem.max && stateItem.min){
					console.log("Min max", stateItem.min, stateItem.max, value)
					value = (((stateItem.max - stateItem.min) / 100) * value) + stateItem.min
					console.log("Min max", stateItem.min, stateItem.max, value)

					if(value > stateItem.max) value = stateItem.max
					if(value < stateItem.min) value = stateItem.min
				}
				writeOp[stateItem?.foreignKey] = value //event.value[k];
			}
		}else{
			writeOp = event.value;
		}

		// let busPort = this.deviceMap.getDeviceByBusPort(event.bus, event.port) 
		this.busMap.request(busPort.bus, busPort.port, writeOp)
	}

	async writeState(){
		const changes = this.busMap.getChanged()

		// if(Object.keys(changes).length > 0)console.log("Changes", changes)
		if(Object.keys(changes).length < 1) return;

		await Promise.all(Object.keys(changes).map(async (bus) => {
			let busDevice = this.environment.find((a) => a.id == bus)

			// console.log("Change bus", bus)
			await Promise.all(changes[bus].map(async (port) => {

				// console.log("Change port", port)

				let plugin = this.plugins.find((a) => a.TAG == busDevice?.type)

				let writeOp = port.value;
				if(typeof(port.value) == 'object'){

					let prevState = this.busMap.get(bus, port.port)
					
					writeOp = {...prevState};
					for(var k in port.value){
						writeOp[k] = port.value[k];
					}
				}
				// 	console.log("PREV STATE", prevState)
				// 	// let prevState = this.valueBank.get(event.bus, event.port)
		
				// 	// event.value = {
				// 	// 	...prevState,
				// 	// 	...event.value
				// 	// }
		
				// 	writeOp = {...prevState};
				// 	for(var k in event.value){
				// 		let stateItem = busPort?.state?.find((a) => a.key == k)
				// 		if(!stateItem) continue;
				// 		writeOp[stateItem?.foreignKey] = event.value[k];
				// 	}
		
				// }else{
				// 	writeOp = event.value;
				// }
		
				// //An object value is a partial state to merge before sending else its a value
				// if(typeof(event.value) == "object"){
				
				// }
		
				// console.log("WRITE", port, writeOp)
				
				await plugin?.write(bus, port.port, writeOp);
			}))
		}))
		
	}

	setState(device: string, state: any){
		// const busPort = this.deviceMap.getDeviceBusPort(device)

		console.log("UPDATE DEV STATE", device, state)
		this.machine?.state.update(device, {
			...state
		})
	}

	async useAction(device: string, operation: any){
		const busPort = this.deviceMap.getDeviceBusPort(device)

		// if(busPort?.bus && busPort?.port){
			/*
				Test the operation value for object type
				if object remap keys to busmap keys
				if value write directly
			*/
			
		

			await this.requestState({
				device: device,
				value: operation
			})
			console.log("OP", operation)

		
	}

	//Request state + translator for name
	async requestOperation(event: {device: string, operation: string}){
		console.log(`Requesting operation with device name ${event.device} ${event.operation}- StateMachine`)
		let busPort = this.deviceMap.getDeviceBusPort(event.device)
		
		if(!busPort?.bus || !busPort.port) return new Error("No bus-port found");

		let action = busPort.actions?.find((a) => a.key == event.operation)
		console.log("Found action", action)
		if(!action?.func) return;

		let driverFunction = getDeviceFunction(action?.func)
		
		let id = nanoid();
		console.time(`${id}-${action.key}`)
		
		await driverFunction(
			{},
			(state: any) => this.setState(event.device, state),
			(operation: any) => {
				// console.log(operation);
				this.useAction(event.device, operation)	
			}
		)

		console.timeEnd(`${id}-${action.key}`)

		// console.log("Finished driver func", action.key)

		// this.requestState({
		// 	bus: busPort?.bus,
		// 	port: busPort?.port,
		// 	value: event.operation
		// })
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
				//TODO device(s) instead of device
				//TODO add to bus port value bank

				let devices = this.deviceMap.getDevicesByBusPort(event.bus, event.port)
				// console.log(device?.name, event.bus, event.port);
				if(!devices) return;


				devices.map((device) => {
					let cleanState = event.value;

					if(typeof(event.value) == "object"){

						cleanState = device.state?.filter((a) => event.value[a.foreignKey] != undefined ).reduce((prev, curr) => {
							let value = event.value[curr.foreignKey]

							if(curr.min && curr.max){
								if(value < curr.min) value = curr.min
								if(value > curr.max) value = curr.max

								value = ((value - curr.min) / (curr.max - curr.min)) * 100
							}

							return {
								...prev,
								[curr.key]: value //event.value[curr.foreignKey]
							}
						}, {})
	
					}
	
					this.machine?.state.update(device?.name, cleanState)
				})
				
				this.busMap.set(event.bus, event.port, event.value);
				
				// this.valueBank.set(event.bus, event.port, event.value)
			})
		}))
	}

	getBlockType(type: string){
		console.log("Get TYpe", type)
		switch(type){
			case 'Connect':
				return 'sub-process';
			case 'Trigger':
			case 'Action':
				return 'action';
			case 'Clock':
				return 'timer';
			case 'Cycle':
				return 'action'; //TODO pid
		}
	}

	loadFlow = (payload: CommandPayloadItem[], id: string) => {
		let flow = payload.find((a) => a.id == id);

		let nodes = (flow)?.nodes.map((action) : ProcessNode => {
			let deviceId = action.configuration?.find((a) => a.key == 'device')?.value;
			let operation = action.configuration?.find((a) => a.key == 'operation')?.value;

			let actions = action.actions?.map((action) => ({
				device: action.target,
				operation: action.key,
				release: action.release
			}))

			// if(deviceId && operation){
			// 	actions.push({device: deviceId, operation})
			// }
	
			return {
				id: action.type == "Trigger" ? "origin" : action.id,
				extras: {
					blockType: this.getBlockType(action.type) || 'action',
					["sub-process"]: action?.subprocess?.id || undefined,
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


		let paths = flow?.nodes.map((action) => {
			console.log(action.next)
			return action.next?.map((next) => {
				return {
					id: nanoid(),
					source: action.type == "Trigger" ? 'origin' : action.id,
					target: next.target,
					extras: {
						conditions: next.conditions?.map((cond) => ({
							input: cond.input,
							inputKey: cond.inputKey,
							comparator: cond.comparator,
							value: cond.assertion
						}))
	
					}
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

		let subprocs : any = (flow || {nodes: []}).nodes.filter((a) => a.subprocess != undefined).map((subproc) => {
			if(!subproc.subprocess?.id) return;
			return {...this.loadFlow(payload, subproc.subprocess?.id)}
		})

		return {
			id: flow?.id || '',
			name: flow?.name || '',
			nodes: nodes || {},
			links: paths || {},
			sub_processes: subprocs || []
		}
	}

	async loadMachine(commandPayload: PayloadResponse){
		let payload = commandPayload.payload?.command;
		let layout = commandPayload.payload?.layout;

		if(layout) this.deviceMap.setAssignment(layout); //this.portAssignment = layout;

		await this.loadPlugins(commandPayload.payload?.layout || []);

		const flows = payload?.filter((a) => a.parent == null).map((flow) => {
			if(!payload) return {id: '', name: '', nodes: {}, links: {}};
			return this.loadFlow(payload, flow.id)

		}).filter((a) => a != undefined)

		
		console.log("FLOWS", flows)
		console.log(`Received command payload, starting state machine`)
		this.machine = new CommandStateMachine({
			devices: layout?.map((x) => ({
				name: x.name, 
				requiresMutex: x.requiresMutex,
				interlock: {
					state: {on: 'true'},
					// state: {on: true},
					locks: (x.interlocks || []).map((lock) => ({
						device: lock.input.name,
						deviceKey: lock.inputKey.key,
						comparator: lock.comparator,
						value: (lock.assertion.type == "value" ? lock.assertion.value : (lock.assertion.setpoint?.type == 'ratio' ? lock.assertion.setpoint.value : lock.assertion.setpoint?.value)),

						fallback: lock.action.key
					}))
				}
			})),
			processes: flows || []
		}, {
			performOperation: this.requestOperation
		})

		// this.machine.on('REQUEST:OPERATION', this.requestOperation)
		
		//TODO add manual/timer/stopped/auto states
		this.machine.start()


		this.machine.on('TICK', async () => {
			let activeStages = this.machine?.currentPosition;

			// console.log("ACTIVE STAGES", activeStages)

			await Promise.all(this.deviceMap.getDevicesWithPlugins().map(async (device) => {
				// console.log("P TICK", device.name, device.plugins, this.machine?.state.get(device.name))
				// console.log(device.plugins?.map((a) => a.rules))
				await Promise.all((device?.plugins || []).filter((a) => !a.rules || ((activeStages || [])?.indexOf(a.rules.id) > -1) ).map(async (plugin) => {

					let pluginObject = plugin.configuration.reduce<{
						targetDevice?: string;
						targetDeviceField?: string;
						actuator?: string;
						actuatorField?: string;
					}>((prev, curr) => ({...prev, [curr.key]: curr.value}), {})
					// console.log("Plugin tick");

					if(plugin.instance){
						const pluginTick = getPluginFunction(plugin.plugin?.tick)
						if(!pluginObject.targetDevice || !pluginObject.actuator) return;

						let targetDevice = this.deviceMap.getDeviceById(pluginObject.targetDevice)
						let actuatorDevice = this.deviceMap.getDeviceById(pluginObject.actuator)
						if(!targetDevice || !actuatorDevice) return;
						
						let actuatorKey = actuatorDevice.state?.find((a) => a.id == pluginObject.actuatorField || a.key == pluginObject.actuatorField)
						let targetKey = targetDevice.state?.find((a) => a.id == pluginObject.targetDeviceField || a.key == pluginObject.targetDeviceField)

						if(!actuatorKey || !targetKey){
							console.error("No actuator or target");
							return;
						} 

						let actuatorValue = this.machine?.state.getByKey(actuatorDevice.name, actuatorKey?.key)
						let targetValue = this.machine?.state.getByKey(targetDevice.name, targetKey?.key)

						let state = {
							actuatorValue: actuatorValue || 0,
							targetValue:  targetValue || 0,
							__host: {
								...this.machine?.state.get(device.name)
							}
						}

						// console.log("PLUGIN STATE", state, actuatorValue, targetValue)

						pluginTick(plugin.instance, state, async (state) => {

							// console.log("REQUEST STATE", state)

							let value = state.actuatorValue;
							let key = device.state?.find((a) => a.id == pluginObject.actuatorField || a.key == pluginObject.actuatorField)

							// console.log("KV", key, value)
							if(!key) return;
							let writeOp: any = {
								[key?.key]: value
							};

							// console.log("WRITE", writeOp)
							await this.requestState({
								device: device?.name,
								value: writeOp
							})

						})
					}else{
						console.log("PLUGIN NOT INSTANTIATED", plugin.id, plugin.plugin.name)
					}
					// console.log("PLugin tick ", plugin.name)
				}))
			}))

			await this.writeState()
		})

		console.log(`State machine started`)
	}

	async loadPlugins(payload: AssignmentPayload[]){
		//Init all plugins for all ports
		await Promise.all(this.deviceMap.getDevicesWithPlugins().map(async (device) => {

			this.deviceMap.setupDevicePlugins(device.id)
			
		}))
	}

	shutdown(exitCode: number | null, signal: string | null) : boolean | void | undefined {
		new Promise(async (resolve) => {
			console.time("Shutdown");

			console.log("Shutdown requested...", {exitCode, signal});
	
			await this.stop();
			
			console.log("State Machine stopped...");
	
			let pumps = this.deviceMap.getDeviceByType("pump")
	
			await Promise.all(pumps.map(async (pump) => {
				this.requestOperation({device: pump.name, operation: "Stop"})
			}))

			if(this.options.healthCheck) await sendSMS(this.options.healthCheck?.number, `HiveCommand Stopped ${signal} ${exitCode}`, this.options.healthCheck?.username, this.options.healthCheck?.password)
	
			console.log("All VSD Pumps stopped");
	
			console.timeEnd("Shutdown")

			process.kill(process.pid, 'SIGINT')
		})
		cleanup.uninstall();
		return false;
	}

	async stop(){
		await this.machine?.stop()

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
