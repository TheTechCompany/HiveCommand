
// import doT from 'dot';
import EventEmitter from "events";
import { ProcessChain } from './chain';
import { CommandAction, CommandProcess } from './types';
import log from 'loglevel'

log.setLevel('debug')

export * from './types'

export {
    ProcessChain
}

export interface ChainTransition {
    from: string;
    to: string;
}


export interface ProcessTransition {
    chain?: string;
    txid: string,
    direction: 'entry' | 'exit',
    transition: ChainTransition
}

export interface ProcessEvents {
    'transition': (transition: ProcessTransition) => void;

     'started': () => void;
     'finished': () => void;
     'stopping': () => void;
     'stopped': () => void;
}

export declare interface Process {
    on<U extends keyof ProcessEvents>(
        event: U,
        listener: ProcessEvents[U]
    ): this;

    emit<U extends keyof ProcessEvents>(
        event: U, ...args: Parameters<ProcessEvents[U]>
    ): boolean;
}

export class Process extends EventEmitter{
    private process? : CommandProcess;
    
    private parent?: CommandProcess;

    // private actions : Action[] = [];

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

    
        this.load(process)

        this.performOperation = this.performOperation.bind(this)
        // this.actions = this.action_nodes
    }

    load(process: CommandProcess){
        this.process = process

        // console.log({nodes: this.process})
        this.chains.entrypoints = this.process.nodes?.filter((a) => a.type == 'trigger').map((node) => {
            return new ProcessChain(this, process, node.id, this.actions)
        }) || []

        this.chains.shutdown = this.process.nodes?.filter((a) => a.type == 'shutdown').map((node) => {
            return new ProcessChain(this, process, node.id, this.actions)
        }) || []

        this.chains.entrypoints.forEach((entrypoint) => {
            entrypoint.on('transition', (ev) => {
                this.emit('transition', {
                    chain: entrypoint.pid, 
                    txid: entrypoint.getId, 
                    direction: 'entry',
                    transition: ev
                })
            })
        })

        this.chains.shutdown.map((exitpoint) => {
            exitpoint.on('transition', (ev) => {

                this.emit('transition', {
                    chain: exitpoint.pid, 
                    txid: exitpoint.getId, 
                    direction: 'exit',
                    transition: ev
                })
            })
        })

    }

    async performOperation(device: string, release: boolean, operation: string){
        // log.debug(`Perform op ${operation} on ${device}`)
        await this.perform(device, release, operation)
    }


    get id(){
        return this.process?.id
    }

    
    //: Process[]
	get sub_processes() {
		return this.process?.sub_processes //?.map((x) => new Process(x, this.actions, this.perform, this)) || []
	}

    get isRunning (){
        return this.running
    }
    // get sub_processes(){
    //     return this.process.sub_processes
    // }


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

    runChain(){

    }

    async start(){
        log.debug(`CommandProcess - START: ${this.process?.name} - (${this.chains.entrypoints.length} entrypoints)`)

        this.running = true;

		let hasNext = this.chains.entrypoints.map((x) => x.shouldRun()).indexOf(true) > -1
        
        this.emit('started')

        // console.log(this.chains)
        while(hasNext && this.running){
			hasNext = this.chains.entrypoints.map((x) => x.shouldRun()).indexOf(true) > -1
            
            // log.debug({hasNext}, this.chains.entrypoints.map((x) => x.currentActions))
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

        this.emit('finished')
        // console.log()
    }

    async stop(){
        log.debug(`CommandProcess - STOP: ${this.process?.name} - (${this.chains.shutdown.length} exitpoints)`)
        this.emit('stopping')

        this.running = false;

		let hasNext = this.chains.shutdown.map((x) => x.shouldRun()).indexOf(true) > -1

        while(hasNext){
			hasNext = this.chains.shutdown.map((x) => x.shouldRun()).indexOf(true) > -1

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
        this.emit('stopped')
    }

    async pause(){

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