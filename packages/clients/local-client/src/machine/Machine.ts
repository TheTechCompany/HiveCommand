/*
	Machine

	Keeps track of FSM states and executes actions.

	Keeps track of Bus and Device assignments
*/

import { CommandStateMachine, CommandStateMachineMode } from "@hive-command/state-machine";
import { ACTION_TYPES, AssignmentPayload, CommandPayloadItem, CommandProcess, CommandProcessEdge, CommandProcessNode, PayloadResponse, ProgramAction, ProgramDataInterlock, ProgramInterlock } from "@hive-command/data-types";
import { nanoid } from "nanoid";
import { BusMap } from "./BusMap";
import { DeviceMap } from "./DeviceMap";
import { PluginBank } from "./PluginBank";
import { getBlockType } from "./utils";
import { CommandEnvironment } from "..";
import log, { debug } from "loglevel";

import PID from "../plugins/PID";

export class Machine {

	private fsm : CommandStateMachine;

	private pluginBank : PluginBank;

	public deviceMap : DeviceMap;
	public busMap : BusMap;

	private env: CommandEnvironment[] = [];

	private running : boolean = false;

	constructor(opts: {
		pluginDir: string
	}){
		this.fsm = new CommandStateMachine({
			processes: [],
			variables: [],
			setpoints: []
		}, {
			requestState: async (operation) => {
				log.info("Requesting state to mock resolver", operation)
			}
		});

		this.deviceMap = new DeviceMap()
		this.busMap = new BusMap()

		this.pluginBank = new PluginBank({
			machine: this,
			pluginDir: opts.pluginDir || '/tmp/plugins'
		})

		this.requestState = this.requestState.bind(this)
		// this.requestOperation = this.requestOperation.bind(this)
	}

	getVariable(key: string){
		return this.fsm.getVariable(key)
	}

	setVariable(key: string, value: any){
		return this.fsm.setVariable(key, value)
	}

	getSetpoint(id: string){
		return this.fsm.getSetpoint(id) || 0;
	}

	setSetpoint(id: string, value: string){
		return this.fsm.setSetpoint(id, value);
	}

	loadFlow = (payload: CommandPayloadItem[], id: string) : CommandProcess => {
		let flow = payload.find((a) => a.id == id);

		let nodes : CommandProcessNode[] = ((flow)?.nodes || []).map((action) => {
			// let deviceId = action.configuration?.find((a) => a.key == 'device')?.value;
			// let operation = action.configuration?.find((a) => a.key == 'operation')?.value;

			let actions : ProgramAction[] = (action.actions || []).map((action) => ({
				id: action.id,
				device: action.device.name,
				request: action.request.key,
				release: action.release || false
			}))

			return {
				id: action.id, //action.type == "Trigger" ? "origin" : action.type == "PowerShutdown" ? 'shutdown' : action.id,
				type: action.type || ACTION_TYPES.ACTION,
				options: {
					blockType: action.type || ACTION_TYPES.ACTION,
					["sub-process"]: action?.subprocess?.id || undefined,
					timer: action?.timer, // action.configuration?.find((a) => a.key == 'timeout')?.value,
					actions: actions
				}
			}
		})


		let paths : CommandProcessEdge[] = (flow?.nodes || []).map((action) => {

			const next = flow?.edges?.filter((a) => a.from.id == action.id)

			return (next || []).map((next) => {
				return {
					id: next.id,
					source: action?.id, //action.type == "Trigger" ? 'origin' : action.id,
					target: next?.to?.id,
					options: {
						conditions: (next?.conditions || []).map((cond) => ({
							inputDevice: cond.inputDevice.name,
							inputDeviceKey: cond.inputDeviceKey.key,
							comparator: cond.comparator,
							assertion: cond.assertion
						}))
	
					}
				}
			})
			
		}).reduce((prev, curr) => {
			return prev.concat(curr)
		}, []).filter((a) => a)

		console.log(JSON.stringify({paths}))

		let subprocs : any = flow?.children?.map((proc) => {
			return {...this.loadFlow(flow?.children || [], proc.id)}
		})

		// let subprocs : any = (flow || {nodes: []}).nodes.filter((a) => a.subprocess != undefined).map((subproc) => {
		// 	if(!subproc.subprocess?.id) return;
		// 	return {...this.loadFlow(payload, subproc.subprocess?.id)}
		// })

		return {
			id: flow?.id || '',
			name: flow?.name || '',
			nodes: nodes || [],
			edges: paths || [],
			sub_processes: subprocs || []
		}
	}



