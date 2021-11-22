import { Mutex } from "locks";
import { Condition } from "../Condition";
import { ProgramDevice } from "../types/ProgramDevice";

export class StateDevice {
	private device: ProgramDevice;
	
	private mutexLock?: Mutex;

	private lockOwner?: string;

	constructor(device: ProgramDevice) {
		this.device = device;

		if(device.requiresMutex){
			this.mutexLock = new Mutex();
		}
	}

	get name(){
		return this.device.name;
	}

	get hasInterlock(){
		return this.device.interlock != undefined;
	}

	get requiresMutex(){
		return this.device.requiresMutex;
	}

	checkInterlockNeeded(currentState: any){
		let device = this.device.name
		let desiredState = this.device.interlock?.state 

		console.log(desiredState, currentState)
		let exists = true;
		for(var k in desiredState){
			if(currentState?.[k] !== desiredState?.[k]){
				exists = false;
				break;
			}
		}
		return exists
	}

	checkCondition(state: any, device: string, deviceKey: string, comparator: string, value: any){
		let cond = new Condition({input: device, inputKey: deviceKey, comparator, value})
		let input = state?.[deviceKey]
		return cond.check(input, value)
	}

	get interlock () {
		return this.device.interlock?.locks
	}

	async checkInterlock(state: any){
		let locks = this.device.interlock?.locks || [];
			
		const lockedUp = await Promise.all(locks.map((lock) => {
			return this.checkCondition(state, lock.device, lock.deviceKey, lock.comparator, lock.value)

		}))

		const locked = lockedUp.includes(false);

		return {locked, lock: locks[lockedUp.indexOf(false)]};
	}

	async lock(){
		await new Promise((resolve, reject) => {
			this.mutexLock!.lock(() => {
				// this.lockOwner = process;
				resolve(true)
			});	
		})
	}

	async unlock(){
		await new Promise((resolve, reject) => {
			// if(this.lockOwner == process){
				this.mutexLock?.unlock()
				resolve(true)
			// }else{
				// reject(new Error("Not lock owner"))
			// }
		})
	}


	async doFallback(lock: any, performOperation: (device: string, release: boolean, operation: string) => void){
		// await this.device.interlock?.locfallback.map(async (operation) => {
			await performOperation?.(this.device.name, false, lock.fallback)
		// })
	}
}