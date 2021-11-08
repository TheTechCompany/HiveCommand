import axios, { Axios, AxiosInstance } from 'axios';
import OPCUAServer from '@hive-command/opcua-server'
import { DataType, StatusCode, StatusCodes, Variant } from 'node-opcua';
import { AssignmentPayload, PayloadResponse } from './types';

export * from './types'

export interface ValueBankInterface {
	getDeviceMode?: (device: string) => any;
	setDeviceMode?: (device: string, mode: string) => any;

	requestState?: (device: string, key: string, value: any) => void;
	requestAction?: (device: string, action: string)=> void;
	get?: (device: string, key:string ) => any;
}
export interface CommandNetworkOptions{
	baseURL?: string;

	controller: {
		[key: string]: {
			type: DataType;
			get: () => Variant
			set: (value: Variant) => StatusCode
		}
	}
	valueBank?: ValueBankInterface
}

export interface CommandBus {
	id: string;
	type: string;
	devices?: {ix: number, product: string, iodd: {
		function: {
			inputs: {name: string, struct: {name: string, bits: {subindex: string}}[]}[],
			outputs?: {name: string, struct: {name: string, bits: {subindex: string}}[]}[]
		}
	}}[]
}

export class CommandNetwork {

	private opc? : OPCUAServer

	private httpInstance : AxiosInstance;

	private identity? : string;

	private buses: CommandBus[] = [];

	private valueBank : ValueBankInterface = {}

	private options : CommandNetworkOptions;

	constructor(opts: CommandNetworkOptions){
		this.options = opts;

		this.httpInstance = axios.create({
			baseURL: opts.baseURL || 'http://discovery.hexhive.io:8080'
		})

		this.valueBank = {
			...opts.valueBank
		}
	}

	async whoami() : Promise<{error?: any, identity?: {named: string, address: string}}>{
		const result = await this.httpInstance.request<{error?: string, identity?: {named: string, address: string}}>({
			url: '/api/identity/whoami'
		})
		return result.data
	}

	async getPurpose() : Promise<PayloadResponse> {
		const result = await this.httpInstance.request<PayloadResponse>({
			url: '/api/identity/purpose'
		})
		return result.data
	}


	async proveIdentity () {
		const result = await this.httpInstance.request({
			url: '/api/identity',
			method: "POST"
		})
	}

	//Informs network of the underlying structure of IO
	async provideContext(buses: CommandBus[], identity: {
		os: {
			arch: string,
			kernel: string
		},
		hardware: {
			cpus: any[]
			memory: {total: number, free: number}
		},
		network: NodeJS.Dict<any[]>,
		uptime: any
	}){
		this.buses = buses;
		const result = await this.httpInstance.request({
			url: '/api/identity/context',
			method: "POST",
			headers: {'Content-Type': 'application/json'},
			data: {
				buses: buses,
				identity: identity
			}
		})
		return result.data
	}

	becomeSelf(self: {error?: any, identity?: any}){
		if(!self.error){
			this.identity = self.identity.named;
		}
	}

	getDataType = (type: string) => {
		switch(type){
			case 'BooleanT':
				return DataType.Boolean;
			case 'IntegerT':
			case 'UIntegerT':
				return DataType.Double;		
			default:
				return DataType.Double
		}
	}

	getDataValue = (type: string, value: any) => {
		let v = value //typeof(value) == "object" ? value[key] : value;
		switch(type){
			case 'BooleanT':
				return Boolean(v);
			case 'IntegerT':
			case 'UIntegerT':
			default:
				return	parseFloat(v);		
		}
	}

	getDeviceName = (type: string,  bus: string, port: any) => {
		return `${type}|${bus}|${port}`
	}

	request(variant: Variant){
		if(this.valueBank.requestAction){
			let parts = variant.value.toString().split('|')
			if(!parts) return;
			const [ device, action ] = parts;
			this.valueBank.requestAction(device, action)
		}
	}