	async loadPlugins(payload: AssignmentPayload[]){
		//Init all plugins for all ports
		await Promise.all(this.deviceMap.getDevicesWithPlugins().map(async (device) => {
			console.log("Setting up plugins for: ", device.name)
			this.deviceMap.setupDevicePlugins(device.id)
			
		}))
	}

	async discoverEnvironment(){
		this.env = await this.pluginBank.discoverEnvironment()
		return this.env
	}

	async load(commandPayload: PayloadResponse){

		const { program, variables, actions, setpoints, layout } = commandPayload.payload || {};

		//TODO add device mapping
		if(layout) this.deviceMap.setAssignment(layout); //this.portAssignment = layout;

		await this.loadPlugins(commandPayload.payload?.layout || []);

		//TODO add filter for top level or make children = subprocess
		//?.filter((a) => a.parent == null)
		const flows = program?.map((flow) => {
			if(!program) return {id: '', name: '', nodes: [], links: []};
			return this.loadFlow(program, flow.id)
		}).filter((a) => a != undefined)

		this.fsm = new CommandStateMachine({
			variables: variables || [],
			setpoints: setpoints || [],
			devices: layout?.map((x) => {

				let plugins = x.plugins?.map((plugin) => {
					let configuration = plugin.config.reduce((prev, curr) => {
						return {
							...prev,
							[curr.key.key]: curr.value
						}
					}, {})

					return {
						classString: PID, //plugin.classString,
						imports: [{key: 'PIDController', module: 'node-pid-controller'}],
						options: configuration,
						actions: [{key: 'Start', func: 'start'}, {key: 'Stop', func: 'stop'}],
						activeWhen: plugin.rules?.id
					}
				});

				return {
					name: x.name, 
					requiresMutex: x.requiresMutex,
					actions: x.actions,
					plugins,
					interlock: {
						state: {on: 'true'},
						// state: {on: true},
						locks: x.interlocks?.map((lock) : ProgramInterlock => ({
							inputDevice: lock.inputDevice.name,
							inputDeviceKey: lock.inputDeviceKey.key,
							comparator: lock.comparator,
							assertion: lock.assertion,
							action: lock.action.key
						})) || []
					},
					dataInterlocks: x.dataInterlocks?.map((lock) : ProgramDataInterlock => ({
						inputDevice: lock.inputDevice.name,
						inputDeviceKey: lock.inputDeviceKey.key,
						comparator: lock.comparator,
						assertion: lock.assertion,
						deviceKey: lock.deviceKey.key
					})) || []
				}
			}),
			processes: flows || []
		}, {
			requestState: this.requestState
		})

		this.fsm.on('transition', (event) => {
			log.info(`Transitioning on chain (${event.chain}) from ${event.transition.from} to ${event.transition.to}`)
		})

		//TODO - this is a hack to get a consistent loop event
		// this.fsm.on('event_loop', async () => {

		// 	await this.writeState()
		// })

		// this.machine.on('transition', ({target, process}: {target: string, process: string}) => {
		// 	this.healthClient.emit('process:transition', {process, target})
		// })

		// this.machine.on('REQUEST:OPERATION', this.requestOperation)
		
		//TODO add manual/timer/stopped/auto states
		// this.machine.start()


		// this.fsm.on('TICK', async () => {
		// 	// let activeStages = this.machine?.currentPosition;

		// 	// // console.log("ACTIVE STAGES", activeStages)

		// 	// await Promise.all(this.deviceMap.getDevicesWithPlugins().map(async (device) => {
		// 	// 	// console.log("P TICK", device.name, device.plugins, this.machine?.state.get(device.name))
		// 	// 	// console.log(device.plugins?.map((a) => a.rules))
		// 	// 	await Promise.all((device?.plugins || []).filter((a) => !a.rules || ((activeStages || [])?.indexOf(a.rules.id) > -1) ).map(async (plugin) => {

		// 	// 		let pluginObject = plugin.configuration.reduce<{
		// 	// 			targetDevice?: string;
		// 	// 			targetDeviceField?: string;
		// 	// 			actuator?: string;
		// 	// 			actuatorField?: string;
		// 	// 		}>((prev, curr) => ({...prev, [curr.key]: curr.value}), {})
		// 	// 		// console.log("Plugin tick");

		// 	// 		if(plugin.instance){
		// 	// 			const pluginTick = getPluginFunction(plugin.plugin?.tick)
		// 	// 			if(!pluginObject.targetDevice || !pluginObject.actuator) return;

		// 	// 			let targetDevice = this.deviceMap.getDeviceById(pluginObject.targetDevice)
		// 	// 			let actuatorDevice = this.deviceMap.getDeviceById(pluginObject.actuator)
		// 	// 			if(!targetDevice || !actuatorDevice) return;
						
		// 	// 			let actuatorKey = actuatorDevice.state?.find((a) => a.id == pluginObject.actuatorField || a.key == pluginObject.actuatorField)
		// 	// 			let targetKey = targetDevice.state?.find((a) => a.id == pluginObject.targetDeviceField || a.key == pluginObject.targetDeviceField)

		// 	// 			if(!actuatorKey || !targetKey){
		// 	// 				console.error("No actuator or target");
		// 	// 				return;
		// 	// 			} 

		// 	// 			let actuatorValue = this.machine?.state.getByKey(actuatorDevice.name, actuatorKey?.key)
		// 	// 			let targetValue = this.machine?.state.getByKey(targetDevice.name, targetKey?.key)

		// 	// 			let state = {
		// 	// 				actuatorValue: actuatorValue || 0,
		// 	// 				targetValue:  targetValue || 0,
		// 	// 				__host: {
		// 	// 					...this.machine?.state.get(device.name)
		// 	// 				}
		// 	// 			}

		// 	// 			// console.log("PLUGIN STATE", state, actuatorValue, targetValue)

		// 	// 			pluginTick(plugin.instance, state, async (state) => {

		// 	// 				// console.log("REQUEST STATE", state)

		// 	// 				let value = state.actuatorValue;
		// 	// 				let key = device.state?.find((a) => a.id == pluginObject.actuatorField || a.key == pluginObject.actuatorField)

		// 	// 				// console.log("KV", key, value)
		// 	// 				if(!key) return;
		// 	// 				let writeOp: any = {
		// 	// 					[key?.key]: value
		// 	// 				};

		// 	// 				// console.log("WRITE", writeOp)
		// 	// 				await this.requestState({
		// 	// 					device: device?.name,
		// 	// 					value: writeOp
		// 	// 				})

		// 	// 			})
		// 	// 		}else{
		// 	// 			console.log("PLUGIN NOT INSTANTIATED", plugin.id, plugin.plugin.name)
		// 	// 		}
		// 	// 		// console.log("PLugin tick ", plugin.name)
		// 	// 	}))
		// 	// }))

		// 	// await this.writeState()
		// })

	}

