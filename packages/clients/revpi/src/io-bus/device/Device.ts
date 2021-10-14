import { ConstantStatusCode, DataType, Variant } from "node-opcua";

export interface DeviceDatapoint{
	static?: boolean;
	name: string
	type: DataType
	get?: () => Variant | ConstantStatusCode
}
export abstract class Device {

	public name: string;
	public port: number;
	
	public value: any;
	public datapoints?: DeviceDatapoint[];

	constructor(name: string, port: number, datapoints?: DeviceDatapoint[]){
		this.name = name;
		this.port = port;
		this.datapoints = datapoints || []
	}

	registerValue(value: any){
		this.value = value;
	}
}