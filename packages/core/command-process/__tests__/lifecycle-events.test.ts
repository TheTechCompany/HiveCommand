// import { action } from "../../command-state-machine/src/base-plugins"
// import { Process } from "../src"
// import * as actions from '../src/base-plugins'

describe('Lifecycle events', () => {
	it('Starts up', () => {

	})
})

// 	it('Shuts down', async () => {
// 		const result = await new Promise(async (resolve) => {

// 			let conditionsMet = 0;

// 			const process = new Process({
// 				id: 'test-process',
// 				name: 'test',
// 				nodes: [
// 					{id: 'origin', type: 'trigger'}, 
// 					{id: 'timer', type: 'timer', options: {timer: 3000}}, 
// 					{id: 'output', type: 'action', options: {actions: [{device: 'PMP101', operation: 'start'}]}},
// 					{id: 'exit', type: 'shutdown'},
// 					{id: 'stop-pump', type: 'action', options: {actions: [{device: 'PMP101', operation: 'stop'}]}}
// 				],
// 				edges: [
// 					{source: 'origin', target: 'timer'}, 
// 					{source: 'timer', target: 'output'}, 
// 					{source: 'output', target: 'timer'},
// 					{source: 'exit', target: 'stop-pump'}
// 				]
// 			}, [
// 				{
// 					id: 'trigger',
// 					onEnter: actions.trigger
// 				},
// 				{
// 					id: 'action',
// 					onEnter: actions.action
// 				},
// 				{
// 					id: 'timer',
// 					onEnter: actions.timer
// 				},
// 			], async (device, release, operation) => {
// 				console.log(device, operation)
// 				if(device == "PMP101" && operation == "stop"){
// 					conditionsMet++
// 				}
// 			}, (key: string) => {
// 				console.log({key})
// 			});

// 			process.on('stopped', () => {
// 				console.log("Stopped")
// 				conditionsMet++;
// 			})

// 			process.on('transition', (ev) => {
// 				console.log("Transition", ev)
// 				conditionsMet++;
// 			})
// 			await process.stop()
// 			resolve(conditionsMet >= 3)
// 			// await process.start()
// 		})

// 		expect(result).toBe(true)
// 	})

// 	// it('Handles process signals', () => {
		
// 	// })

// 	it('Run timer', async () => {
// 		const result = await new Promise(async (resolve) => {

// 			const process = new Process({
// 				name: 'test',
// 				nodes: [
// 					{id: 'origin', type: 'trigger'}, 
// 					{id: 'timer', type: 'timer', options: {timer: 1000}}, 
// 					{id: 'output', type: 'action', options: {actions: [{device: 'PMP101', operation: 'start'}]}}
// 				],
// 				edges: [{source: 'origin', target: 'timer'}, {source: 'timer', target: 'output'}, {source: 'output', target: 'timer'}]
// 			}, [
// 				{
// 					id: 'trigger',
// 					onEnter: actions.trigger
// 				},
// 				{
// 					id: 'action',
// 					onEnter: actions.action
// 				},
// 				{
// 					id: 'timer',
// 					onEnter: actions.timer
// 				},
// 			], async (device) => {
// 				if(device == "PMP101"){
// 					await process.stop()
// 					resolve(true)
// 				}
// 			}, (key: string) => {
// 				console.log({key})
// 			});

// 			await process.start()
// 		})

// 		expect(result).toBe(true)
// 	})

// 	it('Process runs to completion', async () => {
// 		const result = await new Promise(async (resolve) => {

// 			const process = new Process({
// 				name: 'test',
// 				nodes: [
// 					{id: 'origin', type: 'trigger'}, 
// 					{id: 'timer', type: 'timer', options: {timer: 1000}}, 
// 					{id: 'output', type: 'action', options: {actions: [{device: 'PMP101', operation: 'start'}]}}
// 				],
// 				edges: [{source: 'origin', target: 'timer'}, {source: 'timer', target: 'output'}]
// 			}, [
// 				{
// 					id: 'trigger',
// 					onEnter: actions.trigger
// 				},
// 				{
// 					id: 'action',
// 					onEnter: actions.action
// 				},
// 				{
// 					id: 'timer',
// 					onEnter: actions.timer
// 				},
// 			], async (device) => {
		
// 			}, (key: string) => {
// 				console.log({key})
// 			});

// 			await process.start()

// 			resolve(true)
// 		})

// 		expect(result).toBe(true)
// 	})
// })