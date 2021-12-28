import { Process } from "../src"
import * as actions from '../src/base-plugins'
describe('Lifecycle events', () => {
	it('Starts up', () => {

	})

	it('Shuts down', () => {

	})

	it('Handles process signals', () => {
		
	})

	it('Run timer', async () => {
		const result = await new Promise(async (resolve) => {

			const process = new Process({
				name: 'test',
				nodes: [{id: 'origin', type: 'trigger'}, {id: 'timer', type: 'timer', options: {timer: 1000}}, {id: 'output', type: 'action', options: {actions: [{device: 'PMP101', operation: 'start'}]}}],
				edges: [{source: 'origin', target: 'timer'}, {source: 'timer', target: 'output'}, {source: 'output', target: 'timer'}]
			}, [
				{
					id: 'trigger',
					onEnter: actions.trigger
				},
				{
					id: 'action',
					onEnter: actions.action
				},
				{
					id: 'timer',
					onEnter: actions.timer
				},
			], async (device) => {
				if(device == "PMP101"){
					await process.stop()
					resolve(true)
				}
			}, (key: string) => {
				console.log({key})
			});

			await process.start()
		})

		expect(result).toBe(true)
	})
})