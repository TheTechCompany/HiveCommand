export class State {

	private internalState: {
		[key: string]: {
			[key: string]: any
		}
	};

	constructor(state?: {[key: string]: any}) {
		this.internalState = state || {};
	}

	public get(key: string): any {
		return this.internalState?.[key]
	}	

	public getByKey(key: string, subKey: string): any {
		// console.log("GET BY KEY", key, subKey, this.internalState[key]);
		return this.internalState?.[key]?.[subKey];
	}	

	public update(key: string, value: any): void {
		if(typeof(value) == "object"){
			this.internalState[key] = {
				...this.internalState[key],
				...value
			}
		}else{
			this.internalState[key] = value;
		}
	}
}