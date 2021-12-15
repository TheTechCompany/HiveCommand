import os from 'os';
import axios, { Axios } from 'axios';
import { PayloadResponse } from './types';

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

export class CommandIdentity {

	private arch: string;
	private kernel: string;

	private cpus: os.CpuInfo[]
	private freeMemory: number;
	private totalMemory: number;

	private network: NodeJS.Dict<os.NetworkInterfaceInfo[]>

	private uptime : number;

	private httpInstance : Axios
	
	private buses: CommandBus[] = [];

	constructor(opts: {
		identityServer: string
	}){
		this.arch = os.arch()
		this.kernel = os.version()

		this.cpus = os.cpus()
		this.freeMemory = os.freemem()
		this.totalMemory = os.totalmem()

		this.network = os.networkInterfaces()
	
		this.uptime = os.uptime()

		this.httpInstance = axios.create({
			baseURL: opts.identityServer || 'http://discovery.hexhive.io:8080'
		})
	}

	get identity(){
		return {
			os: {
				arch: this.arch,
				kernel: this.kernel
			},
			hardware: {
				cpus: this.cpus,
				memory: {total: this.totalMemory, free: this.freeMemory}
			},
			network: this.network,
			uptime: this.uptime
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
}