	//Turn buses into OPC map
	async initOPC(layout: AssignmentPayload[]){

		// await this.opc?.setComandEndpoint(this.request.bind(this))
		
		// await this.opc?.addControllerInfo(`CommandAction`, DataType.String, () => {
		// 	return new Variant({dataType: DataType.String, value: "Action"})
		// })

		await Promise.all(layout.map(async (layout) => {
			await this.opc?.addDevice({
				name: layout.name,
				type: layout.type
			}, {
				state: {
					...(layout.state || []).reduce((prev, curr) => {
						let opcPoint: any = {
							...prev,
							[curr.key]: {
								type: this.getDataType(curr.type),
								get: () => {
									let value = this.valueBank.get?.(layout.name, curr.key);
									return new Variant({dataType: this.getDataType(curr.type), value: this.getDataValue(curr.type, value)})
								}
								
							}
						}

						if(curr.writable){
							opcPoint[curr.key].set = (variant: Variant) => {
								console.log("OPC POINT", variant)
								this.valueBank.requestState?.(layout.name, curr.key, variant.value)
								return StatusCodes.Good;
							}
						}
						return opcPoint
					}, {}),
					mode: {
						type: DataType.String,
						get: () => {

							return new Variant({dataType: DataType.String, value: this.valueBank.getDeviceMode?.(layout.name) || "Automatic"})
						}, 
						set: (variant: Variant) => {
							console.log(`Change mode for ${layout.name}`)
							this.valueBank.setDeviceMode?.(layout.name, variant.value.toString())
							return StatusCodes.Good;
						}
					}
				},
			})
		}))

		// await Promise.all(this.buses.map(async (bus) => {
		// 	switch(bus.type){
		// 		case 'REVPI':
		// 			//Inputs
		// 			console.log("REVPI BUilder");
		// 			await Promise.all(Array.from(Array(14)).map(async (port, ix) => {
		// 				let portKey = `I_${ix + 1}`
		// 				await this.opc?.addDevice({
		// 					name: this.getDeviceName(`REVPI`, bus.id, portKey),
		// 					type: 'RevPi_DI'
		// 				}, {
		// 					state: {
		// 						active: {
		// 							type: DataType.Boolean,
		// 							get: (key) => {
		// 								let value = this.valueBank.get?.(bus.id, portKey)
		// 								return new Variant({dataType: DataType.Boolean, value: Boolean(value && value == 1) });
		// 							}
		// 						}
		// 					}
		// 				})
		// 			}))
		// 			//Outputs
		// 			await Promise.all(Array.from(Array(14)).map(async (port, ix) => {
		// 				let portKey = `O_${ix + 1}`
		// 				await this.opc?.addDevice({
		// 					name: this.getDeviceName(`REVPI`, bus.id, portKey),
		// 					type: 'RevPi_DO'
		// 				}, {
		// 					state: {
		// 						active: {
		// 							type: DataType.Boolean,
		// 							get: (key) => {
		// 								let value = this.valueBank.get?.(bus.id, portKey)
		// 								return new Variant({dataType: DataType.Boolean, value: Boolean(value && value == 1)});
		// 							},
		// 							set: (value) => {
		// 								console.log(`SET VALUE FOR ${port}`, value)
		// 								this.valueBank.request?.(bus.id, portKey, value.value ? 1 : 0)
		// 								// callback(null, StatusCodes.Good);
		// 							}
		// 						}
		// 					}
		// 				})
		// 			}))

		// 			break;
		// 		case 'IO-LINK':
		// 			console.log("IO")

		// 			if((bus.devices || []).length > 0){
		// 				await Promise.all((bus.devices || []).map(async (device) => {
		// 					let stateDefinition : any = {};


		// 					device.iodd.function.inputs.reduce<any[]>((prev, curr) => {
		// 						return prev.concat(curr.struct)
		// 					}, []).forEach((input) => {
		// 						console.log(input)
		// 						stateDefinition[`${input.name}-${input.bits.subindex}`] = {
		// 							type: DataType.Double,
		// 							get: () => {
		// 								let value = this.valueBank.get?.(bus.id, `${device.ix + 1}`)

		// 								return new Variant({dataType: DataType.Double, value: value?.[`${input.name}-${input.bits.subindex}`]})
		// 							}
		// 						}
		// 					})

		// 					device.iodd.function.outputs?.reduce<any[]>((prev, curr) => {
		// 						return prev.concat(curr.struct)
		// 					}, []).forEach((output) => {
		// 						stateDefinition[`${output.name}-${output.bits.subindex}`] = {
		// 							type: DataType.Double,
		// 							get: () => {
		// 								let value = this.valueBank.get?.(bus.id, `${device.ix + 1}`)

		// 								console.log("Value", value, `${output.name}-${output.bits.subindex}`)
		// 								return new Variant({dataType: DataType.Double, value: value?.[`${output.name}-${output.bits.subindex}`]})
		// 							},
		// 							set: (value: Variant) => {
										
		// 								this.valueBank.request?.(bus.id, `${device.ix + 1}`, {[`${output.name}-${output.bits.subindex}`]: value.value})
		// 							}
		// 						}
		// 					})

		// 					this.opc?.addDevice({
		// 						name: this.getDeviceName(`IO-LINK`, bus.id, device.ix + 1),
		// 						type: device.product
		// 					}, {
		// 						state: stateDefinition
		// 					})

		// 				}))
		// 			}else{
		// 				await Promise.all(Array.from(Array(8)).map((port, ix) => {
		// 					console.log("Add port", "IO " + ix)
	
		// 					this.opc?.addDevice({
		// 						name: this.getDeviceName(`IO-LINK`, bus.id, ix + 1),
		// 						type: `IO-PORT`
		// 					}, {
		// 						state: {
		// 							value: {
		// 								type: DataType.Double,
		// 								get: () => {
		// 									// console.log("GET IO")
		// 									return new Variant({dataType: DataType.Double, value: 0.0})									}
		// 							}
		// 						}
		// 					})
		// 				}))
		// 			}

					
		// 			break;
		// 	}
			
		//}))
	}

	/*
		- Start OPCUA Server and Companions
		- Load initialState (decouples building the schema from running the server)
	*/
	async start(credentials: {
		hostname: string,
		discoveryServer?: string
	}, layout: AssignmentPayload[]){

		this.opc = new OPCUAServer({
			productName: "CommandPilot",
            hostname: credentials.hostname,
			discoveryServer: credentials.discoveryServer,
			controller: this.options.controller || {}
		})


		await this.opc.start()
		await this.initOPC(layout);


	}

}