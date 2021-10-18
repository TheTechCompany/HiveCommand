import axios, { Axios, AxiosInstance } from 'axios';
import OPCUAServer from '@hive-command/opcua-server'
import { DataType, StatusCodes, Variant } from 'node-opcua';

export interface CommandNetworkOptions{
	baseURL?: string;

	valueBank?: {
		request: (id: string, port: string, value: any)=> void;
		get: (id: string, port: string) => any;
	}
}

export interface CommandBus {
	id: string;
	type: string;
	devices?: {ix: number, product: string, iodd: {
		function: {
			inputs: {name: string, struct: {name: string}[]}[],
			outputs?: {name: string, struct: {name: string}[]}[]
		}
	}}[]
}

export class CommandNetwork {

	private opc? : OPCUAServer

	private httpInstance : AxiosInstance;

	private identity? : string;

	private buses: CommandBus[] = [];

	private valueBank : {
		request?: (id: string, port: string, value: any)=> void;
		get?: (id: string, port: string) => any;
	} = {}

	constructor(opts: CommandNetworkOptions){
		this.httpInstance = axios.create({
			baseURL: opts.baseURL || 'http://discovery.hexhive.io:8080'
		})

		this.valueBank = {
			request: opts.valueBank?.request,
			get: opts.valueBank?.get
		}
	}

	async whoami() : Promise<{error?: any, identity?: {named: string, address: string}}>{
		const result = await this.httpInstance.request<{error?: string, identity?: {named: string, address: string}}>({
			url: '/api/identity/whoami'
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

	getDeviceName = (type: string, bus: string, port: any) => {
		return `${type}|${bus}|${port}`
	}

	//Turn buses into OPC map
	async initOPC(){
		console.log("INIT", this.buses)
		await Promise.all(this.buses.map(async (bus) => {
			switch(bus.type){
				case 'REVPI':
					//Inputs
					console.log("REVPI BUilder");
					await Promise.all(Array.from(Array(14)).map(async (port, ix) => {
						let portKey = `I_${ix + 1}`
						await this.opc?.addDevice({
							name: this.getDeviceName(`REVPI`, bus.id, portKey),
							type: 'RevPi_DI'
						}, {
							state: {
								value: {
									type: DataType.Boolean,
									get: (key) => {
										let value = this.valueBank.get?.(bus.id, portKey)
										return new Variant({dataType: DataType.Boolean, value: Boolean(value && value == 1) });
									}
								}
							}
						})
					}))
					//Outputs
					await Promise.all(Array.from(Array(14)).map(async (port, ix) => {
						let portKey = `O_${ix + 1}`
						await this.opc?.addDevice({
							name: this.getDeviceName(`REVPI`, bus.id, portKey),
							type: 'RevPi_DO'
						}, {
							state: {
								value: {
									type: DataType.Boolean,
									get: (key) => {
										let value = this.valueBank.get?.(bus.id, portKey)
										return new Variant({dataType: DataType.Boolean, value: Boolean(value && value == 1)});
									},
									set: (value) => {
										console.log(`SET VALUE FOR ${port}`, value)
										this.valueBank.request?.(bus.id, portKey, value.value ? 1 : 0)
										// callback(null, StatusCodes.Good);
									}
								}
							}
						})
					}))

					break;
				case 'IO-LINK':
					console.log("IO")

					if((bus.devices || []).length > 0){
						await Promise.all((bus.devices || []).map(async (device) => {
							let stateDefinition : any = {};


							device.iodd.function.inputs.reduce<any[]>((prev, curr) => {
								return prev.concat(curr.struct)
							}, []).forEach((input) => {

								stateDefinition[input.name] = {
									type: DataType.Double,
									get: () => {
										let value = this.valueBank.get?.(bus.id, `${device.ix + 1}`)

										return new Variant({dataType: DataType.Double, value: value?.[input.name]})
									}
								}
							})

							device.iodd.function.outputs?.reduce<any[]>((prev, curr) => {
								return prev.concat(curr.struct)
							}, []).forEach((output) => {
								stateDefinition[output.name] = {
									type: DataType.Double,
									get: () => {
										let value = this.valueBank.get?.(bus.id, `${device.ix + 1}`)

										return new Variant({dataType: DataType.Double, value: value?.[output.name]})
									}
								}
							})

							this.opc?.addDevice({
								name: this.getDeviceName(`IO-LINK`, bus.id, device.ix + 1),
								type: device.product
							}, {
								state: stateDefinition
							})

						}))
					}else{
						await Promise.all(Array.from(Array(8)).map((port, ix) => {
							console.log("Add port", "IO " + ix)
	
							this.opc?.addDevice({
								name: this.getDeviceName(`IO-LINK`, bus.id, ix + 1),
								type: `IO-PORT`
							}, {
								state: {
									value: {
										type: DataType.Double,
										get: () => {
											// console.log("GET IO")
											return new Variant({dataType: DataType.Double, value: 0.0})									}
									}
								}
							})
						}))
					}

					
					break;
			}
			
		}))
	}

	/*
		- Start OPCUA Server and Companions
		- Load initialState (decouples building the schema from running the server)
	*/
	async start(credentials: {
		hostname: string,
		discoveryServer?: string
	}){
		this.opc = new OPCUAServer({
			productName: "CommandPilot",
            hostname: credentials.hostname,
			discoveryServer: credentials.discoveryServer
		})


		await this.opc.start()
		await this.initOPC();


	}

}