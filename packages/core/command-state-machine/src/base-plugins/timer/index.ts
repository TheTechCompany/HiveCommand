import { nanoid } from "nanoid";
import { Timer } from "./Timer";

export const handler = async (options: {timer: string}) => {
	
	let id = nanoid();

	let timeout = parseInt(options.timer)

	
	// if(!isPrioritized || priority == this.node.id || priority == this.process.id){

	console.time(`Timer ${id}`)
		
	let timer : Timer =  new Timer(timeout)

	const timer_status = timer.countDown()

	console.timeEnd(`Timer ${id}`)

		
	return {
		promise: timer_status,
		cancel: () => timer.stop()
	}
	// 	return timer_status;
	   
	
	// // this.hasRun = true;
	// // this.isRunning = false;
	// return true;
}