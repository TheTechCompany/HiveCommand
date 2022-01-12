import { BasePlugin } from '@hive-command/plugin-base'
import axios from 'axios';
import log from 'loglevel';

export default class BlessedPlugin extends BasePlugin {
	public TAG : string = "BLESSED";

	constructor(){
		super()
	}

	async discover() : Promise<any[]> {
		let port_template = {
			product: 'output',
			deviceId: 'blessed-do',
			vendorId: 'blessed',
			outputs: [{
				key: 'active',
				type: 'BooleanT'
			}, {
				key: 'value',
				type: 'IntegerT'
			}]
		}

		const data = await axios.get(`http://localhost:8765/layout`)
		
		let {cols, rows} = data.data

		let devices = [];

		for(var colIndex = 0; colIndex < cols; colIndex++){
			for(var rowIndex = 0; rowIndex < rows; rowIndex++){

				//get the port number from the col and row
				let port = colIndex + (rowIndex * cols) + 1;

				devices.push({
					...port_template,
					port: `${port}`,
					serial: `${port}`,
				})
			}
		}

		return [{
			id: `blessed`,
			name: `Blessed Output`,
			devices
		}]
	}

	async write(bus: string | null, port: string, value: any){
		log.info(`Writing ${value} to ${port}`)
		
		
		await axios.post(`http://localhost:8765/update`, {
			port: parseInt(port) - 1,
			value
		})
	}
}