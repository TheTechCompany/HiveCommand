import { CommandStateMachine } from "..";
import { Action } from "../Action";
import { Transition } from "../Transition";
import doT from 'dot';
import EventEmitter from "events";
import { ProgramProcess } from "../types/ProgramProcess";

export class IOProcess extends EventEmitter{
    private process : ProgramProcess;
    
    private parent: CommandStateMachine;

    private parent_process?: IOProcess;

    private actions : Action[] = [];

    public current_state: string;

    private current_isRunning: boolean = false;
    private current_hasRun: boolean = false;

    public running: boolean = false;

    private prioritize?: string; //Node id to prioritize reaching

    constructor(process: ProgramProcess, parent: CommandStateMachine, parent_process?: IOProcess){
        super();
        this.parent = parent
        this.parent_process = parent_process;

        this.process = process
        this.current_state = 'origin';

        this.actions = this.action_nodes
    }

    get parentId(){
        return this.parent_process?.id
    }

    get id(){
        return this.process.id
    }

    get name(){
        return this.process.id
    }
    
    get sub_processes(){
        return this.process.sub_processes
    }

    get action_nodes(){
        let nodes = this.process.nodes
        if(nodes){
            return Object.keys(nodes).map((x) => new Action(nodes[x], this, this.parent))
        }
        return [];
    }

    get currentPosition(){
        return this.actions.find((a) => a.id == this.current_state)?.actionId
    }

    requestPriority(id: string){
        if(this.current_state == id) return;
        console.log("Requesting priority: ", id)
        let current_action = this.actions.find((a) => a.id == this.current_state)
        if(current_action){
            current_action.requestPriority(id)
        }   

        this.prioritize = id;
    }

    doCurrent() : Promise<boolean>{
        return new Promise((resolve, reject) => {
            let current_action = this.actions.find((a) => a.id == this.current_state)
			// console.log(current_action, this.actions, this.current_state)
            if(current_action){
                if(!current_action.hasRun && !current_action.isRunning){
                    // let priority = this.prioritize;
                    if(this.prioritize == this.process.nodes[this.current_state]?.extras?.["sub-process"]){
                        this.prioritize = undefined;
                    }
                    // console.log(this.process.nodes[this.current_state].extras?.["sub-process"])

                    current_action.onEnter(this.prioritize).then((result) => {
                        console.log(this.current_state, this.process.name, this.prioritize)
                       
                        // console.log(`Process: ${this.process.name} run ${this.current_state}`)
                        // if(this.process.nodes[this.current_state].extras?.["sub-process"] == this.prioritize){
                        //     // console.log("De prioritize")
                        //     this.prioritize = undefined;
    
                        // }
                        resolve(true);
                    });
             

                }
            }else{
                resolve(false);
            }
        })
      //  return false;
    }

    moveNext(){
        let nextSteps = this.checkNext();

        let sortedSteps = nextSteps.filter((a) => a.value).sort((a, b) => b.conds - a.conds)
        
        let current_action = this.actions.find((a) => a.id == this.current_state)

        // console.log("MOVE NEXT", current_action, current_action?.hasRun, sortedSteps)
        if((!current_action || current_action.hasRun) && sortedSteps.length > 0){ //!current_action || current_hasRun
            if(current_action) {
                // console.log(current_action.blockType)
                current_action.onExit();
            }

            this.current_state = sortedSteps[0].target;
            this.current_hasRun = false;
            this.current_isRunning = false;

            this.emit('transition', {target: sortedSteps[0].target})

            this.parent.updateState(this.process.id, this.current_state)
            return true;
        }
        return false;
    }

