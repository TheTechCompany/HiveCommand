import axios, { Axios, AxiosInstance } from 'axios';
import OPCUAServer from '@hive-command/opcua-server'
import { DataType, Variant } from 'communication/opc-server/node_modules/node-opcua-variant/dist';
export interface CommandNetworkOptions{
	baseURL?: string;
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

	constructor(opts: CommandNetworkOptions){
		this.httpInstance = axios.create({
			baseURL: opts.baseURL || 'http://discovery.hexhive.io:8080'
		})

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
						console.log("Add port", "DI " + ix)
						await this.opc?.addDevice({
							name: `revpi_di_${ix}`,
							type: 'RevPi_DI'
						}, {
							state: {
								value: {
									type: DataType.Boolean,
									get: (key) => {
										console.log("REVPI GET", key)
										return new Variant({dataType: DataType.Boolean, value: true});
									}
								}
							}
						})
					}))
					//Outputs
					await Promise.all(Array.from(Array(14)).map(async (port, ix) => {
						console.log("Add port", "DO " + ix)
					
						await this.opc?.addDevice({
							name: `revpi_do_${ix}`,
							type: 'RevPi_DO'
						}, {
							state: {
								value: {
									type: DataType.Boolean,
									get: (key) => {
										console.log("REVPI DO GET", key)
										return new Variant({dataType: DataType.Boolean, value: true});
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