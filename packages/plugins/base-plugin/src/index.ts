import {EventEmitter} from "events";

export interface PluginSubscriptionLock {
	id: number;
	result?: any;
}

export abstract class BasePlugin extends EventEmitter {
	public TAG : string = "BASE";

	constructor(){
		super()
	}

	async discover() : Promise<any[]> {
		return [];
	}

	async subscribe(bus: string): Promise<PluginSubscriptionLock | undefined> {
		return {id: -1}
	}

	async read(bus: string) : Promise<any[]> {
		return []
	}

	async write(bus: string | null, port: string, value: any) {
		
	}

}