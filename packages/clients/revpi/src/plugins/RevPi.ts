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
}