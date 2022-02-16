import { ProgramProcess } from "./types/ProgramProcess";
import { EventEmitter } from 'events'
import { State } from "./State";
import { ProgramDevice } from "./types/ProgramDevice";
import { Condition } from "./Condition";
import { StateDevice } from "./Device";
import { CommandAction, Process, ProcessTransition } from '@hive-command/process'
import log from 'loglevel'
export * from './types'

export interface CommandClient { 
	requestState: (ev: { device: string, state: any | {[key: string]: any} }) => Promise<any>;
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
import { nanoid } from "nanoid";

const base_actions = [
	{
		id: 'action',
		onEnter: actions.action,
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
	'started': () => void;
	'stopped': () => void;
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

		this.state = new State(program.initialState || {});

		this.processes = program.processes.map((process) => {
			return new Process(process, base_actions as any, this.performOperation, (key: string) => {
				return this.state?.get(key)
			})
		})

		this.devices = program.devices?.map((x) => new StateDevice(x, this, this.client));

		this.processes.forEach((process) => {
			//Flow moves a step
			log.debug('Listening to process')
			process.on('transition', (ev) => this.onProcessTransition(process, ev))
		})
	}

	reload(){
		if(this.program) {
			log.debug(`Reloading program`)
			this.load(this.program)
		}
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

	isActive(flowId: string){
		let running_proc = this.running_processes[flowId]

		let active_proc = this.processes.find((a) => a.id == flowId || a.isActive(flowId))

		return (active_proc || running_proc)
	}


	async checkInterlocks(){
		// console.log("Interlocks", this.devices?.filter((a) => a.hasInterlock).map((x) => x.interlock))

		let deviceInterlocks = (this.devices || []).filter((a) => a.hasInterlock == true)
		// console.log({deviceInterlocks})
		let interlocks = deviceInterlocks?.filter((device) => {
			return device.checkInterlockNeeded(this.state?.get(device.name))
		}) || []
		
		// console.log({interlocks})
		await Promise.all(interlocks.map(async (device) => {	
			// console.log("Checking")

			let {locked, lock} = await device.checkInterlock(this.state)
			// console.log("Checked", {locked, lock})
			if(locked){
				// console.log("Reacting to lock");
				log.info(`Interlock ${lock.device} ${device.name} locked`)
				await device.doFallback(lock)
			}
			// console.log("DEVICE", device.name, "LOCKED", locked)
		}))
	}

	async performOperation(deviceName: string, release?: boolean, operation?: string){
		let device =  this.devices?.find((a) => a.name == deviceName)

		// console.log({device})

		return await new Promise(async (resolve) => {
			if(device?.requiresMutex){
				// console.log("Requires mutex", {deviceName}, {operation},{ release})
				if(release == false){
					await device?.lock()
					// console.log("Mutext acquired")

				}else if(release == true){
					// console.log("Mutext waiting")
					await device?.unlock()
					// console.log("Mutext released")

				}
			}

			log.debug("perform op - fsm", deviceName, operation, {device, operation})
			if(operation){
				await device?.performOperation(operation);
				// await this.client.performOperation({device: deviceName, operation})
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
		console.log({flowId})
		let allProcesses = this.program?.processes?.map((x) => [...(x.sub_processes || []).map((y) => ({...y, parent: x})), x]).reduce((prev, curr) => [...prev, ...curr], [])
		let process = allProcesses?.find((a) => a.id == flowId)
		console.log({procs: this.program?.processes, process})
		if(!process) return new Error("No process found")

		let runTag = `Run Flow - ${process.name} : ${nanoid()}`

		if(this.mode == CommandStateMachineMode.MANUAL && this.status == CommandStateMachineStatus.OFF && !this.running_processes[flowId]){
			console.time(runTag)
			if(!this.state) return;
			this.running_processes[flowId] = new Process(process, base_actions as any, this.performOperation, this.state?.get)
			const result =  await this.running_processes[flowId].start()
			delete this.running_processes[flowId]
			console.timeEnd(runTag)
			return result
		}else{
			return new Error("Cannot run process, starting conditions invalid")
		}
	}

	async stopFlow(flowId: string){
		if(this.mode == CommandStateMachineMode.MANUAL && this.status == CommandStateMachineStatus.OFF && this.running_processes[flowId]){
			const result = await this.running_processes[flowId].stop()
			delete this.running_processes[flowId]
			return result;
		}else{
			return new Error("Cannot stop process, stopping conditions invalid")
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
			log.error(reason)
			return new Error(reason)
		}
	}

	async start(){
		if(this.mode == CommandStateMachineMode.AUTO && this.status != CommandStateMachineStatus.ON && this.status != CommandStateMachineStatus.STARTING){
			
			console.debug(`Starting State Machine with ${this.processes.length} processes`)
			this.status = CommandStateMachineStatus.STARTING;

			Promise.all(this.processes.map(async (x) => await x.start()))

			this.status = CommandStateMachineStatus.ON;

			this.emit('started')

			//TODO change while clause to protect non disabled modes
			//move out of start to ensure manual mode has safety interlocks
			while(this.status == CommandStateMachineStatus.ON){
				await this.checkInterlocks();

				this.emit('event_loop')

				await new Promise((resolve, reject) => setTimeout(() => resolve(true), 500))
			}

		}else{
			log.warn(`FSM: START - No processes will be started because starting conditions are not met.`)
		}
	
	}

	async stop(){
		if(this.mode == CommandStateMachineMode.AUTO && this.status != CommandStateMachineStatus.OFF && this.status != CommandStateMachineStatus.STOPPING){
			this.status = CommandStateMachineStatus.STOPPING;

			console.log("Stopping")
			await Promise.all(this.processes.map(async (process) => process.stop()))
			console.log("Stopped")
			this.mode = CommandStateMachineMode.DISABLED
		
			this.status = CommandStateMachineStatus.OFF

			log.info('State Machine - Stopped')

			this.emit('stopped')
		}else{
			log.warn(`FSM: STOP - No processes will be stopped because starting conditions are not met.`)
		}

	}

	async pause(){
		this.status = CommandStateMachineStatus.PAUSING

		await Promise.all(this.processes.map(async (process) => await process.pause()))

		this.status = CommandStateMachineStatus.STANDBY;
	}

}