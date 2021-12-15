
// import doT from 'dot';
import EventEmitter from "events";
import { ProcessChain } from './chain';
import { CommandAction, CommandProcess } from './types';

export * from './types'

export {
    ProcessChain
}

export class Process extends EventEmitter{
    private process : CommandProcess;
    
    private parent?: CommandProcess;

    // private actions : Action[] = [];

    public current_state: string;

    public running: boolean = false;

    private prioritize?: string; //Node id to prioritize reaching

	private chains : {
		entrypoints: ProcessChain[],
		shutdown: ProcessChain[]
	} = {
		entrypoints: [],
		shutdown: []
	}

    private perform: (device: string, release: boolean, operation: string) => Promise<any>

    public getState: any;

    private actions : CommandAction[];

    constructor(
        process: CommandProcess, 
        actions: CommandAction[], 
        performOperation: (device: string, release: boolean, operation: string) => Promise<any>, 
        getState: any,
        parent?: CommandProcess
    ){
        super();

        this.getState = getState

        this.perform = performOperation
        this.actions = actions;

        this.parent = parent

        this.process = process
        this.current_state = 'origin';

		this.chains.entrypoints = this.process.nodes?.filter((a) => a.type == 'trigger').map((node) => {
			return new ProcessChain(this, process, node.id, actions)
		}) || []

		this.chains.shutdown = this.process.nodes?.filter((a) => a.type == 'shutdown').map((node) => {
			return new ProcessChain(this, process, node.id, actions)
		}) || []

        this.performOperation = this.performOperation.bind(this)
        // this.actions = this.action_nodes
    }

    async performOperation(device: string, release: boolean, operation: string){
        await this.perform(device, release, operation)
    }


    get parentId(){
        return this.parent?.id
    }

    get id(){
        return this.process.id
    }

    get name(){
        return this.process.id
    }
    
	get sub_processes() : Process[]{
		return this.process?.sub_processes?.map((x) => new Process(x, this.actions, this.perform, this)) || []
	}
    // get sub_processes(){
    //     return this.process.sub_processes
    // }

	runOnce(){

	}


    requestPriority(id: string){
        // if(this.current_state == id) return;
        // console.log("Requesting priority: ", id)
        // let current_action = this.actions.find((a) => a.id == this.current_state)
        // if(current_action){
        //     current_action.requestPriority(id)
        // }   

        // this.prioritize = id;
    }

    // doCurrent() : Promise<boolean>{
    //     return new Promise((resolve, reject) => {
    //         let current_action = this.actions.find((a) => a.id == this.current_state)
	// 		// console.log(current_action, this.actions, this.current_state)
    //         if(current_action){
    //             if(!current_action.hasRun && !current_action.isRunning){
    //                 // let priority = this.prioritize;
    //                 if(this.prioritize == this.process.nodes[this.current_state]?.extras?.["sub-process"]){
    //                     this.prioritize = undefined;
    //                 }
    //                 // console.log(this.process.nodes[this.current_state].extras?.["sub-process"])

    //                 current_action.onEnter(this.prioritize).then((result) => {
    //                     console.log(this.current_state, this.process.name, this.prioritize)
                       
    //                     // console.log(`Process: ${this.process.name} run ${this.current_state}`)
    //                     // if(this.process.nodes[this.current_state].extras?.["sub-process"] == this.prioritize){
    //                     //     // console.log("De prioritize")
    //                     //     this.prioritize = undefined;
    
    //                     // }
    //                     resolve(true);
    //                 });
             

    //             }
    //         }else{
    //             resolve(false);
    //         }
    //     })
    //   //  return false;
    // }

    // moveNext(){
    //     let nextSteps = this.checkNext();

    //     let sortedSteps = nextSteps.filter((a) => a.value).sort((a, b) => b.conds - a.conds)
        
    //     let current_action = this.actions.find((a) => a.id == this.current_state)

