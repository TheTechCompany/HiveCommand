import axios, { Axios, AxiosInstance } from 'axios';
import OPCUAServer from '@hive-command/opcua-server'
export interface CommandNetworkOptions{
	baseURL?: string;
}

export class CommandNetwork {

	private opc? : OPCUAServer

	private httpInstance : AxiosInstance;

	private identity? : string;

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

	async provideContext(buses: {
		id: string;
		type: string;
	}[], identity: {
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
	}

}