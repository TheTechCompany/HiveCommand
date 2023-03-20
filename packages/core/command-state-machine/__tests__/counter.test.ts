'use strict';

import {CommandStateMachine, CommandStateMachineMode} from '../src'


jest.setTimeout(20000);

describe('State Machine Counter', () => {


	test('Counts the loops', async () => {

		const result = await new Promise(async (resolve, reject) => {
			const machine = new CommandStateMachine({
				processes: [
					{
						id: 'raw-water',
						name: 'Feed',
						nodes: [{
								id: 'origin',
								type: 'trigger',

							},{
								id: "0.2",
								type: 'action',

								options: {
									blockType: 'action',
									actions: [{
										id: '0',
										device: 'COUNTER',
										request: 'increment'
									}]
								}
							}, {
								id: '0.3',
								type: 'action',
								options: {
									blockType: 'action',
									actions: [{
										id: '0',
										device: 'COUNTER',
										request: 'increment'
									}]
								}
							}
						],
						edges: [{
							id: '0',

								source: "origin",
								target: "0.2"
							},{
								id: '1',

								source: '0.2',
								target: '0.3'
							}, {
								id: '2',

								source: '0.3',
								target: '0.2'
							}
						]
					}
				],
				devices: [
					{
						name: 'COUNTER',
						state: [{
							key: 'value',
							type: 'IntegerT'
						}],
						actions: [
							{
								key: 'increment',
								func: `
									setState({value: ((state || {}).value || 0) + 1})
								`
							},
							{
								key: 'reset',
								func: `
									setState({value: 0})
								`
							}
						]
					},
					{
					name: 'AV101',
					actions: [{
						key: 'close',
						func: `
							setState({opening: true}); 
							requestState(false); 
							await new Promise((resolve, reject) => setTimeout(() => resolve(true), 11 * 1000)); 
							setState({opening: false, open: false});
						`
					}, {
						key: 'open',
						func: `
						setState({opening: true}); 
						requestState(true); 
						await new Promise((resolve, reject) => setTimeout(() => resolve(true), 11 * 1000)); 
						setState({opening: false, open: true});
						`
					}]

				}]
			}, {
				requestState: async (event) => {
					console.log(event)
					console.log(typeof(event.state))
					// if(event.device == "AV101" && event.state == true) {
					// 	await machine.stop();
					// 	clearTimeout(timeout)
					// 	// machine.stop()
					// 	resolve(true)
					// }
				}
			});
	
			machine.state?.on('COUNTER:changed', (data) => {
				if(data.value == 6){
					machine.stop();
					resolve(true);
				}
				console.log({data})
			})

			machine.changeMode(CommandStateMachineMode.AUTO)
			 machine.start();
			const timeout = setTimeout(() => {
				machine.stop()
				reject(new Error('Timer did not fire'))
			}, 10 * 1000)
		})
		expect(result).toBe(true)

	})

	// test('Counts loops, allows escape path', async () => {
	// 	const result = await new Promise(async (resolve, reject) => {
	// 		let hitLimit = false;
	// 		let hitCounter = 0;

	// 		const machine = new CommandStateMachine({
	// 			processes: [
	// 				{
	// 					id: 'raw-water',
	// 					name: 'Feed',
	// 					nodes: [{
	// 							id: 'origin',
	// 							type: 'trigger',

	// 						},{
	// 							id: "0.2",
	// 							type: 'action',

	// 							options: {
	// 								blockType: 'action',
	// 								actions: [{
	// 									id: '3',
	// 									device: 'COUNTER',
	// 									request: 'increment'
	// 								}]
	// 							}
	// 						}, {
	// 							id: '0.3',
	// 							type: 'action',
	// 							options: {
	// 								blockType: 'action',
	// 								actions: [{
	// 									id: '0',
	// 									device: 'COUNTER',
	// 									request: 'increment'
	// 								}]
	// 							}
	// 						}, {
	// 							id: '0.4',
	// 							type: 'action',
	// 							options: {
	// 								blockType: 'action',
	// 								actions: [{
	// 									id: '1',
	// 									device: 'COUNTER',
	// 									request: 'reset'
	// 								}]
	// 							}
	// 						}
	// 					],
	// 					edges: [{
	// 						id: '0',
	// 							source: "origin",
	// 							target: "0.2"
	// 						},{
	// 						id: '1',

	// 							source: '0.2',
	// 							target: '0.3'
	// 						}, {
	// 						id: '2',

	// 							source: '0.3',
	// 							target: '0.2'
	// 						}, {
	// 							source: '0.2', 
	// 							target: '0.4',
	// 							options: {
	// 								conditions: [
	// 									{
	// 										inputDevice: 'COUNTER',
	// 										inputDeviceKey: 'value',
	// 										comparator: '>=',
	// 										assertion: '4'
	// 									}
	// 								]
	// 							}
	// 						},
	// 						{
	// 							source: '0.4',
	// 							target: '0.2'
	// 						}
	// 					]
	// 				}
	// 			],
	// 			devices: [
	// 				{
	// 					name: 'COUNTER',
	// 					state: [{
	// 						key: 'value',
	// 						type: 'IntegerT'
	// 					}],
	// 					actions: [
	// 						{
	// 							key: 'increment',
	// 							func: `
	// 								setState({value: ((state || {}).value || 0) + 1})
	// 							`
	// 						},
	// 						{
	// 							key: 'reset',
	// 							func: `
	// 								setState({value: 0})
	// 							`
	// 						}
	// 					]
	// 				},
	// 				{
	// 				name: 'AV101',
	// 				actions: [{
	// 					key: 'close',
	// 					func: `
	// 						setState({opening: true}); 
	// 						requestState(false); 
	// 						await new Promise((resolve, reject) => setTimeout(() => resolve(true), 11 * 1000)); 
	// 						setState({opening: false, open: false});
	// 					`
	// 				}, {
	// 					key: 'open',
	// 					func: `
	// 					setState({opening: true}); 
	// 					requestState(true); 
	// 					await new Promise((resolve, reject) => setTimeout(() => resolve(true), 11 * 1000)); 
	// 					setState({opening: false, open: true});
	// 					`
	// 				}]

	// 			}]
	// 		}, {
	// 			requestState: async (event) => {
	// 				console.log(event)
	// 				console.log(typeof(event.state))
	// 				// if(event.device == "AV101" && event.state == true) {
	// 				// 	await machine.stop();
	// 				// 	clearTimeout(timeout)
	// 				// 	// machine.stop()
	// 				// 	resolve(true)
	// 				// }
	// 			}
	// 		});
	
	// 		machine.state?.on('COUNTER:changed', (data) => {
	// 			if(data.value == 4){
	// 				hitLimit = true;
				
	// 			}

	// 			if(hitLimit && data.value == 0){
	// 				hitCounter++;
	// 				hitLimit = false;
	// 				if(hitCounter == 2){
	// 					machine.stop();
	// 					resolve(true);
	// 				}
	// 				console.log("HIT RESET")
	// 			}
	// 			console.log({data})
	// 		})

	// 		machine.changeMode(CommandStateMachineMode.AUTO)
	// 		 machine.start();
	// 		const timeout = setTimeout(() => {
	// 			machine.stop()
	// 			reject(new Error('Timer did not fire'))
	// 		}, 10 * 1000)
	// 	})
	// 	expect(result).toBe(true)
	// })
})

