import { nanoid } from "nanoid";
import { Process } from "..";
import { EventEmitter } from 'events'
import { CommandProgramAction, ProcessAction } from "../action";
import { Transition } from "../transition";
import log from 'loglevel'
import {
  CommandAction,
  CommandProcess,
  CommandProcessEdge,
  CommandProcessNode,
} from "../types";

export interface ProcessChainDescriptor {
  id: string;
  links?: ProcessChainDescriptor[];
}

export class ProcessChain extends EventEmitter {
  private id: string = nanoid();
  private process: Process;

  private program: CommandProcess;

  private current: ProcessAction[] = [];
  // private current: string[]

  // private current_run: boolean[];

  // private current_running: string[];

  private action_types: CommandAction[] = [];

  private actions: ProcessAction[] = [];
  private transitions: Transition[] = [];

  constructor(
    process: Process,
    chain: CommandProcess,
    entry: string,
    actions?: CommandAction[]
  ) {
	  super()
    this.program = chain;
    this.process = process;

    console.log(JSON.stringify(this.program.edges))

    this.action_types = actions || [];

    // console.log(this.program, {process: this.process})

    this.actions =
      chain.nodes?.map((node) => {
        return new ProcessAction(node, this, this.action_types);
      }) || [];

    this.transitions =
      chain.edges?.map((edge) => {
        return new Transition(edge);
      }) || [];

    let entryNode = this.actions?.find((a) => a.id == entry);

    this.current = entryNode ? [entryNode] : [];

    // this.current_running = []
    // this.current_run = [false]

    this.getState = this.getState.bind(this);
    this.performOperation = this.performOperation.bind(this);
  }
  
  get getId(){
	  return this.id
  }

  get pid() {
    return this.process.id;
  }

  get getProcess(){
	  return this.process
  }

  get currentActions(){
    return this.current
  }

  async performOperation(device: string, release: boolean, operation: string) {
    await this.process.performOperation(device, release, operation);
  }

  getState(key: string) {
    console.log({prc: this.process})
    this.process.getState(key);
  }

  changePosition(current: string[]) {
    // this.current = current
  }

  async run() {
    await new Promise(async (resolve, reject) => {
      let current_actions = this.current;

      if (current_actions.length > 0) {
        await Promise.all(
          current_actions.map(async (action, ix) => {
            let hasRun = action.hasRun; // this.current_run[ix];
            let isRunning = action.isRunning; //this.current_running.indexOf(action.id) > -1;

            let act = this.actions.find((a) => a.id == action.id);
            if (act && !hasRun && !isRunning) {
              //Prioritize

			//   this.emit('transition', {from: action.id, to: act.id})
              await act.onEnter();

              // await act.onExit()

            }
          })
        );

        resolve(true);
      } else {
        resolve(false);
      }
    });
  }

  next() {
    let status = this.current.forEach((x, ix) => {
      const next = this.checkNext(x.id);

      // log.debug({next})
      let priority = next
        .filter((a) => a.value)
        .sort((a, b) => b.conds - a.conds);

      let hasRun = x.hasRun;
      let isRunning = x.isRunning;
      // log.debug("NEW ITEM PRE", {hasRun, isRunning, priority});

      if (hasRun && !isRunning && priority.length > 0) {
        // log.debug("NEW ITEM PRE");

        // console.log({priority})
        let old = this.current.filter((a) => a.id == x.id)

        Promise.all(old.map(async (old_item) => await old_item.onExit()))

        this.current = this.current.filter((a) => a.id != x.id);
        // this.current.splice(ix, 1)

        let newItem = this.actions.find((a) => a.id == priority[0].target);
        if (newItem) {
          // log.debug("NEW ITEM");
		      this.emit('transition', {from: x.id, to: newItem.id})

          this.current.push(newItem);
        }

        // if(priority[0].target) this.current[ix] = priority[0].target

        // this.process.updateState(this.id, x)
      }
    });
  }

  checkNext(id: string) {
    let next = this.getNext(id);

    let results = next.map((next_id: string) => {
      let transition = this.transitions.find((a) => a.source == id && a.target == next_id);

      let conds = transition?.conditions || [];

      let output_conds: any[] = [];

      let truthy = true;

      conds.forEach((cond) => {
        //Get input value from value bank valueBank[input][inputKey]
        // console.log(this.parent.state.get(cond.input_id), cond.input_key)
        // console.log(this.parent.state.get(cond.input_id), this.parent.state)

        let input = this.process.getState(cond.input_id)?.[cond.input_key];

        const inputValue = `${input}`;

        let checkValue = `${cond.value_id}`;

        // console.log(input, inputValue, checkValue)

        if (!cond.check(inputValue, checkValue)) {
          truthy = false;
        }

        output_conds.push({
          cond: cond,
          value: truthy,
          inputValue,
          checkValue,
          value_id: cond.value_id,
        });
      });

      return {
        target: transition?.target,
        value: truthy,
        conds: conds.length,
        output_conds,
      };
    });
    return results;
  }

  getNext(id: string) {
    return (
      this.program.edges?.filter((a) => a.source == id).map((x) => x.target) ||
      []
    );
  }

  hasRun() {
    // console.log(this.current.map((x) => ({id: x.id, hasRun: x.hasRun})))
    return this.current.map((x) => x.hasRun).indexOf(false) < 0;
  }

  isRunning() {
    return !(this.current.map((x) => x.isRunning).indexOf(true) < 0);
  }

  hasNext() {
    return (
      this.current
        .map((x) => (this.getNext(x.id) || []).length > 0 && !this.hasRun())
        .indexOf(true) > -1
    );
  }

  shouldRun() {
    const isRunning = this.isRunning();
    const hasRun = this.hasRun();

    const runs = this.current.map((x) => {
      let next = (this.getNext(x.id) || [])
      let hasNext = next.length > 0;

      return hasNext || !hasRun || isRunning;
    });

    return runs.indexOf(true) > -1;
  }
}
