import os from 'os';

export class IdentityManager {

	private arch: string;
	private kernel: string;

	private cpus: os.CpuInfo[]
	private freeMemory: number;
	private totalMemory: number;

	private network: NodeJS.Dict<os.NetworkInterfaceInfo[]>

	private uptime : number;
	
	constructor(){
		this.arch = os.arch()
		this.kernel = os.version()

		this.cpus = os.cpus()
		this.freeMemory = os.freemem()
		this.totalMemory = os.totalmem()

		this.network = os.networkInterfaces()
	
		this.uptime = os.uptime()
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
}