import { ProgramProcess } from "./types/ProgramProcess";
import { EventEmitter } from 'events'
import { State } from "./State";
import { ProgramDevice } from "./types/ProgramDevice";
import { Condition } from "./Condition";
import { StateDevice } from "./Device";
import { Process, ProcessTransition } from '@hive-command/process'
import log from 'loglevel'
export * from './types'

export interface CommandClient { 
	performOperation: (ev: {device: string, operation: string}) => Promise<any>;
}

export enum CommandStateMachineMode {
	AUTO,
	MANUAL,
	TIMER,
	DISABLED
}

export enum CommandStateMachineStatus {
	OFF,
	STOPPING,
	ON,
	STARTING,
	PAUSING,
	STANDBY
}

export interface StateProgram {
	initialState?: any;
	devices?: ProgramDevice[]
	processes: ProgramProcess[],	
}

import * as actions from './base-plugins'

const base_actions = [
	{
		id: 'action',
		onEnter: actions.action
	},
	{
		id: 'sub-process',
		onEnter: actions.sub_process
	},
	{
		id: 'timer',
		onEnter: actions.timer
	},
	{
		id: 'trigger',
		onEnter: actions.trigger
	}
]

export interface CommandStateMachineEvents{
	'transition': (transition: ProcessTransition) => void;
	'event_loop': () => void;
}

export declare interface CommandStateMachine {
	on<U extends keyof CommandStateMachineEvents>(
		event: U, listener: CommandStateMachineEvents[U]
	): this;

	emit<U extends keyof CommandStateMachineEvents>(
		event: U,
		...args: Parameters<CommandStateMachineEvents[U]>
	): boolean;
}

export class CommandStateMachine extends EventEmitter {

	public state? : State;

	private status : CommandStateMachineStatus = CommandStateMachineStatus.OFF; //Represents a true running status of the state machine
	public mode: CommandStateMachineMode = CommandStateMachineMode.DISABLED; //Determines available actions

	private processes : Process[] = [];

	private process_state: any = {};

	private devices? : StateDevice[] = [];

	private program? : StateProgram;

	private running_processes: {[key: string]: Process} = {};

    public timers: any = {

    };

	private client : CommandClient;

	constructor(program: StateProgram, client: CommandClient){
		super();

		this.client = client;


		this.start = this.start.bind(this)
		this.performOperation = this.performOperation.bind(this);

		this.load(program)

		// console.debug(`Initializing State Machine`)

		// this.processes.forEach((process) => {
		// 	process.on('transition', (ev) => this.onProcessTransition(process, ev))
		// })


	}

	load(program: StateProgram){
		log.debug(`Loading new program ${program.processes.length} processes`)
		this.program = program;

		this.processes = program.processes.map((process) => {
			return new Process(process, base_actions as any, this.performOperation, (key: string) => {
				return this.state?.get(key)
			})
		})

		this.devices = program.devices?.map((x) => new StateDevice(x));

		this.processes.forEach((process) => {
			//Flow moves a step
			log.debug('Listening to process')
			process.on('transition', (ev) => this.onProcessTransition(process, ev))
		})

		this.state = new State(program.initialState || {});

	}


	onProcessTransition(process: Process, event: ProcessTransition){
		// log.debug('emit trans')/
		this.emit('transition', event)
	}

	
	getDeviceControl(deviceName: string){
		return this.devices?.find((a) => a.name == deviceName)?.isControlled
	}

	changeDeviceControl(deviceName: string, control: boolean){
		let ix = this.devices?.map((x) => x.name).indexOf(deviceName)
		if(ix != undefined && ix > -1){
			this.devices?.[ix].changeControlled(control)
		}
		// this.devices?.find((x) => x.name == deviceName)?.control = control;
	}



	async checkInterlocks(){
		// console.log("Interlocks", this.devices?.filter((a) => a.hasInterlock).map((x) => x.interlock))

		let interlocks = (this.devices?.filter((a) => a.hasInterlock).filter((device) => {
			return device.checkInterlockNeeded(this.state?.get(device.name))
		})) || []
		
		await Promise.all(interlocks.map(async (device) => {	
			// console.log("Checking")

			let {locked, lock} = await device.checkInterlock(this.state)
			// console.log("Checked", {locked, lock})
			if(locked){
				// console.log("Reacting to lock");
				await device.doFallback(lock, this.performOperation)
			}
			// console.log("DEVICE", device.name, "LOCKED", locked)
		}))
	}

	async performOperation(deviceName: string, release?: boolean, operation?: string){
		let device =  this.devices?.find((a) => a.name == deviceName)

		return await new Promise(async (resolve) => {
			if(device?.requiresMutex){
				// console.log("Requires mutex", {deviceName}, {operation},{ release})
				if(!release){
					await device?.lock()
					// console.log("Mutext acquired")

				}else{
					// console.log("Mutext waiting")
					await device?.unlock()
					// console.log("Mutext released")

				}
			}

			if(operation){
				await this.client.performOperation({device: deviceName, operation})
				resolve(true)
			}
		});
	}