    //     // console.log("MOVE NEXT", current_action, current_action?.hasRun, sortedSteps)
    //     if((!current_action || current_action.hasRun) && sortedSteps.length > 0){ //!current_action || current_hasRun
    //         if(current_action) {
    //             // console.log(current_action.blockType)
    //             current_action.onExit();
    //         }

    //         this.current_state = sortedSteps[0].target;
    //         this.current_hasRun = false;
    //         this.current_isRunning = false;

    //         this.emit('transition', {target: sortedSteps[0].target})

    //         this.parent.updateState(this.process.id, this.current_state)
    //         return true;
    //     }
    //     return false;
    // }

    async start(){
        console.info(`Process: ${this.process.name} start`)

        this.running = true;

		let hasNext = this.chains.entrypoints.map((x) => x.hasNext()).indexOf(true) > -1

        // console.log(hasNext, this.running)

        while(this.running){
            // console.log({hasNext})
			hasNext = this.chains.entrypoints.map((x) => x.hasNext()).indexOf(true) > -1
            // console.log({hasNext})

			Promise.all(this.chains.entrypoints.map(async (chain) => await chain.run()));

			await Promise.all(this.chains.entrypoints.map((chain) => chain.next()));

			await new Promise((res, rej) => setTimeout(() => res(true), 10))
            /*
                Get current_state node
                -> if hasRun == false : execute action
                    -> action == action : run
                    -> action == sub-process : run sub-process 
                
                -> check transition until truthy return
            */

           
        }
    }

    // async runOnce(){
    //     let origin = this.startPoint;

    //     let finish : any = () => {};
    //     let finished = false;

    //     let resolver = new Promise((resolve) => finish = resolve)

    //     this.actions.forEach((action) => {

    //         action.hasRun = false;
    //     })

    //     await new Promise((resolve) => {
    //         this.parent.on('TICK', async () => {
    //             if(this.hasNext() || !finished){

    //                 await this.doCurrent();


    //                 await this.moveNext();

    //                 if(!this.hasNext()){
    //                     resolve(true)
    //                     finished = true;
    //                 }

    //                 // let action = this.actions.find((a) => a.id == this.current_state);
    //                 // if(action){
    //                 //     if(!action.hasRun && !action.isRunning){
    //                 //         await action.onEnter();
    //                 //     }
    //                 // }
        
    //                 // let next = this.checkNext();
        
    //                 // let priority = next.filter((a) => a.value).sort((a, b) => b.conds - a.conds);
    //                 // if((!action || action.hasRun) && priority.length > 0){
    //                 //     await action?.onExit()
        
    //                 //     this.current_state = next[0].target
        
    //                 //     this.parent.updateState(this.process.id, this.current_state, this.parent_process?.process.id)
        
    //                 // }
                    
    //                 // if(priority.length == 0){
    //                 //     resolve(true);
    //                 //     finished = true;
    //                 // }
    //             }
    //         })
    //     })
       
    //     console.log("Done")
    // }

    async stop(){
        this.running = false;

		let hasNext = this.chains.shutdown.map((x) => x.hasNext()).indexOf(true) > -1

        while(hasNext && this.running){
			hasNext = this.chains.shutdown.map((x) => x.hasNext()).indexOf(true) > -1

			Promise.all(this.chains.shutdown.map(async (chain) => await chain.run()));

			await Promise.all(this.chains.shutdown.map((chain) => chain.next()));

			await new Promise((res, rej) => setTimeout(() => res(true), 10))
            /*
                Get current_state node
                -> if hasRun == false : execute action
                    -> action == action : run
                    -> action == sub-process : run sub-process 
                
                -> check transition until truthy return
            */

           
        }
    }


    // hasNext(){
    //     let next = this.nextPoints(this.current_state)
    //     return next.length > 0
    // }


   
  
    // nextPoints(current: string){
    //     let points : Transition[] = [];
    //     // console.log(this.process.links, current)
    //     Object.keys(this.process.links || {}).forEach((key) => {
    //         if(this.process.links?.[key].source == current){
    //             points.push(new Transition(this.process.links?.[key]))
    //         }
    //     })
    //     return points;
    // }
}