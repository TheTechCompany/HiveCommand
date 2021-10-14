export class CommandStateMachine {

	private values : {[key: string]: any} = {};

	constructor(){
		
	}

	registerValue(key: string, value: any){
		this.values[key] = value;
	}

	getValue(key: string){
		return this.values[key]
	}
}