import sudbuster from './sudbuster.json';
import { CommandClient } from '../src';

const layout = sudbuster.layout;

describe('Load device-map from definitions', () => {
	it('Pumps load with percentage drive', () => {
		let pump = layout.find((a) => a.name == "PMP101");
		let stateItems = pump?.state || [];
		let speedControl = (stateItems as any)?.find((a: any) => a.key == 'speed');

		let value = 20;

		if(speedControl.max && speedControl.min){
			value = (((speedControl.max - speedControl.min) / 100) * value) + speedControl.min
			if(value > speedControl.max) value = speedControl.max
			if(value < speedControl.min) value = speedControl.min
		}

		expect(value).toBe(7200);
	})

	it('Loads', async () => {
		let client = new CommandClient({});

		client.load({payload: sudbuster as any});

		try{
			await client.kill()
			
		}catch(err){
			console.error(err)
		}
	})
	// it('Pump write produces a rectified drive value', () => {

	// })
})