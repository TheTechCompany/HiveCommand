import { nanoid } from "nanoid";
import { Timer } from "./Timer";

export const handler = async (options: {timer: string}) => {
	
	let id = nanoid();

	let timeout = parseInt(options.timer)

	
	// if(!isPrioritized || priority == this.node.id || priority == this.process.id){

		
	let timer : Timer =  new Timer(timeout)

	const timer_status = timer.countDown()


		
	return {
		promise: async () => {
			console.time(`Timer ${id}`)
			await timer_status
			console.timeEnd(`Timer ${id}`)
		},
		cancel: () => timer.stop()
	}
	// 	return timer_status;
	   
	
	// // this.hasRun = true;
	// // this.isRunning = false;
	// return true;
}