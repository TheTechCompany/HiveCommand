import { IOProcess } from "./Process";
import { ProgramProcess } from "./types/ProgramProcess";
import { EventEmitter } from 'events'
import { State } from "./State";
import { ProgramDevice } from "./types/ProgramDevice";
import { Condition } from "./Condition";
import { StateDevice } from "./Device";

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

export class CommandStateMachine extends EventEmitter {

	public state : State;
	
	public mode: CommandStateMachineMode = CommandStateMachineMode.DISABLED;

	private running : boolean = true;

	private processes : IOProcess[] = [];

	private process_state: any = {};

	private devices? : StateDevice[] = [];

	private program? : {
		initialState?: any;
		devices?: ProgramDevice[]
		processes?: ProgramProcess[]
	} = {}

    public timers: any = {

    };

	private client : CommandClient;

	private tickRate: number = 1000;

	constructor(program: {
		initialState?: any;
		devices?: ProgramDevice[]
		processes: ProgramProcess[],
		tickRate?: number
	}, client: CommandClient){
		super();

		this.tickRate = program.tickRate || 1000;

		this.program = program;

		this.devices = program.devices?.map((x) => new StateDevice(x));

		this.state = new State(program.initialState);

		this.client = client;

		console.debug(`Initializing State Machine`)

		this.processes = program.processes.map((x) => new IOProcess(x, this))

		this.processes.forEach((process) => {
			process.on('transition', (ev) => this.onProcessTransition(process, ev))
		})
		this.start = this.start.bind(this)
		this.performOperation = this.performOperation.bind(this);
	}

	onProcessTransition(process: IOProcess, event: {target: string}){
		this.emit('transition', {target: event.target, process: process.id})
	}

	get currentPosition(){
		return this.processes.map((x) => x.currentPosition)
	}

	getProcessPosition(name: string){
		let position = this.processes.find((x) => x.name == name)?.currentPosition
		return this.processes.find((x) => x.name == name)?.sub_processes?.find((a) => a.id == position)?.name
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

	async runOneshot(processId: string){
		// console.log(this.processes)
		console.log("ONESHOT")
		let allProcesses = this.program?.processes?.map((x) => [...(x.sub_processes || []).map((y) => ({...y, parent: x})), x]).reduce((prev, curr) => [...prev, ...curr], [])
		let process = allProcesses?.find((a) => a.id == processId)

		if(!process) return new Error("No process found")

		// if(process.parent){}
		console.log(this.mode)
		if(this.mode == CommandStateMachineMode.AUTO){
			//Request priority for this process
			console.log("VIP Incoming... Requesting priority")
			console.log(process)
			
			if((process as any).parent){
				this.processes.find((a) => a.id == (process as any).parent.id)?.requestPriority(process.id)
			}else{
				// this.processes.find((a) => a.id == process.id).requestPriority()
			}
		}else{
			//Run process in seperate loop

			let cleanProcess = new IOProcess(process, this)
			const result = await cleanProcess.runOnce()

		}

		// console.log(process)

		// return process.doCurrent()
	}

	changeMode(mode: CommandStateMachineMode){
		this.mode = mode;
	}

	get isRunning (){
		return this.running
	}

	updateState(proc_id: string, new_state: string, parent_proc?: string){
        this.process_state[parent_proc || proc_id] = parent_proc ? proc_id : new_state
    }

	// registerValue(key: string, value: any){
	// 	this.values[key] = value;
	// }

	// getState(key: string){
	// 	return this.values[key]
	// }

	// checkCondition(device: string, deviceKey: string, comparator: string, value: any){
	// 	let cond = new Condition({input: device, inputKey: deviceKey, comparator, value})
	// 	let state = this.state.get(device);
	// 	let input = state?.[deviceKey]
	// 	return cond.check(input, value)
	// }

	async checkInterlocks(){
		// console.log("Interlocks", this.devices?.filter((a) => a.hasInterlock).map((x) => x.interlock))

		await this.devices?.filter((a) => a.hasInterlock).filter((device) => {
			return device.checkInterlockNeeded(this.state.get(device.name))
		}).map(async (device) => {	
			// console.log("Checking")

			let {locked, lock} = await device.checkInterlock(this.state)
			// console.log("Checked", {locked, lock})
			if(locked){
				console.log("Reacting to lock");
				await device.doFallback(lock, this.performOperation)
			}
			// console.log("DEVICE", device.name, "LOCKED", locked)
		})	
	}

	async performOperation(deviceName: string, release?: boolean, operation?: string){
		let device =  this.devices?.find((a) => a.name == deviceName)

		if(device?.requiresMutex){
			console.log("Requires mutex", {deviceName}, {operation},{ release})
			if(!release){
				await device?.lock()
				console.log("Mutext acquired")

			}else{
				await device?.unlock()
				console.log("Mutext released")

			}
		}

		if(operation){
			await this.client.performOperation({device: deviceName, operation})
		}
		// this.emit('REQUEST:OPERATION', {device, operation})
		// console.log(`Perform operation ${operation} on ${device}`)
	}

	async start(mode?: CommandStateMachineMode){
		console.debug(`Starting State Machine`)

		if(mode != undefined) {
			console.log(`Changing mode to ${mode}`)
			this.mode = mode;
		}

		this.running = true;

		while(this.running){
			//Run all actions in current stage of execution
			await this.checkInterlocks();

			if(this.mode == CommandStateMachineMode.AUTO){
				try{
					const actions = Promise.all(this.processes.map(async (x) => await x.doCurrent()))
				}catch(e){
					console.debug(e)
				}

				const next = await Promise.all(this.processes.map(async (x) => x.moveNext()))
			}

			this.emit('TICK')

			await new Promise((resolve, reject) => setTimeout(() => resolve(true), this.tickRate))
		}
	}

	async stop(){
		this.running = false;
	}
}