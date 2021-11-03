import { EventEmitter } from "events";

export class BusMap extends EventEmitter{ 

	private values: {[key: string]: {port: string, value: any}[]} = {};

	private requests: {[key: string]: {port: string, value: any}[]} = {};

	private lastValues : {[key: string]: {port: string, value: any}[]} = {};

	constructor(){
		super();
		this.request = this.request.bind(this);
		this.get = this.get.bind(this)
		this.set = this.set.bind(this);
		this.setMany = this.setMany.bind(this);
	}

	getChanged(){
		let changed = {};
		//Check this.values for different bus-port value combos
		//Add changed to diff object
		//Reset lastValues

		this.lastValues = this.values;
	}

	get(id: string, port: string){
		return this.values?.[`${id}`]?.find((a) => `${a.port}` == `${port}`)?.value;
	}

	request(id: string, port: string, value: any){
		console.log("REQ", id, port, value)
		
		port = `${port}`

		if(!this.requests[id]) this.requests[id] = [];
		let bus = this.requests[id]
		let ix = bus.map((x) => x.port).indexOf(port)
		if(ix > -1){
			if(typeof(value) == "object"){
				this.requests[id][ix].value = {
					...this.requests[id][ix].value,
					...value,
				}
			}else{
				this.requests[id][ix].value = value;
			}
		}else{
			this.requests[id].push({port: port, value: value})
		}
	}

	setMany(id: string, values: {port: string, value: string}[]){
		values.forEach((value) => {
			this.set(id, value.port, value.value)
		})
	}

	set(id: string, port: string, value: any){
		port = `${port}`

		if(!this.values[id]) this.values[id] = [];
		let bus = this.values[id]
		let ix = bus.map((x) => x.port).indexOf(port)
		if(ix > -1){
			if(typeof(value) == "object"){
				this.values[id][ix].value = {
					...this.values[id][ix].value,
					...value,
				}
			}else{
				this.values[id][ix].value = value;
			}
		}else{
			this.values[id].push({port: port, value: value})
		}
	}
}