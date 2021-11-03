import { CommandStateMachine } from "..";
import { IOProcess } from "../Process";
import { Timer } from "../Timer";
import { ProcessNode } from "../types/ProcessLink";
import { ProgramAction } from "../types/ProgramProcess";

export class Action {

    public id: string;

    private process: IOProcess;
    private node: ProcessNode;

    private runner: CommandStateMachine;
    
    public hasRun: boolean = false;
    public isRunning: boolean = false;

    constructor(node: ProcessNode, process: IOProcess, runner: CommandStateMachine){
        this.node = node
        this.id = this.node.id;
        this.process = process;
        
        this.runner = runner;
    
        if(!this.node.extras || !this.node.extras.blockType){
            this.hasRun = true;
        }
    }

    get blockType(){
        return (this.node.extras && this.node.extras.blockType) || '';
    }

    async onEnter(){
        console.log(`Entering node ${this.node.extras?.blockType} ${this.node.id} ${this.process.name}`)

        switch(this.blockType){
            case 'action':
                this.isRunning = true;

                let actions = this.node.extras?.actions || [];
                let result = await Promise.all(actions.map((async (action: ProgramAction) => {
					
                    return await this.runner.performOperation(action.device, action.operation)
                })))

                this.isRunning = false;
                this.hasRun = true;
                return result;
            case 'sub-process':
                this.isRunning = true;
                
                let sub_process = this.process.sub_processes?.find((a) => a.id == this.node?.extras?.["sub-process"]);
                if(sub_process){
                    let sub = new IOProcess(sub_process, this.runner, this.process)
                    const result = await sub.runOnce();
                    this.hasRun = true;
                    this.isRunning = false;
                    return result;
                }
            break;
            case 'timer':
                this.isRunning = true;
                
                let timeout = parseInt(this.process.templateValue(this.node.extras?.timer))
                 
                this.runner.timers[this.node.id] = new Timer(timeout)
                
                let timer : Timer = this.runner.timers[this.node.id]

                setTimeout(() => {console.log("TIMER HAS RUN")}, timeout)
                const timer_status = await timer.countDown()
                this.hasRun = true;
                this.isRunning = false;
                return timer_status;
            default:
                return;
        }
    }

    async onExit(){
        console.log(`Exiting node ${this.node.extras?.blockType} ${this.node.id}`)
        switch(this.blockType){
            case 'timer':
                this.runner.timers[this.node.id].hasRun = false;
                this.hasRun = false;
                break;
            case 'sub-process':
                this.hasRun = false;
                break;
            case 'action':
                this.hasRun = false;
                break;
            default:
                break;
        }
    }

    async performAction(){
        switch((this.node.extras && this.node.extras.blockType) || ''){
            case 'action':
                this.isRunning = true;
                let actions = this.node.extras?.actions || [];
                let result = await Promise.all(actions.map(async (action : ProgramAction) => {

                    return await this.runner.performOperation(action.device, action.operation)
                }))
                this.isRunning = false;
                this.hasRun = true;
                return result;
            case 'sub-process':
                this.hasRun = false;
                this.isRunning = true;
                let sub_p = this.process.sub_processes?.find((a) => a.id == this.node?.extras?.["sub-process"])
                if(sub_p){
                    console.log(`Run sub-process ${sub_p.name}`)
                    let new_p = new IOProcess(sub_p, this.runner, this.process)
                    const result = await new_p.runOnce()
                    this.hasRun = true;
                    this.isRunning = false;
                    return result;
                }
                break;
            case 'timer':
                console.log("Timeout block")
                this.hasRun = false;
                this.isRunning = true;
                let timeout = parseInt(this.process.templateValue(this.node.extras?.timer))

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