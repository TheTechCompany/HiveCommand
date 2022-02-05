import { Telnet } from "telnet-client";

export interface KeyenceClientOptions {
	url: string;
}

export class KeyenceClient {
	private client: Telnet;	

	private opts: KeyenceClientOptions;

	constructor(opts: KeyenceClientOptions){
	
		this.client = new Telnet();
		this.opts = opts;

	}

	async connect(){
		const hostParams = {
			host: this.opts.url || 'hahei-flow.hexhive.io',
			port: 8501,
			negotiationMandatory: false,
			timeout: 15000,
			sendTimeout: 15000,
			execTimeout: 15000
		}

		await this.client.connect(hostParams)

		const session = await this.client.write(`CR\r\n`)
		if(session.indexOf('CC') > -1){
			console.log('Session opened')
		}else{
			throw new Error('Session not opened')
		}
	}

	async disconnect(){
		await this.client.end()
		// await this.client.
	}

	async read(address: string, signed?: boolean){
		const result = await this.client.write(`RD ${address}\r\n`, {timeout: 5000})

		let value = parseInt(result.replace('\r\n', ''))

		if(signed){
			return (value << 16) >> 16
		}else{
			return value;
		}
	}

}