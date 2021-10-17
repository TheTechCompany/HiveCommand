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

	//Turn buses into OPC map
	async initOPC(){
		console.log("INIT", this.buses)
		await Promise.all(this.buses.map(async (bus) => {
			switch(bus.type){
				case 'REVPI':
					//Inputs
					console.log("REVPI BUilder");
					await Promise.all(Array.from(Array(14)).map(async (port, ix) => {
						await this.opc?.addDevice({
							name: `revpi_${bus.id}_di_${ix + 1}`,
							type: 'RevPi_DI'
						}, {
							state: {
								value: {
									type: DataType.Boolean,
									get: (key) => {
										let value = this.valueBank.get?.(bus.id, `I_${ix + 1}`)
										return new Variant({dataType: DataType.Boolean, value: Boolean(value && value == 1) });
									}
								}
							}
						})
					}))
					//Outputs
					await Promise.all(Array.from(Array(14)).map(async (port, ix) => {
					
						await this.opc?.addDevice({
							name: `revpi_do_${ix + 1}`,
							type: 'RevPi_DO'
						}, {
							state: {
								value: {
									type: DataType.Boolean,
									get: (key) => {
										let value = this.valueBank.get?.(bus.id, `O_${ix + 1}`)
										return new Variant({dataType: DataType.Boolean, value: Boolean(value && value == 1)});
									},
									set: (value) => {
										console.log(`SET VALUE FOR DO_${ix + 1}`, value)
										this.valueBank.request?.(bus.id, `O_${ix + 1}`, value.value ? 1 : 0)
										// callback(null, StatusCodes.Good);
									}
								}
							}
						})
					}))

					break;
				case 'IO-LINK':
					console.log("IO")
					await Promise.all(Array.from(Array(8)).map((port, ix) => {
						console.log("Add port", "IO " + ix)

						this.opc?.addDevice({
							name: `io_port_${bus.id}_${ix}`,
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