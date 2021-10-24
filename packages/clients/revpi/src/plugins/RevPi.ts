import {RevPi} from '@revpi/node'
import { nanoid } from 'nanoid';
import { BasePlugin } from './Base';

export default class RevPiPlugin extends BasePlugin {
	public TAG : string = "REVPI";

	private pi: RevPi;

	private subscription: any;

	constructor(){
		super()
		this.pi = new RevPi()
	}

	async discover(){
		
		let inputs : any[] = Array.from(Array(14)).map((e, port) => {
			let portKey = `I_${port + 1}`;
			return {
				port: portKey,
				inputs: [{
					key: 'active',
					type: 'BooleanT'
				}]
			}
		});

		let outputs : any[] = Array.from(Array(14)).map((e, port) => {
			let portKey = `O_${port + 1}`;
			return {
				port: portKey,
				outputs: [{
					key: 'active',
					type: 'BooleanT' 
				}]
			}
		})

		let devices : any[] = inputs.concat(outputs);


		return this.pi.getDeviceList().filter((a) => a.name !== "RevPi Core").map((item) => ({
			id: item.address,
			name: item.name,
			devices: devices
		}));
	}

	private async readAll(){
		const inputs = await Promise.all(Array.from(Array(14)).map(async (port, ix) => {
			return {
				port: `I_${ix + 1}`,
				value: this.pi.readValue(`I_${ix + 1}`)
			}
		}))

		const outputs = await Promise.all(Array.from(Array(14)).map(async (port, ix) => {
			return {
				port: `O_${ix + 1}`,
				value: this.pi.readValue(`O_${ix + 1}`),
			}
		}))
		// const value = this.pi.readValue(port)
		return inputs.concat(outputs);
	}

	async subscribe(bus: string){
		
		this.subscription = setInterval(async () => {
			const allPorts = await this.readAll()

			allPorts.forEach((port) => {
				this.emit('PORT:VALUE', {
					bus: bus,
					port: port.port,
					value: port.value
				})
			})
		}, 10 * 1000);

		return {
			id: 3,
			result: this.subscription
		}
	}



	async write(bus: string | null, port: string, value: any){
		let writeVal = 0;
		if(value && (value == 'true' || value == 'open' || value == 1 || value == '1')) writeVal = 1;
		if(!value || value == 'false' || value == 'close' || value == 0 || value == '0') writeVal = 0;
		await this.pi.writeValue(port, writeVal)
	}
}