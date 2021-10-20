import { IOProcess } from "./Process";
import { ProgramProcess } from "./types/ProgramProcess";
import { EventEmitter } from 'events'

export class CommandStateMachine extends EventEmitter {

	private values : {[key: string]: any} = {};

	private running : boolean = true;

	private processes : IOProcess[] = [];

	private process_state: any = {};

    public timers: any = {

    };

	constructor(program: {
		processes: ProgramProcess[]
	}){
		super();
		console.debug(`Initializing State Machine`)

		this.processes = program.processes.map((x) => new IOProcess(x, this))

		this.start = this.start.bind(this)
	}

	get isRunning (){
		return this.running
	}

	updateState(proc_id: string, new_state: string, parent_proc?: string){
        this.process_state[parent_proc || proc_id] = parent_proc ? proc_id : new_state
    }

	registerValue(key: string, value: any){
		this.values[key] = value;
	}

	getValue(key: string){
		return this.values[key]
	}

	async performOperation(device: string, operation: string){
		this.emit('REQUEST:OPERATION', {device, operation})
		console.log(`Perform operation ${operation} on ${device}`)
	}

	async start(){
		console.debug(`Starting State Machine`)

		this.running = true;
		while(this.running){
			console.debug(`State Tick`)
			//Run all actions in current stage of execution
			try{
				const actions =   Promise.all(this.processes.map(async (x) => await x.doCurrent()))
			}catch(e){
				console.debug(e)
			}
			// console.debug(`State Tick`)

			// //Log actions
			// console.log(actions)

			const next = await Promise.all(this.processes.map((x) => x.moveNext()))

			await new Promise((resolve, reject) => setTimeout(() => resolve(true), 1000))
		}
	}

	async stop(){
		this.running = false;
	}
}