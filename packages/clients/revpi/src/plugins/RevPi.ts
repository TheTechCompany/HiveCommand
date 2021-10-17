import {RevPi} from '@revpi/node'
import { BasePlugin } from './Base';

export default class RevPiPlugin extends BasePlugin {
	public TAG : string = "REVPI";

	private pi: RevPi;

	constructor(){
		super()
		this.pi = new RevPi()
	}

	async discover(){
		return this.pi.getDeviceList().filter((a) => a.name !== "RevPi Core").map((item) => ({
			id: item.address,
			name: item.name
		}));
	}

	async read(){
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

	async write(bus: string | null, port: string, value: any){
		await this.pi.writeValue(port, value)
	}
}