	get status(){
		return this.fsm.status;
	}

	get state(){
		return this.fsm.state
	}


	get mode(){
		return this.fsm.mode
	}


	get isProgramRunning(){
		return this.fsm.isRunning
	}

	get isProgramStopping(){
		return this.fsm.isStopping;
	}

	async startProgram(){
		await this.fsm.start()
	}

	async stopProgram(){
		const stopped = await this.fsm.stop()
		if(stopped){
			await this.fsm.reload()
		}
	}

	async start(){
		this.running = true;
		await this.pluginBank.subscribeToBusSystem(this.env)
		this.runLoop()
	}

	async runLoop(){
		while(this.running){
			await this.writeState()
			await new Promise((resolve) => setTimeout(() => resolve(true), 500));
		}
	}

	stop(){
		this.running = false;
	}

	// async start(){
	// 	log.info("Starting state machine")
	// 	// await this.fsm.start();
	// }

	// async shutdown(){
	// 	log.info("Stopping state machine")
	// 	// await this.fsm.stop();
	// }

	async standby(){
		log.info("Pausing state machine")
		await this.fsm.pause()
	}

	isRunning(flowId: string){
		return this.fsm.isActive(flowId);
	}

	async runOneshot(processId: string){
		return await this.fsm.runFlow(processId)
		// return new Error("Not implemented");
	}

	async stopOneshot(processId: string){
		return await this.fsm.stopFlow(processId)
	}


	getByKey(dev: string, key: string){
		return this.fsm?.state?.getByKey(dev, key)
	}

	
	getDeviceMode(device: string){
		return this.fsm?.getDeviceControl(device);
	}

	setDeviceMode(device: string, mode: boolean){
		return this.fsm?.changeDeviceControl(device, mode)
		// return this.deviceMap.setDeviceModeByName(device, mode)
	}


