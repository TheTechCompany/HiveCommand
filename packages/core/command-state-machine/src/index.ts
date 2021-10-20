import { IOProcess } from "./Process";

export class CommandStateMachine {

	private values : {[key: string]: any} = {};

	private running : boolean = false;

	private processes : IOProcess[] = [];

	private process_state: any = {};

    public timers: any = {

    };

	constructor(){
		
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

	performOperation(device: string, operation: string){
		console.log(`Perform operation ${operation} on ${device}`)
	}

	async start(){

		while(this.running){
			//Run all actions in current stage of execution

			const actions = await Promise.all(this.processes.map((x) => x.doCurrent()))

			//Log actions
			console.log(actions)

			const next = await Promise.all(this.processes.map((x) => x.moveNext()))

			await new Promise((resolve, reject) => setTimeout(() => resolve(true), 1000))
		}
	}

	async stop(){
		this.running = false;
	}
}