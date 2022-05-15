import { Process, ProcessChain } from "@hive-command/process";
import { ProgramProcess, CommandAction, CommandProcess } from "@hive-command/data-types";

export const handler = async (
	options: any, 
	hub: {actions: CommandAction[], performOperation: any, getState: any, setState: any, getVariable: any},
	node: CommandProcess
) => {

	let sub_process = node.sub_processes?.find((a) => a.id == options?.["sub-process"])
	
	let promise;
	let process: Process;

	if(sub_process){

		process = new Process(sub_process, hub.actions, hub.performOperation, hub.getState, hub.setState, hub.getVariable)

		process.on('transition', (transition) => {
			console.log("Subprocess transition", transition)
		})

		promise = process.start()
	}


	return {
		promise,
		cancel: () => process.stop()
	}

}