	async requestState(event: {device: string, state: any | {[key: string]: any}}){
		// log.debug("request state - (LC Machine)", event)

		// let busPort = this.deviceMap.getDeviceBusPort(event.device. event.s)

	
		// if(!busPort?.bus) return;
		
		let writeOp: any;
		if(typeof(event.state) == 'object'){

			// console.log("Requesting", {event})

			writeOp = {};
			for(var k in event.state){
				let stateItem = this.deviceMap.getDeviceBusPort(event.device, k)
				let busDevice = this.env.find((a) => a.id == stateItem?.bus)

				if(!busDevice) {
					console.log("No bus device found");
					continue;
				}

				// console.log("State", {stateItem, busDevice, k})
				// let stateItem = busPort?.state?.find((a) => a.key == k)

				if(!stateItem) continue;

				let value = event.state[k];

				if(stateItem.max && stateItem.min){
					let min = parseFloat(`${stateItem.min}`)
					let max = parseFloat(`${stateItem.max}`)
					value = (((max - min) / 100) * value) + min

					if(value > max) value = max
					if(value < min) value = min
				}
				writeOp[stateItem?.foreignKey] = value //event.value[k];

				this.busMap.request(stateItem.bus, stateItem.port, writeOp)

			}
		}else{
			let stateItem = this.deviceMap.getDeviceBusPort(event.device)

			writeOp = event.state;

			this.busMap.request(stateItem.bus, stateItem.port, writeOp)

		}

		// let busPort = this.deviceMap.getDeviceByBusPort(event.bus, event.port) 
		// this.busMap.request(busPort.bus, busPort.port, writeOp)
	}

	async requestOperation(ev : {device: string, operation: string}){
		console.log("request operation - (LC Machine)", ev)
		await this.fsm.performOperation(ev.device, undefined, ev.operation)
	}

	async writeState(){
		const changes = this.busMap.getChanged()

		if(Object.keys(changes).length < 1) return;
		// log.debug("write state - (LC Machine)", JSON.stringify(changes))

		await Promise.all(Object.keys(changes).map(async (bus) => {
			let busDevice = this.env.find((a) => a.id == bus)

			// console.log(busDevice, this.env, changes[bus])

			// console.log("Change bus", bus)
			await Promise.all(changes[bus].map(async (port) => {

				// console.log("Change port", port)
				if(!busDevice) return;

				let plugin = this.pluginBank.getByTag(busDevice?.type)

				let writeOp = port.value;
				if(typeof(port.value) == 'object'){

					let prevState = this.busMap.get(bus, port.port)
					
					writeOp = {...prevState};
					for(var k in port.value){
						writeOp[k] = port.value[k];
					}
				}
				
				debug("WRITE PLUGIN", bus, port.port, {writeOp})
				// log.debug(`Writing state to ${bus} ${port.port}`, {writeOp})
				await plugin?.write(bus, port.port, writeOp);

				this.busMap.set(bus, port.port, writeOp)
			}))
		}))
		
	}

	setState(device: string, state: any){
		// const busPort = this.deviceMap.getDeviceBusPort(device)
		log.debug(`Set State: (${device})`, {state})
		this.fsm?.state?.update(device, {
			...state
		})
	}

	// async useAction(device: string, operation: any){
	// 	const busPort = this.deviceMap.getDeviceBusPort(device)

	// 	// if(busPort?.bus && busPort?.port){
	// 		/*
	// 			Test the operation value for object type
	// 			if object remap keys to busmap keys
	// 			if value write directly
	// 		*/
			
		

	// 		await this.requestState({
	// 			device: device,
	// 			state: operation
	// 		})
		
	// }

	//Request state + translator for name
	// async requestOperation(event: {device: string, operation: string}){
	// 	log.debug(`Requesting operation ${event.operation} on ${event.device}`)
	// 	// console.log(`Requesting operation with device name ${event.device} ${event.operation}- StateMachine`)
	
	// 	let busPort = this.deviceMap.getDeviceBusPort(event.device)
		
	// 	if(!busPort?.bus || !busPort.port) return new Error("No bus-port found");

	// 	let action = busPort.actions?.find((a) => a.key == event.operation)

	// 	if(!action?.func) return;

	// 	let driverFunction = getDeviceFunction(action?.func)
		
	// 	let id = nanoid();
	// 	console.time(`${id}-${action.key}`)
		
	// 	await driverFunction(
	// 		{},
	// 		(state: any) => this.setState(event.device, state),
	// 		(operation: any) => {
	// 			// console.log(operation);
	// 			this.useAction(event.device, operation)	
	// 		}
	// 	)

	// 	console.timeEnd(`${id}-${action.key}`)
	// }



	changeMode(mode: CommandStateMachineMode){
		this.fsm.changeMode(mode);
	}
}