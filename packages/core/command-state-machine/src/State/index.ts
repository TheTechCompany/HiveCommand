export class State {

	private internalState: {
		[key: string]: {
			[key: string]: any
		}
	};

	constructor(state?: {[key: string]: any}) {
		this.internalState = state || {};
		
		this.update = this.update.bind(this);
		this.get = this.get.bind(this);
		this.getByKey = this.getByKey.bind(this);
	}

	public get(key: string): any {
		return this.internalState?.[key]
	}	

	public getByKey(key: string, subKey: string): any {
		return this.internalState?.[key]?.[subKey];
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
	}
}