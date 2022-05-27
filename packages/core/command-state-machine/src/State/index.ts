import { EventEmitter } from 'events'
import { CommandStateMachine } from '..';

export class State extends EventEmitter {

	private internalState: {
		[key: string]: {
			[key: string]: any
		}
	};

	private machine: CommandStateMachine;

	constructor(machine: CommandStateMachine, state?: {[key: string]: any}) {
		super();
		
		this.machine = machine;
		
		this.internalState = state || {};
		
		this.update = this.update.bind(this);
		this.get = this.get.bind(this);
		this.getByKey = this.getByKey.bind(this);
	}

	public get(key: string): any {
		return this.internalState?.[key]
	}	

	public getByKey(key: string, subKey: string): any {
		if(!this.machine.checkDataInterlocks(key, subKey)){
			return this.get(key)?.[subKey] || 0;
		}else{
			return 0;
		}
	}	

	public update(key: string, value: any): void {
		// console.log("UPdate BY KEY", key, value, this.internalState)
		if(typeof(value) == "object"){
			this.internalState[key] = {
				...this.internalState[key],
				...value
			}
		}else{
			this.internalState[key] = value;
		}

		this.emit(`${key}:changed`, this.internalState[key])
	}
}