export class ValueBank { 

	private values: {[key: string]: {port: string, value: any}[]} = {};

	constructor(){

	}

	get(id: string, port: string){
		return this.values?.[id].find((a) => a.port == port)?.value;
	}

	setMany(id: string, values: {port: string, value: string}[]){
		values.forEach((value) => {
			this.set(id, value.port, value.value)
		})
	}

	set(id: string, port: string, value: any){
		if(!this.values[id]) this.values[id] = [];
		let bus = this.values[id]
		let ix = bus.map((x) => x.port).indexOf(port)
		if(ix > -1){
			this.values[id][ix].value= value;
		}else{
			this.values[id].push({port: port, value: value})
		}
	}
}