import { IOProcess } from "./Process";
import { ProgramProcess } from "./types/ProgramProcess";
import { EventEmitter } from 'events'
import { State } from "./State";

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

    public timers: any = {

    };

	private client : CommandClient;

	constructor(program: {
		processes: ProgramProcess[]
	}, client: CommandClient){
		super();

		this.state = new State();

		this.client = client;

		console.debug(`Initializing State Machine`)

		this.processes = program.processes.map((x) => new IOProcess(x, this))

		this.start = this.start.bind(this)
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

	async performOperation(device: string, operation: string){
		await this.client.performOperation({device, operation})
		// this.emit('REQUEST:OPERATION', {device, operation})
		// console.log(`Perform operation ${operation} on ${device}`)
	}

	async start(){
		console.debug(`Starting State Machine`)

		this.running = true;

		while(this.running){
			//Run all actions in current stage of execution
			if(this.mode !== CommandStateMachineMode.DISABLED){
				try{
					const actions = Promise.all(this.processes.map(async (x) => await x.doCurrent()))
				}catch(e){
					console.debug(e)
				}

				const next = await Promise.all(this.processes.map((x) => x.moveNext()))
			}
			console.log('MTICK')

			this.emit('TICK')

			await new Promise((resolve, reject) => setTimeout(() => resolve(true), 1000))
		}
	}

	async stop(){
		this.running = false;
	}
}