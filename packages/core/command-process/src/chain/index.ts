import { nanoid } from "nanoid";
import { CommandProcess, CommandProcessEdge, CommandProcessNode } from "../types";


export interface ProcessChainDescriptor {
	id: string;
	links?: ProcessChainDescriptor[]
}

export class ProcessChain {

	private id: string = nanoid();

	private program: CommandProcess;

	private current: string[]

	private current_run: boolean[];

	constructor(process: CommandProcess, entry: string){
		this.program = process;

		console.log(this.program)

		this.current = [entry]

		this.current_run = [false]
	}

	changePosition(current: string[]){
		this.current = current
	}

	run(){
		console.log(this.id, this.current)
		this.current_run = this.current.map((x) => true)


	// 	let current_action = this.actions.find((a) => a.id == this.current_state);

	// 	if(current_action){
	// 		if(!this.current_hasRun){
	// 			console.info(`Process: ${this.process.name} run ${current_action.id}`)
	// 			 const result = await current_action.performAction()
	// 			this.current_hasRun = true;
	// 		}

	// 	}

	// 	let current_node = this.process.nodes?.[this.current_state];

	// 	let next = this.checkNext();
	//  //   console.log(next)
	// 	let priority = next.filter((a) => a.value).sort((a, b) => b.conds - a.conds)

	// 	if((!current_action || current_action.hasRun) && priority.length > 0){
	// 		console.log("Transition to: ", priority[0].target)
	// 		this.current_state = priority[0].target
	// 		this.current_hasRun = false;

	// 		this.parent.updateState(this.process.id, this.current_state)
	// 	}
	}

	next(){
		this.current = this.current.map((x) => {
			return this.getNext(x)
		}).reduce((prev, curr) => prev?.concat(curr || []), []) || []

		this.current_run = this.current.map((x) => false)
	}

	

	getNext(id: string){
		return this.program.edges?.filter((a) => a.source == id).map((x) => x.target) || [];
	}

	hasRun(){
		return this.current_run.indexOf(false) < 0;
	}

	hasNext(){
		return this.current.map((x) => (this.getNext(x) || []).length > 0 && !this.hasRun()).indexOf(true) > -1;
	}


}