import { CommandAction, Process, ProcessChain } from "@hive-command/process";

export const handler = async (options: any, hub: {actions: CommandAction[], performOperation: any, getState: any}) => {

	let process = new Process(options?.["sub-process"], hub.actions, hub.performOperation, hub.getState)

	await process.start()

	// this.isRunning = true;
                
	// let sub_process = this.process.sub_processes?.find((a) => a.id == this.node?.extras?.["sub-process"]);
	// if(sub_process){
	// 	let sub = new Process(sub_process, this.process)
		
	// 	if(priority) sub.requestPriority(priority);

	// 	const result = await sub.runOnce();
		
	// 	this.hasRun = true;
	// 	this.isRunning = false;
	// 	return result;
	// }
}