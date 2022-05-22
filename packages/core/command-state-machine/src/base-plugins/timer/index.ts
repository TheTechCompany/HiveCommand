import { ProgramTimer } from "@hive-command/data-types";
import { nanoid } from "nanoid";
import { Timer } from "./Timer";

export const handler = async (options: {timer: ProgramTimer}) => {
	
	let id = nanoid();

	let timeoutStep = 0;
	switch(options.timer.unit){
		case 'seconds':
			timeoutStep = 1000;
			break;
		case 'minutes':
			timeoutStep = 60 * 1000;
			break;
		case 'hours':
			timeoutStep = 60 * 60 * 1000;
			break;
	}
	let timeoutValue = parseFloat(options.timer.value) * timeoutStep;

	
	// if(!isPrioritized || priority == this.node.id || priority == this.process.id){

		
	let timer : Timer =  new Timer(timeoutValue)

	const timer_status = timer.countDown()


		
	return {
		promise: (async () => {
			console.time(`Timer ${id}`)
			await timer_status
			console.timeEnd(`Timer ${id}`)
		})(),
		cancel: () => timer.stop()
	}
	// 	return timer_status;
	   
	
	// // this.hasRun = true;
	// // this.isRunning = false;
	// return true;
}