import { config as dotConfig } from 'dotenv';
dotConfig()

import { Telnet } from "telnet-client";
import { DataBroker } from "./data-broker";
import { KeyenceClient } from "./keyence";

import config from './read-config.json'
import { transformValue } from './transformer';

export interface HiveRemoteOptions {
	deviceId: string,
	endpoint: string
}

export class HiveRemoteClient {
	public running: boolean = false;

	private options: HiveRemoteOptions;
	private broker : DataBroker;
	private client : KeyenceClient;

	constructor(options: HiveRemoteOptions){
		this.options = options;

		if(!process.env.MONGO_URL) throw new Error('MONGO_URL is not set');
		if(!process.env.TIMESERIES_HOST) throw new Error('TIMESERIES_HOST env not set')

		this.broker = new DataBroker();
		this.client = new KeyenceClient({url: this.options.endpoint});
	}

	async read(){
		let results : any = {};

		for(const key in config){
			let result = await this.client.read((config as any)[key].key, (config as any)[key].signed)
			if((config as any)[key].transform){
				result = transformValue((config as any)[key].transform, result)
			}
			
			results[key] = {
				[(config as any)[key].write]: result
			}
		}

		await Promise.all(Object.keys(results).map(async (key) => {
			let entry = results[key];

			await Promise.all(Object.keys(entry).map(async (entry_key) => {
				if(!process.env.COMMAND_DEVICE) return;
				await this.broker.writeEntry(process.env.COMMAND_DEVICE, key, entry_key, entry[entry_key])
			}))

			// await broker.writeEntry(process.env.COMMAND_DEVICE, key, valueKey, entry[valueKey])
		}))
	}

	async start(){
		await this.broker.connect()
		await this.client.connect();

		this.running = true;

		while(this.running){

			await this.read()

			await new Promise((resolve) => setTimeout(() => resolve(true), 10 * 1000))
		}

	}

	async stop(){
		this.running = false;
		await this.client.disconnect()

		await this.broker.disconnect()
	}

}

// (async () => {

// 	if(!process.env.TIMESERIES_HOST) return new Error('TIMESERIES_HOST env not set')
// 	if(!process.env.COMMAND_DEVICE) return new Error("COMMAND_DEVICE env not set");

// 	const broker = new DataBroker()

// 	await broker.connect()

// 	const kvClient = new KeyenceClient({
// 		url: "hahei-flow.hexhive.io",
// 	});

// 	await kvClient.connect();

// 	const getData = async () => {

// 		let results : any = {};

// 		for(const key in config){
// 			const result = await kvClient.read((config as any)[key].key, (config as any)[key].signed)
// 			results[key] = {
// 				[(config as any)[key].write]: result
// 			}
// 		}

// 		await Promise.all(Object.keys(results).map(async (key) => {
// 			let entry = results[key];

// 			await Promise.all(Object.keys(entry).map(async (entry_key) => {
// 				if(!process.env.COMMAND_DEVICE) return;
// 				await broker.writeEntry(process.env.COMMAND_DEVICE, key, entry_key, entry[entry_key])
// 			}))

// 			// await broker.writeEntry(process.env.COMMAND_DEVICE, key, valueKey, entry[valueKey])
// 		}))

// 		console.log(results)
// 	//   let keys = Object.keys(config).map((key) => {

// 	//   })
// 	// const pondLevel = await kvClient.read("DM10201");
// 	// const supplyRate = await kvClient.read("DM10301");
// 	// const permRate = await kvClient.read("DM10306");
  
// 	// const supplyCummulative = await kvClient.read("DM290");
// 	// const permCummulative = await kvClient.read("DM292");

// 	// const dosingTank = await kvClient.read('DM10401')

// 	// const memTankLevel = await kvClient.read("DM10206");
// 	// const memTankLevel2 = await kvClient.read("DM10211");

// 	// const backwashTank = await kvClient.read('DM10216')
	
// 	// const controlAirPressure = await kvClient.read('DM10406')

// 	// const permPressure = await kvClient.read('DM10311', true)
// 	// const dischargePressure = await kvClient.read('DM10316', true)

// 	// const autoMode = await kvClient.read('MR203')
// 	// const levelMode = await kvClient.read('MR202')
// 	// const timerMode = await kvClient.read('MR201')

// 	// const manualMode = await kvClient.read('MR101')
// 	// const emergencyStop = await kvClient.read('MR102')

// 	// let mode = '';
// 	// if(autoMode === 1) mode = 'AUTO';
// 	// if(levelMode === 1) mode = 'LEVEL';
// 	// if(timerMode === 1) mode = 'TIMER';
// 	// if(manualMode === 1) mode = 'MANUAL';


// 	// console.log({
// 	// 	dosingTank,
// 	// 	memTankLevel,
// 	// 	memTankLevel2,
// 	// 	backwashTank,
// 	// 	controlAirPressure,
// 	// 	permPressure,
// 	// 	dischargePressure,
// 	// 	supplyTotal: supplyCummulative * 8,
// 	// 	permTotal: permCummulative * 8,
// 	// 	pondLevel,
// 	// 	supplyRate,
// 	// 	permRate,
// 	// 	mode,
// 	// 	emergencyStop
// 	// });

// 		setTimeout(() => {
// 			getData();
// 		}, 5000);
		
//   	};

//   getData()

//   // const res = await connection.write('CR\r\n')
//   // const res = await connection.exec('CR')

//   // console.log(res)
// })();
