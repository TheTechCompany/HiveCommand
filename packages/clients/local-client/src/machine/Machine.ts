/*
	Machine

	Keeps track of FSM states and executes actions.

	Keeps track of Bus and Device assignments
*/

import { CommandStateMachine, CommandStateMachineMode } from "@hive-command/state-machine";
import { AssignmentPayload, CommandPayloadItem, PayloadResponse } from "@hive-command/network";
import { nanoid } from "nanoid";
import { getDeviceFunction } from "../device-types/AsyncType";
import { BusMap } from "./BusMap";
import { DeviceMap } from "./DeviceMap";
import { PluginBank } from "./PluginBank";
import { getBlockType } from "./utils";
import { CommandEnvironment } from "..";
import log from "loglevel";

export class Machine {

	private fsm : CommandStateMachine;

	private pluginBank : PluginBank;

	public deviceMap : DeviceMap;
	public busMap : BusMap;

	private env: CommandEnvironment[] = [];

	constructor(opts: {
		pluginDir: string
	}){
		this.fsm = new CommandStateMachine({
			processes: []
		}, {
			performOperation: async (operation) => {

			}
		});

		this.deviceMap = new DeviceMap()
		this.busMap = new BusMap()

		this.pluginBank = new PluginBank({
			machine: this,
			pluginDir: opts.pluginDir || '/tmp/plugins'
		})

		this.requestState = this.requestState.bind(this)
		this.requestOperation = this.requestOperation.bind(this)
	}

	loadFlow = (payload: CommandPayloadItem[], id: string) => {
		let flow = payload.find((a) => a.id == id);

		let nodes = (flow)?.nodes.map((action) => {
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
				id: action.id, //action.type == "Trigger" ? "origin" : action.type == "PowerShutdown" ? 'shutdown' : action.id,
				type: getBlockType(action.type) || 'action',
				options: {
					blockType: getBlockType(action.type) || 'action',
					["sub-process"]: action?.subprocess?.id || undefined,
					timer: action.configuration?.find((a) => a.key == 'timeout')?.value,
					actions: actions
				}
			}
		})


		let paths = flow?.nodes.map((action) => {

			return action.next?.map((next) => {
				return {
					id: nanoid(),
					source: action.id, //action.type == "Trigger" ? 'origin' : action.id,
					target: next.target,
					options: {
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
		}, []).filter((a) => a)

		let subprocs : any = (flow || {nodes: []}).nodes.filter((a) => a.subprocess != undefined).map((subproc) => {
			if(!subproc.subprocess?.id) return;
			return {...this.loadFlow(payload, subproc.subprocess?.id)}
		})

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

			this.deviceMap.setupDevicePlugins(device.id)
			
		}))
	}

	async discoverEnvironment(){
		this.env = await this.pluginBank.discoverEnvironment()
		return this.env
	}

	async load(commandPayload: PayloadResponse){

		let payload = commandPayload.payload?.command;
		let layout = commandPayload.payload?.layout;

		if(layout) this.deviceMap.setAssignment(layout); //this.portAssignment = layout;

		await this.loadPlugins(commandPayload.payload?.layout || []);

		const flows = payload?.filter((a) => a.parent == null).map((flow) => {
			if(!payload) return {id: '', name: '', nodes: [], links: []};
			return this.loadFlow(payload, flow.id)

		}).filter((a) => a != undefined)

		console.log(flows, payload)
		
		// console.log("FLOWS", flows)
		// console.log(`Received command payload, starting state machine`)
		this.fsm = new CommandStateMachine({
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

		this.fsm.on('transition', (event) => {
			log.info(`Transitioning on chain (${event.chain}) from ${event.transition.from} to ${event.transition.to}`)
		})

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

	get state(){
		return this.fsm.state
	}

	get isRunning(){
		return this.fsm.isRunning
	}

	get mode(){
		return this.fsm.mode || CommandStateMachineMode.DISABLED
	}

	async start(){
		log.info("Starting state machine")
		await this.fsm.start();
	}

	async shutdown(){
		log.info("Stopping state machine")
		await this.fsm.stop();
	}

	async standby(){
		log.info("Pausing state machine")
		await this.fsm.pause()
	}

	async runOneshot(processId: string){
		return new Error("Not implemented");
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


	async requestState(event: {device: string, value: any}){
		let busPort = this.deviceMap.getDeviceBusPort(event.device)

		let busDevice = this.env.find((a) => a.id == busPort?.bus)
		if(!busDevice) return;
		let plugin = this.pluginBank.getByTag(busDevice?.type) //find((a) => a.TAG == busDevice?.type)
		// console.log("REQUESTING STATE FROM ", busPort?.bus, busPort?.port, event.value)
		
		if(!busPort?.bus) return;
		
		let prevState = this.busMap.get(busPort.bus, busPort.port)

		let writeOp: any;
		if(typeof(event.value) == 'object'){

			writeOp = {};
			for(var k in event.value){
				let stateItem = busPort?.state?.find((a) => a.key == k)

				if(!stateItem) continue;
				let value = event.value[k];
				if(stateItem.max && stateItem.min){
					value = (((stateItem.max - stateItem.min) / 100) * value) + stateItem.min

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

		if(Object.keys(changes).length < 1) return;

		await Promise.all(Object.keys(changes).map(async (bus) => {
			let busDevice = this.env.find((a) => a.id == bus)

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
				
				log.debug(`Writing state to ${bus} ${port.port}`, {writeOp})
				await plugin?.write(bus, port.port, writeOp);
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
		
	}

	//Request state + translator for name
	async requestOperation(event: {device: string, operation: string}){
		log.debug(`Requesting operation ${event.operation} on ${event.device}`)
		// console.log(`Requesting operation with device name ${event.device} ${event.operation}- StateMachine`)
	
		let busPort = this.deviceMap.getDeviceBusPort(event.device)
		
		if(!busPort?.bus || !busPort.port) return new Error("No bus-port found");

		let action = busPort.actions?.find((a) => a.key == event.operation)

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
	}



	changeMode(mode: CommandStateMachineMode){
		this.fsm.changeMode(mode);
	}
}