    async start(){
        console.info(`Process: ${this.process.name} start`)
        let origin = this.startPoint;

        this.running = true;
        while(this.running){

            /*
                Get current_state node
                -> if hasRun == false : execute action
                    -> action == action : run
                    -> action == sub-process : run sub-process 
                
                -> check transition until truthy return
            */

            let current_action = this.actions.find((a) => a.id == this.current_state);

            if(current_action){
                if(!this.current_hasRun){
                    console.info(`Process: ${this.process.name} run ${current_action.id}`)
                     const result = await current_action.performAction()
                    this.current_hasRun = true;
                }

            }

            let current_node = this.process.nodes?.[this.current_state];
 
            let next = this.checkNext();
         //   console.log(next)
            let priority = next.filter((a) => a.value).sort((a, b) => b.conds - a.conds)

            if((!current_action || current_action.hasRun) && priority.length > 0){
                console.log("Transition to: ", priority[0].target)
                this.current_state = priority[0].target
                this.current_hasRun = false;

                this.parent.updateState(this.process.id, this.current_state)
            }
        }
    }

    async runOnce(){
        let origin = this.startPoint;

        let finish : any = () => {};
        let finished = false;

        let resolver = new Promise((resolve) => finish = resolve)

        this.actions.forEach((action) => {

            action.hasRun = false;
        })

        await new Promise((resolve) => {
            this.parent.on('TICK', async () => {
                if(this.hasNext() || !finished){

                    await this.doCurrent();


                    await this.moveNext();

                    if(!this.hasNext()){
                        resolve(true)
                        finished = true;
                    }

                    // let action = this.actions.find((a) => a.id == this.current_state);
                    // if(action){
                    //     if(!action.hasRun && !action.isRunning){
                    //         await action.onEnter();
                    //     }
                    // }
        
                    // let next = this.checkNext();
        
                    // let priority = next.filter((a) => a.value).sort((a, b) => b.conds - a.conds);
                    // if((!action || action.hasRun) && priority.length > 0){
                    //     await action?.onExit()
        
                    //     this.current_state = next[0].target
        
                    //     this.parent.updateState(this.process.id, this.current_state, this.parent_process?.process.id)
        
                    // }
                    
                    // if(priority.length == 0){
                    //     resolve(true);
                    //     finished = true;
                    // }
                }
            })
        })
       
        console.log("Done")
    }

    stop(){
        this.running = false;
    }


    hasNext(){
        let next = this.nextPoints(this.current_state)
        return next.length > 0
    }

    templateValue(template?: string){
        let iT = doT.template(template || '')
        return iT({
            // io: this.parent.device_bus?.getAll(),
            // flags: {
            //     "SHUTDOWN_UF": false,
            //     "SOAK_UF": false
            // },
            // timers: this.parent.getTimers(),
            // vars: this.parent.variables
        })
    }

    checkNext(){
        let next = this.nextPoints(this.current_state);

        let results = next.map((transition) =>{
            let conds = transition.conditions || [];

            let output_conds : any[] = [];

            let truthy = true;
            conds.forEach((cond) => {  

                //Get input value from value bank valueBank[input][inputKey]
                // console.log(this.parent.state.get(cond.input_id), cond.input_key)
                // console.log(this.parent.state.get(cond.input_id), this.parent.state)

                let input = this.parent.state.get(cond.input_id)?.[cond.input_key]
                const inputValue = this.templateValue(`${input}`)
            
                let checkValue = this.templateValue(cond.value_id)

                if(!cond.check(inputValue, checkValue)){
                    truthy = false;
                }

                output_conds.push({cond: cond, value: truthy, inputValue, checkValue, value_id: cond.value_id})
            })
            return {target: transition.target, value: truthy, conds: conds.length, output_conds};
        })
        return results;
    }

    get startPoint(){
        return this.process.nodes?.["origin"]
    }

    nextPoints(current: string){
        let points : Transition[] = [];
        // console.log(this.process.links, current)
        Object.keys(this.process.links || {}).forEach((key) => {
            if(this.process.links?.[key].source == current){
                points.push(new Transition(this.process.links?.[key]))
            }
        })
        return points;
    }
}