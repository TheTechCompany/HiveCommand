import { Mutex } from "locks";
import log from "loglevel";
import { CommandClient, CommandStateMachine } from "..";
import { Condition } from "@hive-command/process";
import { State } from "../State";
import { ConditionValueBank, ProgramDevice, ProgramInterlock } from "@hive-command/data-types";
import { getDeviceFunction } from "./actions";
import { getPluginClass } from "./plugins";

export class StateDevice {
	private device: ProgramDevice;
	
	private mutexLock?: Mutex;

	private lockOwner?: string;

	private controlled: boolean = true;

	private client: CommandClient;

	private fsm: CommandStateMachine;

	private plugins: {instance: any, actions?: {[key: string]: any}, _plugin: any}[] = [];

	private actions: {[key: string]: (state: any, setState: (state: any) => void, requestState: (state: any) => void) => Promise<any>} = {};

	private conditionValueBank : ConditionValueBank;

	constructor(device: ProgramDevice, fsm: CommandStateMachine, client: CommandClient, conditionValueBank: ConditionValueBank) {
		this.device = device;

		this.client = client;
		this.fsm = fsm;

		this.conditionValueBank = conditionValueBank;

		if(device.requiresMutex){
			this.mutexLock = new Mutex();
		}

		this.actions = (device.actions || []).reduce((prev, action) => {
			return {
				...prev,
				[action.key]: getDeviceFunction(action.func)
			}
		}, {})

		if(device.plugins && device.plugins.length > 0) console.log("Setting up plugins for ", device.name)

		let plugins = (device.plugins || []).map((plugin) => {
			const newClass = getPluginClass(plugin.classString, plugin.imports || [])
			let instance = new newClass(this, plugin.options)

			let actions = plugin.actions?.map((action) => ({
				[action.key]: instance[action.func]
			})).reduce((prev, curr) => ({...prev, ...curr}), {})

			return {
				instance: new newClass(this, plugin.options),
				actions: actions,
				_plugin: plugin
			}
		})

		// console.log({plugins})

		this.plugins = plugins //.map((x) => x.instance)
		
		let actions = plugins.map((x) => x.actions).reduce((prev, curr) => ({...prev, ...curr}), {})
		this.actions = {
			...this.actions,
			...actions
		}

		this.setState = this.setState.bind(this);
		this.requestState = this.requestState.bind(this);

		// console.log(this.actions)
	}

	//Give plugins a chance to gather data before starting
	//Overwrite device actions so they can be called
	// setupPlugins(){
	// 	this.device.plugins?.forEach(plugin => {
	// 		plugin.setup?.();
	// 	})
	// }

	get name(){
		return this.device.name;
	}

	get isControlled(){
		return this.controlled;
	}

	hasDataInterlock(key?: string){
		return this.device.dataInterlocks != undefined && this.device.dataInterlocks.length > 0 && (key && this.device.dataInterlocks.filter(a => a.deviceKey == key).length > 0);
	}

	get hasInterlock(){
		return this.device.interlock != undefined && this.device.interlock.locks.length > 0;
	}

	get requiresMutex(){
		return this.device.requiresMutex;
	}

	get state(){
		return this.fsm.state?.get(this.device.name)
	}

	get globalState(){
		return this.fsm.state
	}

	async performOperation(operation: string){

		let activePlugins = this.plugins.filter((plugin) => {
			if(plugin._plugin.activeWhen){
				return this.fsm.isActive(plugin._plugin.activeWhen)
			}else{
				return true
			}
		})

		//TODO dedupe identical plugins and use highest priority (most conditions met)

		// console.log({activePlugins: activePlugins.map((x) => x._plugin.activeWhen)})
		
		let pluginActions = activePlugins.reduce((prev, curr) => ({
			...prev,
			...curr.actions
		}), {})

		let actions : {[key: string]: any} = {
			...this.actions,
			...pluginActions
		}

		log.debug("Device actions", {actions, action: actions[operation]})

		if(actions[operation]){
			return await actions[operation](this.state, this.setState, this.requestState)
		}else {
			console.error(`Operation ${operation} not found on ${this.name}`)
		}
		// return await this.client.performOperation({device: this.device.name, operation})
	}

	async setState(state: any){
		log.debug("DEVICE - setState", {state})
		await this.fsm.state?.update(this.device.name, state)
	}

	async requestState(state: any){
		// log.debug("DEVICE - requestState", {state})
		await this.client.requestState({device: this.device.name, state})
	}

	changeControlled(controlled: boolean){
		this.controlled = controlled;
	}

	checkInterlockNeeded(currentState: any){
		let device = this.device.name
		let desiredState = this.device.interlock?.state 

		// console.log(desiredState, currentState)
		let exists = true;

		if(!this.isControlled) return exists;
		
		// console.log("Checking interlock", {device, desiredState, currentState})
		for(var k in desiredState){
			if(`${currentState?.[k]}` !== `${desiredState?.[k]}`){
				exists = false;
				break;
			}
		}
		return exists
	}


	get interlock () {
		return this.device.interlock?.locks
	}

	/*
		key: -[false breaks]->(OPC)

		true return = dont send data
		false return = send data
	*/
	checkDataInterlocks(state: State, key: string){
		let locks = this.device.dataInterlocks?.filter((a) => a.deviceKey == key) || [];

		// console.log(`Checking ${locks.length} data-locks for ${this.device.name} ${key}`);

		const lockedUp = locks.map((lock) => {
			const condition = new Condition({
				inputDevice: lock.inputDevice,
				inputDeviceKey: lock.inputDeviceKey,
				assertion: lock.assertion,
				comparator: lock.comparator
			})

			const input = state?.getByKey(lock.inputDevice, lock.inputDeviceKey);

			return condition.check(input);
		})

		return lockedUp.includes(false);
	}

	async checkInterlock(state: State){
		let locks = this.device.interlock?.locks || [];
			
		const lockedUp = await Promise.all(locks.map((lock) => {

			const condition = new Condition({
				inputDevice: lock.inputDevice,
				inputDeviceKey: lock.inputDeviceKey,
				assertion: lock.assertion,
				comparator: lock.comparator
			}, this.conditionValueBank)

			const input = state?.getByKey(lock.inputDevice, lock.inputDeviceKey);

			return condition.check(input)
			// return this.checkCondition(state, lock.device, lock.deviceKey, lock.comparator, lock.value)

		}))

		const locked = lockedUp.includes(false);

		// console.log(state, this.device.name, locked)

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


	async doFallback(lock: ProgramInterlock){
		// await this.device.interlock?.locfallback.map(async (operation) => {
			await this.performOperation?.(lock.action)
		// })
	}
}