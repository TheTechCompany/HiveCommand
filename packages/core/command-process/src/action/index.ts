import { Process } from "@hive-command/process";
import { nanoid } from "nanoid";
import { ProcessChain } from "../chain";
import { CommandAction, CommandProcessNode } from "../types";

export interface CommandProgramAction {
	device: string;
	release?: boolean;
	operation?: string;
}

export class ProcessAction {

    public id: string;

    private process: ProcessChain;
    private node: CommandProcessNode;
    
    public hasRun: boolean = false;
    public isRunning: boolean = false;

    private prioritize?: string;

	private actions: CommandAction[] = [];

    constructor(node: CommandProcessNode, process: ProcessChain, actions: CommandAction[]){
        this.node = node
        this.id = this.node.id;
        this.process = process;

		this.actions = actions
        
    
        if(!this.node.type){
            this.hasRun = true;
        }
    }

	clone(){
		return new ProcessAction(this.node, this.process, this.actions)
	}

    get actionId(){
        return this.node?.options?.["sub-process"]
    }

    get blockType(){
        return (this.node.type) || '';
    }

    requestPriority(id?: string){

    }

    async onEnter(priority?: string){
        // console.log(`Entering node ${this.node.type} ${this.node.id} ${this.process}`)

		this.isRunning = true;

        let isPrioritized = priority != undefined; //&& priority == this.node.id;

        // console.log("isPrioritize", isPrioritized, priority)

		let action = this.actions.find((a) => a.id == this.blockType)

        console.log("onEnter", action, this.node);

		await action?.onEnter?.(this.node.options, {
			performOperation: this.process.performOperation,
			getState: this.process.getState,
			actions: this.actions
		}, this.process.getProcess)
		
		this.hasRun = true;
		this.isRunning = false;

        // console.log("onEnterExit", action, this.node);
        // switch(this.blockType){
        //     case 'action':
        //         this.isRunning = true;

        //         let actions = this.node.options?.actions || [];

        //         let result = await Promise.all(actions.map((async (action: CommandProgramAction) => {
        //             return await this.process.performOperation(action.device, action.release || false, action.operation)
        //         })))

        //         this.isRunning = false;
        //         this.hasRun = true;
        //         return result;
        //     case 'sub-process':
        //         this.isRunning = true;
                
        //         let sub_process = this.process.sub_processes?.find((a) => a.id == this.node?.options?.["sub-process"]);
        //         if(sub_process){
        //             let sub = new Process(sub_process, this.actions, this.process)
                    
        //             if(priority) sub.requestPriority(priority);

        //             const result = await sub.runOnce();
                    
        //             this.hasRun = true;
        //             this.isRunning = false;
        //             return result;
        //         }
        //     break;
        //     case 'timer':
        //         if(!isPrioritized || priority == this.node.id || priority == this.process.id){
        //             this.isRunning = true;
        //             let id = nanoid();

        //             console.time(`Timer ${id}`)
                    
        //             let timeout = parseInt(this.node.options?.timer)
                    
        //             this.runner.timers[this.node.id] = new Timer(timeout)
                    
        //             let timer : Timer = this.runner.timers[this.node.id]

        //             // console.log("TIMER", timeout)
        //             // setTimeout(() => {console.log("TIMER WILL RUN")}, 1000)
        //             const timer_status = await timer.countDown()
        //             console.timeEnd(`Timer ${id}`)

        //             this.hasRun = true;
        //             this.isRunning = false;
        //             return timer_status;
                   
        //         }
        //         this.hasRun = true;
        //         this.isRunning = false;
        //         return true;

        //     default:
        //         this.hasRun = true;
        //         // this.isRunning = false;
        //         return;
        // }
    }

    async onExit(){
        // console.log(`Exiting node ${this.node.type} ${this.node.id}`)

        console.log("onExit", this.node);
		let action = this.actions.find((a) => a.id == this.blockType)

		await action?.onExit?.(this.node.options, {
			performOperation: this.process.performOperation,
			getState: this.process.getState,
			actions: this.actions
		}, this.process.getProcess)

		this.hasRun = false;
        console.log("onExitExit", this.node);

        // switch(this.blockType){
        //     case 'timer':
        //         if(this.runner.timers[this.node.id]) this.runner.timers[this.node.id].hasRun = false;
        //         this.hasRun = false;
        //         break;
        //     case 'sub-process':
        //         this.hasRun = false;
        //         break;
        //     case 'action':
        //         this.hasRun = false;
        //         break;
        //     default:
        //         this.hasRun = false;
        //         break;
        // }
    }

    // async performAction(){
    //     switch((this.node.options && this.node.type) || ''){
    //         case 'action':
    //             this.isRunning = true;
    //             let actions = this.node.options?.actions || [];
    //             let result = await Promise.all(actions.map(async (action : CommandProgramAction) => {

    //                 return await this.runner.performOperation(action.device, action.release || false, action.operation)
    //             }))
    //             // console.log("Action run")
    //             this.isRunning = false;
    //             this.hasRun = true;
    //             return result;
    //         case 'sub-process':
    //             this.hasRun = false;
    //             this.isRunning = true;
    //             let sub_p = this.process.sub_processes?.find((a) => a.id == this.node?.options?.["sub-process"])
    //             if(sub_p){
    //                 console.log(`Run sub-process ${sub_p.name}`)
    //                 let new_p = new Process(sub_p, this.actions, this.process)
    //                 const result = await new_p.runOnce()
    //                 this.hasRun = true;
    //                 this.isRunning = false;
    //                 return result;
    //             }
    //             break;
    //         case 'timer':
    //             // console.log("Timeout block")
    //             this.hasRun = false;
    //             this.isRunning = true;
    //             let timeout = parseInt(this.node.options?.timer)

    //             this.runner.timers[this.node.options?.timer] = new Timer(timeout)
                
    //             let timer : Timer = this.runner.timers[this.node.options?.timer]
    //             timer.hasRun = false;

    //             const timer_status = await timer.countDown()
    //             this.hasRun = true;
    //             this.isRunning = false;
    //             return timer_status;

    //             return await new Promise((resolve, reject) => {
    //                 console.log(`Waiting ${timeout}ms`)
    //                 setTimeout(() => {
    //                     this.isRunning = false;
    //                     resolve(true);
    //                 }, timeout)
    //             })
    //     }
    // }

}