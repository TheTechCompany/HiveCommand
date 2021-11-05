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

    public timers: any = {

    };

	private client : CommandClient;

	constructor(program: {
		initialState?: any;
		devices?: ProgramDevice[]
		processes: ProgramProcess[]
	}, client: CommandClient){
		super();


		this.devices = program.devices?.map((x) => new StateDevice(x));

		this.state = new State(program.initialState);

		this.client = client;

		console.debug(`Initializing State Machine`)

		this.processes = program.processes.map((x) => new IOProcess(x, this))

		this.start = this.start.bind(this)
		this.performOperation = this.performOperation.bind(this);
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
		await this.devices?.filter((a) => a.hasInterlock).filter((device) => {
			return device.checkInterlockNeeded(this.state.get(device.name))
		}).map(async (device) => {

			let locked = await device.checkInterlock(this.state.get(device.name))
		
			if(locked){
				console.log("Reacting to lock");
				await device.doFallback(this.performOperation)
			}
			console.log("DEVICE", device.name, "LOCKED", locked)
		})	
	}

	async performOperation(deviceName: string, release?: boolean, operation?: string){
		let device =  this.devices?.find((a) => a.name == deviceName)

		if(device?.requiresMutex){
			console.log("Requires mutex")
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

			if(this.mode !== CommandStateMachineMode.DISABLED){
				try{
					const actions = Promise.all(this.processes.map(async (x) => await x.doCurrent()))
				}catch(e){
					console.debug(e)
				}

				const next = await Promise.all(this.processes.map(async (x) => x.moveNext()))
			}

			this.emit('TICK')

			await new Promise((resolve, reject) => setTimeout(() => resolve(true), 500))
		}
	}

	async stop(){
		this.running = false;
	}
}