import { nanoid } from "nanoid";
import { Process } from "..";
import { CommandProgramAction, ProcessAction } from "../action";
import { Transition } from "../transition";
import { CommandAction, CommandProcess, CommandProcessEdge, CommandProcessNode } from "../types";


export interface ProcessChainDescriptor {
	id: string;
	links?: ProcessChainDescriptor[]
}

export class ProcessChain {

	private id: string = nanoid();
	private process: Process;

	private program: CommandProcess;

	private current: ProcessAction[] = []
	// private current: string[]

	// private current_run: boolean[];

	// private current_running: string[];

	private action_types: CommandAction[] = [];

	private actions: ProcessAction[] = [];
	private transitions: Transition[] = [];

	constructor(process: Process, chain: CommandProcess, entry: string, actions?: CommandAction[]){
		this.program = chain;
		this.process = process
		this.action_types = actions || []


		console.log(this.program, {process: this.process})


		this.actions = chain.nodes?.map((node) => { return new ProcessAction(node, this, this.action_types) }) || []
		this.transitions = chain.edges?.map((edge) => { return new Transition(edge) }) || []
	
		let entryNode = this.actions?.find((a) => a.id == entry)
	
		this.current = entryNode ? [entryNode] : []

		// this.current_running = []
		// this.current_run = [false]


		this.performOperation = this.performOperation.bind(this)
	}

	performOperation(device: string, release: boolean, operation: string){
		this.process.performOperation(device, release, operation)
	}

	getState(key: string){
		this.process.getState(key)
	}

	changePosition(current: string[]){
		// this.current = current
	}

	async run(){
		// console.log("RUN", this.id, this.current)
		// this.current_run = this.current.map((x) => true)

			    await new Promise(async (resolve, reject) => {
					let current_actions = this.current
			        // let current_actions = this.program.nodes?.filter((a) => this.current.indexOf(a.id) > -1) || []

					// console.log(current_action, this.actions, this.current_state)
			        if(current_actions.length > 0){

						await Promise.all(current_actions.map(async (action, ix) => {
							let hasRun = action.hasRun; // this.current_run[ix];
							let isRunning = action.isRunning; //this.current_running.indexOf(action.id) > -1;

					// console.log("RUN", this.current, current_actions, {hasRun, isRunning})

							let act = this.actions.find((a) => a.id == action.id)
							if(act && !hasRun && !isRunning){

								//Prioritize

								// let act = new ProcessAction(action, this, this.action_types);
								console.log("onEnter")
								await act.onEnter()
								
							}
						}))

						resolve(true)

			            // if(!current_action.hasRun && !current_action.isRunning){
			            //     // let priority = this.prioritize;
			            //     if(this.prioritize == this.process.nodes[this.current_state]?.extras?.["sub-process"]){
			            //         this.prioritize = undefined;
			            //     }
			            //     // console.log(this.process.nodes[this.current_state].extras?.["sub-process"])
		
			            //     current_action.onEnter(this.prioritize).then((result) => {
			            //         console.log(this.current_state, this.process.name, this.prioritize)
							   
			            //         // console.log(`Process: ${this.process.name} run ${this.current_state}`)
			            //         // if(this.process.nodes[this.current_state].extras?.["sub-process"] == this.prioritize){
			            //         //     // console.log("De prioritize")
			            //         //     this.prioritize = undefined;
			
			            //         // }
			            //         resolve(true);
			            //     });
					 
		
			            // }
			        }else{
			            resolve(false);
			        }
			    })
			  //  return false;
			
		
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
		let status = this.current.forEach((x, ix) => {
			const next = this.checkNext(x.id)

			let priority = next.filter((a) => a.value).sort((a, b) => b.conds - a.conds)

			let hasRun = x.hasRun;
			let isRunning = x.isRunning;

			if((hasRun) && priority.length > 0){

				// console.log({priority})
				this.current = this.current.filter((a) => a.id != x.id)
				// this.current.splice(ix, 1)

				let newItem = this.actions.find((a) => a.id == priority[0].target)
				if(newItem) {
					console.log("NEW ITEM");
					this.current.push(newItem)

				}

				// if(priority[0].target) this.current[ix] = priority[0].target

				// this.process.updateState(this.id, x)
			}

			// console.log("NEXT", next)
			// return next;
		})

		// let next = this.checkNext();
		//          //   console.log(next)
		//             let priority = next.filter((a) => a.value).sort((a, b) => b.conds - a.conds)
		
		//             if((!current_action || current_action.hasRun) && priority.length > 0){
		//                 console.log("Transition to: ", priority[0].target)
		//                 this.current_state = priority[0].target
		//                 this.current_hasRun = false;
		
		//                 this.parent.updateState(this.process.id, this.current_state)
		//             }

		// console.log({status})
		//.reduce((prev, curr) => prev?.concat(curr || []), []) || []

		// this.current_run = this.current.map((x) => false)
	}


	checkNext(id: string){
		        let next = this.getNext(id);
		
		        let results = next.map((next_id: string) =>{
					let transition = this.transitions.find((a) => a.target == next_id)

		            let conds = transition?.conditions || [];
		
		            let output_conds : any[] = [];
		
		            let truthy = true;
		            conds.forEach((cond) => {  
		
		                //Get input value from value bank valueBank[input][inputKey]
		                // console.log(this.parent.state.get(cond.input_id), cond.input_key)
		                // console.log(this.parent.state.get(cond.input_id), this.parent.state)
		
		                let input = this.process.getState(cond.input_id)?.[cond.input_key]

		                const inputValue = `${input}`
					
		                let checkValue = `${cond.value_id}`
		
		                console.log(input, inputValue, checkValue)
		
		                if(!cond.check(inputValue, checkValue)){
		                    truthy = false;
		                }
		
		                output_conds.push({cond: cond, value: truthy, inputValue, checkValue, value_id: cond.value_id})
		            })
		            return {target: transition?.target, value: truthy, conds: conds.length, output_conds};
		        })
		        return results;
		    }
	

	getNext(id: string){
		return this.program.edges?.filter((a) => a.source == id).map((x) => x.target) || [];
	}

	hasRun(){
		// console.log(this.current.map((x) => ({id: x.id, hasRun: x.hasRun})))
		return this.current.map((x) => x.hasRun).indexOf(false) < 0;
	}

	hasNext(){
		return this.current.map((x) => (this.getNext(x.id) || []).length > 0 && (!this.hasRun())).indexOf(true) > -1;
	}


}