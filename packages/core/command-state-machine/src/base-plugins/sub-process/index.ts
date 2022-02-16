import { CommandAction, Process, ProcessChain } from "@hive-command/process";
import { ProgramProcess } from "../../types";

export const handler = async (
	options: any, 
	hub: {actions: CommandAction[], performOperation: any, getState: any},
	node: ProgramProcess
) => {

	let sub_process = node.sub_processes?.find((a) => a.id == options?.["sub-process"])
	console.log({sub_process, hub})

	const val = hub.getState('TK201')
	console.log({val})
	
	let promise;
	let process: Process;

	if(sub_process){

		process = new Process(sub_process, hub.actions, hub.performOperation, hub.getState)

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