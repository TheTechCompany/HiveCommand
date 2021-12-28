import { IdentityManager } from "../identity";
import path from 'path';
import { whoami } from "../identity/utils";

export interface RevPiCommandClientOpts {
	commandCenter?: string;
	storagePath?: string;
	networkInterface?: string;
	privateKey?: string;

	discoveryServer?: string;
}


export class RevPiCommandClient {
	
	private identityManager: IdentityManager;

	// private network: RunnerNetwork;
	// private ioBus: IOBus;

	private hardwareInfo: any;
	constructor(opts: RevPiCommandClientOpts){
		this.identityManager = new IdentityManager()

		// this.network = new RunnerNetwork({
		// 	url: opts.commandCenter || 'http://localhost:3002',
		// 	token: opts.privateKey,
		// 	discoveryServer: opts.discoveryServer,
		// 	heartbeatInterval: 10 * (60 * 1000)
		// })

		// this.ioBus = new IOBus({
		// 	storagePath: opts.storagePath || path.join(__dirname, '/iodd'),
		// 	networkInterface: opts.networkInterface || 'eth0',
		// 	network: this.network
		// })

	}

	async preStart(){
		console.log("Pre Start. Fetching Identity");

		return await whoami()
	}

	async start(){

		console.log("Starting...")		

		const identity = await this.preStart();
		if(identity.error) return new Error(identity.error)
		if(!identity.identity) return new Error("No identity/Identity Crisis");

		console.log("Starting network...")
		// await this.ioBus.start();
		// await this.network.start(identity.identity?.named);

		console.log("[Commander] Started")

		console.log("[Commander] Hardware Info", JSON.stringify(this.hardwareInfo))
		console.log("[Commander] Identity Info", JSON.stringify(this.identityManager.identity))

	}
}