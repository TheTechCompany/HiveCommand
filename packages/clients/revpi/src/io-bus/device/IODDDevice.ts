import { createFilter, IODD, IODDFilter } from "@io-link/iodd";
import { DataType, StatusCodes, Variant } from "node-opcua";
import { Device } from "./Device";

export class IODDDevice extends Device {

	private iodd: IODD;
	private filter: IODDFilter;

	private serial: string;
	private product: string;

	public value: any;

	constructor(name: string, port: number, device: any, iodd: IODD){

		let datapoints = iodd.function.features.map((feat) => {
			return feat.struct
		}).reduce((prev, curr) => prev.concat(curr), []).map((point, ix) => ({
				name: point.name || '',
				type: DataType.Double,
				static: false,
				get: () => 
				{
					console.log("Trying to fetch from inside IODD Device")
					let value = this.value[point.name || ''] //|| this.value[deviceId]
					if(value == undefined || value == null){
						return StatusCodes.BadDataUnavailable
					}
					return new Variant({dataType: DataType.Double, value: this.value})
				}
		})).concat([{
			name: 'Serial',
			static: true,
			type: DataType.String,
			get: () => {
				return new Variant({dataType: DataType.String, value: this.serial})
			}
		}, {
			name: 'Product', 
			static: true,
			type: DataType.String,
			get: () => {
				return new Variant({dataType: DataType.String, value: this.product})
			}
		}])
		super(name, port, datapoints)

		this.serial = device.serial;
		this.product = device.product;

		this.iodd = iodd;
		this.filter = createFilter(this.iodd.function.features.map((feat) => {
			return feat.struct.map((x) => {
				x.bits.name = x.name;
				return x.bits
			})
		}).reduce((prev, curr) => prev.concat(curr), []))

	}

	registerValue(value: any){
		this.value = this.filter(value);
		console.log("Registered value", this.value)
		return this.value
	}
}