	get isRunning (){
		return this.status == CommandStateMachineStatus.ON || Object.keys(this.running_processes).length > 0
	}

	get getMode(){
		return CommandStateMachineMode[this.mode]
	}

	get getStatus(){
		return CommandStateMachineStatus[this.status]
	}
	

	async runFlow(flowId: string){
		let allProcesses = this.program?.processes?.map((x) => [...(x.sub_processes || []).map((y) => ({...y, parent: x})), x]).reduce((prev, curr) => [...prev, ...curr], [])
		let process = allProcesses?.find((a) => a.id == flowId)

		if(!process) return new Error("No process found")

		if(this.mode == CommandStateMachineMode.MANUAL && this.status == CommandStateMachineStatus.OFF && !this.running_processes[flowId]){
			this.running_processes[flowId] = new Process(process, base_actions as any, this.performOperation, this.state?.get)
			const result =  await this.running_processes[flowId].start()
			delete this.running_processes[flowId]
			return result
		}
	}

	async stopFlow(flowId: string){
		if(this.mode == CommandStateMachineMode.MANUAL && this.status == CommandStateMachineStatus.OFF && this.running_processes[flowId]){
			const result = await this.running_processes[flowId].stop()
			delete this.running_processes[flowId]
			return result;
		}
	}

	changeMode(mode: CommandStateMachineMode){
		let canChange = false;
		let reason = "";
		switch(mode){
			case CommandStateMachineMode.AUTO:
				reason = "Ensure no running processes"
				canChange = Object.keys(this.running_processes).length == 0
				break;
			case CommandStateMachineMode.MANUAL:
				reason = "Ensure machine is off"
				canChange =  this.status == CommandStateMachineStatus.OFF
				break;
			case CommandStateMachineMode.DISABLED:
				reason = "Ensure machine is off and there are no running processes"
				canChange = this.status == CommandStateMachineStatus.OFF && Object.keys(this.running_processes).length == 0
			break;
		}
		if(canChange){
			this.mode = mode;
		}else{
			return new Error(reason)
		}
	}

	async start(){
		if(this.mode == CommandStateMachineMode.AUTO && this.status != CommandStateMachineStatus.ON && this.status != CommandStateMachineStatus.STARTING){
			
			console.debug(`Starting State Machine with ${this.processes.length} processes`)
			this.status = CommandStateMachineStatus.STARTING;

			Promise.all(this.processes.map(async (x) => await x.start()))

			this.status = CommandStateMachineStatus.ON;

			while(this.status == CommandStateMachineStatus.ON){
				await this.checkInterlocks();

				this.emit('event_loop')

				await new Promise((resolve, reject) => setTimeout(() => resolve(true), 10))
			}

		}else{
			log.warn(`FSM: START - No processes will be started because starting conditions are not met.`)
		}
		// this.mode = mode || CommandStateMachineMode.AUTO
		// // if(mode != undefined) {
		// // 	console.log(`Changing mode to ${mode}`)
		// // 	this.mode = mode;
		// // }

		// this.running = true;

		// while(this.running){
		// 	//Run all actions in current stage of execution
		// 	await this.checkInterlocks();

		// 	if(this.mode == CommandStateMachineMode.AUTO){
		// 		try{
		// 			const actions = Promise.all(this.processes.map(async (x) => await x.doCurrent()))
		// 		}catch(e){
		// 			console.debug(e)
		// 		}

		// 		const next = await Promise.all(this.processes.map(async (x) => x.moveNext()))
		// 	}

		// 	this.emit('TICK')

		// 	await new Promise((resolve, reject) => setTimeout(() => resolve(true), this.tickRate))
		// }
	}

	async stop(){
		if(this.mode == CommandStateMachineMode.AUTO && this.status != CommandStateMachineStatus.OFF && this.status != CommandStateMachineStatus.STOPPING){
			this.status = CommandStateMachineStatus.STOPPING;

			await Promise.all(this.processes.map(async (process) => await process.stop()))

			this.mode = CommandStateMachineMode.DISABLED
			// await Promise.all(this.processes.map((x) => x.shutdown()))

			// this.running = true;
			// while(this.running){op
			// 	await this.checkInterlocks();

			// 		try{
			// 			const actions = Promise.all(this.processes.map(async (x) => await x.doCurrent()))
			// 		}catch(e){
			// 			console.debug(e)
			// 		}

			// 		const next = await Promise.all(this.processes.map(async (x) => x.moveNext()))
				

			// 	this.emit('TICK')

			// 	await new Promise((resolve, reject) => setTimeout(() => resolve(true), this.tickRate))
			
			// }
			this.status = CommandStateMachineStatus.OFF
		}else{
			log.warn(`FSM: STOP - No processes will be started because starting conditions are not met.`)
		}

	}

	async pause(){
		this.status = CommandStateMachineStatus.PAUSING

		await Promise.all(this.processes.map(async (process) => await process.pause()))

		this.status = CommandStateMachineStatus.STANDBY;
	}

}