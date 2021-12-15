import { Process } from "@hive-command/process";
import { nanoid } from "nanoid";
import { CommandStateMachine } from "..";
import { Timer } from "../Timer";
import { ProcessNode } from "../types/ProcessLink";
import { ProgramAction } from "../types/ProgramProcess";

export class Action {

    public id: string;

    private process: Process;
    private node: ProcessNode;

    private runner: CommandStateMachine;
    
    public hasRun: boolean = false;
    public isRunning: boolean = false;

    private prioritize?: string;

    constructor(node: ProcessNode, process: Process, runner: CommandStateMachine){
        this.node = node
        this.id = this.node.id;
        this.process = process;
        
        this.runner = runner;
    
        if(!this.node.extras || !this.node.extras.blockType){
            this.hasRun = true;
        }
    }

    get actionId(){
        return this.node?.extras?.["sub-process"]
    }

    get blockType(){
        return (this.node.extras && this.node.extras.blockType) || '';
    }

    requestPriority(id?: string){

    }

    async onEnter(priority?: string){
        console.log(`Entering node ${this.node.extras?.blockType} ${this.node.id} ${this.process.name}`)

        let isPrioritized = priority != undefined; //&& priority == this.node.id;

        // console.log("isPrioritize", isPrioritized, priority)
        switch(this.blockType){
            case 'action':
                this.isRunning = true;

                let actions = this.node.extras?.actions || [];

                let result = await Promise.all(actions.map((async (action: ProgramAction) => {
                    return await this.runner.performOperation(action.device, action.release || false, action.operation)
                })))

                this.isRunning = false;
                this.hasRun = true;
                return result;
            case 'sub-process':
                this.isRunning = true;
                
                let sub_process = this.process.sub_processes?.find((a) => a.id == this.node?.extras?.["sub-process"]);
                if(sub_process){
                    let sub = new Process(sub_process, this.process)
                    
                    if(priority) sub.requestPriority(priority);

                    const result = await sub.runOnce();
                    
                    this.hasRun = true;
                    this.isRunning = false;
                    return result;
                }
            break;
            case 'timer':
                if(!isPrioritized || priority == this.node.id || priority == this.process.id){
                    this.isRunning = true;
                    let id = nanoid();

                    console.time(`Timer ${id}`)
                    
                    let timeout = parseInt(this.node.extras?.timer)
                    
                    this.runner.timers[this.node.id] = new Timer(timeout)
                    
                    let timer : Timer = this.runner.timers[this.node.id]

                    // console.log("TIMER", timeout)
                    // setTimeout(() => {console.log("TIMER WILL RUN")}, 1000)
                    const timer_status = await timer.countDown()
                    console.timeEnd(`Timer ${id}`)

                    this.hasRun = true;
                    this.isRunning = false;
                    return timer_status;
                   
                }
                this.hasRun = true;
                this.isRunning = false;
                return true;

            default:
                this.hasRun = true;
                // this.isRunning = false;
                return;
        }
    }

    async onExit(){
        console.log(`Exiting node ${this.node.extras?.blockType} ${this.node.id} ${this.process.name}`)
        switch(this.blockType){
            case 'timer':
                if(this.runner.timers[this.node.id]) this.runner.timers[this.node.id].hasRun = false;
                this.hasRun = false;
                break;
            case 'sub-process':
                this.hasRun = false;
                break;
            case 'action':
                this.hasRun = false;
                break;
            default:
                this.hasRun = false;
                break;
        }
    }

    async performAction(){
        switch((this.node.extras && this.node.extras.blockType) || ''){
            case 'action':
                this.isRunning = true;
                let actions = this.node.extras?.actions || [];
                let result = await Promise.all(actions.map(async (action : ProgramAction) => {

                    return await this.runner.performOperation(action.device, action.release || false, action.operation)
                }))
                // console.log("Action run")
                this.isRunning = false;
                this.hasRun = true;
                return result;
            case 'sub-process':
                this.hasRun = false;
                this.isRunning = true;
                let sub_p = this.process.sub_processes?.find((a) => a.id == this.node?.extras?.["sub-process"])
                if(sub_p){
                    console.log(`Run sub-process ${sub_p.name}`)
                    let new_p = new Process(sub_p, this.process)
                    const result = await new_p.runOnce()
                    this.hasRun = true;
                    this.isRunning = false;
                    return result;
                }
                break;
            case 'timer':
                // console.log("Timeout block")
                this.hasRun = false;
                this.isRunning = true;
                let timeout = parseInt(this.node.extras?.timer)

                this.runner.timers[this.node.extras?.timer] = new Timer(timeout)
                
                let timer : Timer = this.runner.timers[this.node.extras?.timer]
                timer.hasRun = false;

                const timer_status = await timer.countDown()
                this.hasRun = true;
                this.isRunning = false;
                return timer_status;

                return await new Promise((resolve, reject) => {
                    console.log(`Waiting ${timeout}ms`)
                    setTimeout(() => {
                        this.isRunning = false;
                        resolve(true);
                    }, timeout)
                })
        }
    }

}