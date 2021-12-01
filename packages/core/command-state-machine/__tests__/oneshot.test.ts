'use strict';

import {CommandStateMachine, CommandStateMachineMode} from '../src'


jest.setTimeout(20000);

describe('Oneshot Process Runs', () => {

	// test('Process runs', async () => {

	// 	const result = await new Promise(async (resolve, reject) => {
	// 		const machine = new CommandStateMachine({
	// 			processes: [
	// 				{
	// 					id: 'raw-water',
	// 					name: 'Feed',
	// 					nodes: {
	// 						"origin": {
	// 							id: 'origin'
	// 						},
	// 						"0.2": {
	// 							id: "0.2",
	// 							extras: {
	// 								blockType: 'timer',
	// 								timer: 5 * 1000
	// 							}
	// 						},
	// 						"0.3": {
	// 							id: '0.3',
	// 							extras: {
	// 								blockType: 'action',
	// 								actions: [{
	// 									device: 'AV101',
	// 									operation: 'open'
	// 								}]
	// 							}
	// 						}
	// 					},
	// 					links: {
	// 						link: {
	// 							source: "origin",
	// 							target: "0.2"
	// 						},
	// 						link3: {
	// 							source: '0.2',
	// 							target: '0.3'
	// 						},
	// 						links4: {
	// 							source: '0.3',
	// 							target: 'origin'
	// 						}
	// 					},
	// 					sub_processes: [
	// 						{
	// 							id: 'flush',
	// 							name: 'Flush',
	// 							nodes: {
	// 								"origin": {
	// 									id: 'origin'
	// 								},
	// 								"0.1": {
	// 									id: '0.1',
	// 									extras: {
	// 										blockType: 'action',
	// 										actions: [{
	// 											device: 'AV101',
	// 											operation: 'open'
	// 										}, {
	// 											device: 'PMP101',
	// 											operation: 'start'
	// 										}]
	// 									}
	// 								},
	// 								'0.2': {
	// 									id: '0.2',
	// 									extras: {
	// 										blockType: 'action'
	// 									}
	// 								}
	// 							},
	// 							links: {
	// 								'0.0': {
	// 									source: 'origin',
	// 									target: '0.1'
	// 								},
	// 								'0.1': {
	// 									source: '0.1',
	// 									target: '0.2'
	// 								}
	// 							}
	// 						}
	// 					]
	// 				}
	// 			]
	// 		}, {
	// 			performOperation: async (event) => {
	// 				console.log(event)
	// 				if(event.device == 'PMP101' && event.operation == 'start') {
	// 					resolve(true)
	// 				}
	// 			}
	// 		});
	
	// 		machine.start() //CommandStateMachineMode.AUTO);
	// 		setTimeout(() => reject(new Error('Timer did not fire')), 10 * 1000)

	// 		await machine.runOneshot('flush')
	// 	})
	// 	expect(result).toBe(true)
	// })

	test("Process makes parent prioritize but doesn't affect siblings", async () => {
		let machine : CommandStateMachine = new CommandStateMachine({tickRate: 1000, processes: []}, {
			performOperation: async (ev) => {
				console.log(ev)
			}
		});
		const result = await new Promise(async (resolve, reject) => {

			let valveCheck = false;
			
			let pumpStart = 0;
			let pumpStop = 0;

			let valveOpen = 0;
			let valveClose = 0;

			machine = new CommandStateMachine({
				tickRate: 1000,
				processes: [
					{
						id: 'raw-water',
						name: 'Feed',
						nodes: {
							"origin": {
								id: 'origin'
							},
							"0.2": {
								id: "0.2",
								extras: {
									blockType: 'sub-process',
									"sub-process": 'permeate'
								}
							},
							"0.3": {
								id: '0.3',
								extras: {
									blockType: 'action',
									actions: [{
										device: 'AV101',
										operation: 'open'
									}]
								}
							},
							'0.4': {
								id: '0.4',
								extras: {
									blockType: 'sub-process',
									"sub-process": 'flush'
								}
							},
							
						},
						links: {
							link: {
								source: "origin",
								target: "0.2"
							},
							link3: {
								source: '0.2',
								target: '0.3'
							},
							links2: {
								source: '0.3',
								target: '0.4'
							},
							links4: {
								source: '0.4',
								target: 'origin'
							}
						},
						sub_processes: [
							{
								id: 'permeate',
								name: 'Permeate',
								nodes: {
									'origin': {
										id: 'origin',
									},
									'0.1': {
										id: '0.1',
										extras: {
											blockType: 'action',
											actions: [{
												device: 'PMP101',
												operation: 'start',
											}]
										}
									},
									'0.2': {
										id: '0.2',
										extras: {
											blockType: 'timer',
											timer: 2000
										}
									},
									'0.3': {
										id: '0.3',
										extras: {
											blockType: 'action',
											actions: [{
												device: 'PMP101',
												operation: 'stop'
											}]
										}
									},
									'0.4': {
										id: '0.3'
									}
								},
								links: {
									'origin': {
										source: 'origin',
										target: '0.1'
									},
									'0.1': {
										source: '0.1',
										target: '0.2'
									},
									'0.2': {
										source: '0.2',
										target: '0.3'
									},
									'0.3': {
										source: '0.3',
										target: '0.4'
									}
								}
							},
							{
								id: 'flush',
								name: 'Flush',
								nodes: {
									"origin": {
										id: 'origin'
									},
									"0.1": {
										id: '0.1',
										extras: {
											blockType: 'action',
											actions: [{
												device: 'AV101',
												operation: 'open'
											}, {
												device: 'PMP201',
												operation: 'start'
											}]
										}
									},
									'0.2': {
										id: '0.2',
										extras: {
											blockType: 'timer',
											timer: 1000,
										}
									},
									'0.3': {
										id: '0.3'
									}
								},
								links: {
									'0.0': {
										source: 'origin',
										target: '0.1'
									},
									'0.1': {
										source: '0.1',
										target: '0.2'
									},
									'0.2': {
										source: '0.2',
										target: '0.3'
									}
								}
							}
						]
					},
					{
						id: 'sibling',
						name: 'Sibling',
						nodes: {
							'origin': {
								id: 'origin'
							},
							'0.1': {
								id: '0.1',
								extras: {
									blockType: 'action',
									actions: [{
										device: 'AV301',
										operation: 'open'
									}]
								}
							},
							'0.2': {
								id: '0.2',
								extras: {
									blockType: 'timer',
									timer: 2000
								}
							},
							'0.3': {
								id :'0.3',
								extras: {
									blockType: 'action',
									actions: [{
										device: 'AV301',
										operation: 'close'
									}]
								}
							},
							'0.4': {
								id: '0.4',
							
							}
						},
						links: {
							'origin': {
								source: 'origin',
								target: '0.1'
							},
							'0.1': {
								source: '0.1',
								target: '0.2'
							},
							'0.2': {
								source: '0.2',
								target: '0.3'
							},
							'0.3': {
								source: '0.3',
								target: '0.4'
							}
						}
					}
				]
			}, {
				performOperation: async (event) => {
					console.log(event)
					if(event.device == 'PMP101'){
						if(event.operation == 'start'){
							pumpStart = Date.now()

						}else{
							pumpStop = Date.now()
						}
					}

					if(event.device == 'AV301'){
						if(event.operation == 'open'){
							valveOpen = Date.now()
						}else{
							valveClose = Date.now()
						}
					}

					if((valveClose > 0 && valveOpen > 0) && valveClose - valveOpen < 2000){
						console.log('Valve has less than 2 seconds in between', valveClose-valveOpen)
						resolve(false)
					}

					if(pumpStop - pumpStart > 3000){
						resolve(false)
					}
					// console.log(pumpStart, pumpStop)

					if(event.device == 'PMP201' && event.operation == 'start') {
						valveCheck = true;
					}

					if(pumpStart > 0 && pumpStop > 0 && valveClose > 0 && valveOpen > 0 && valveCheck){
						resolve((pumpStop - pumpStart) < 3000 && (valveClose - valveOpen) > 2000 &&  valveCheck)

					}
				}
			});
	
			machine.start(CommandStateMachineMode.AUTO) //CommandStateMachineMode.AUTO);
			setTimeout(() => reject(new Error('Timer did not fire')), 10 * 1000)

			setTimeout(async () => {
				await machine.runOneshot('flush')
			}, 1000)
			// await machine.runOneshot('flush')
		})

		machine.stop()
		expect(result).toBe(true)
	})

	test('Process waits for GSM to reach a safe state before running', async () => {
		let machine : CommandStateMachine = new CommandStateMachine({tickRate: 1000, processes: []}, {
			performOperation: async (ev) => {
				console.log(ev)
			}
		});
		const result = await new Promise(async (resolve, reject) => {
			let pumpStart = 0;
			let pumpStop = 0;

			machine = new CommandStateMachine({
				tickRate: 1000,
				processes: [
					{
						id: 'raw-water',
						name: 'Feed',
						nodes: {
							"origin": {
								id: 'origin'
							},
							"0.2": {
								id: "0.2",
								extras: {
									blockType: 'sub-process',
									"sub-process": 'permeate'
								}
							},
							"0.3": {
								id: '0.3',
								extras: {
									blockType: 'action',
									actions: [{
										device: 'AV101',
										operation: 'open'
									}]
								}
							},
							'0.4': {
								id: '0.4',
								extras: {
									blockType: 'sub-process',
									"sub-process": 'flush'
								}
							},
							
						},
						links: {
							link: {
								source: "origin",
								target: "0.2"
							},
							link3: {
								source: '0.2',
								target: '0.3'
							},
							links2: {
								source: '0.3',
								target: '0.4'
							},
							links4: {
								source: '0.4',
								target: 'origin'
							}
						},
						sub_processes: [
							{
								id: 'permeate',
								name: 'Permeate',
								nodes: {
									'origin': {
										id: 'origin',
									},
									'0.1': {
										id: '0.1',
										extras: {
											blockType: 'action',
											actions: [{
												device: 'PMP101',
												operation: 'start',
											}]
										}
									},
									'0.2': {
										id: '0.2',
										extras: {
											blockType: 'timer',
											timer: 2000
										}
									},
									'0.3': {
										id: '0.3',
										extras: {
											blockType: 'action',
											actions: [{
												device: 'PMP101',
												operation: 'stop'
											}]
										}
									},
									'0.4': {
										id: '0.3'
									}
								},
								links: {
									'origin': {
										source: 'origin',
										target: '0.1'
									},
									'0.1': {
										source: '0.1',
										target: '0.2'
									},
									'0.2': {
										source: '0.2',
										target: '0.3'
									},
									'0.3': {
										source: '0.3',
										target: '0.4'
									}
								}
							},
							{
								id: 'flush',
								name: 'Flush',
								nodes: {
									"origin": {
										id: 'origin'
									},
									"0.1": {
										id: '0.1',
										extras: {
											blockType: 'action',
											actions: [{
												device: 'AV101',
												operation: 'open'
											}, {
												device: 'PMP201',
												operation: 'start'
											}]
										}
									},
									'0.2': {
										id: '0.2',
										extras: {
											blockType: 'timer',
											timer: 1000,
										}
									},
									'0.3': {
										id: '0.3'
									}
								},
								links: {
									'0.0': {
										source: 'origin',
										target: '0.1'
									},
									'0.1': {
										source: '0.1',
										target: '0.2'
									},
									'0.2': {
										source: '0.2',
										target: '0.3'
									}
								}
							}
						]
					}
				]
			}, {
				performOperation: async (event) => {
					console.log(event)
					if(event.device == 'PMP101'){
						if(event.operation == 'start'){
							pumpStart = Date.now()

						}else{
							pumpStop = Date.now()
						}
					}

					if(pumpStop - pumpStart > 3000){
						resolve(false)
					}
					// console.log(pumpStart, pumpStop)

					if(event.device == 'PMP201' && event.operation == 'start') {
						resolve((pumpStop - pumpStart) < 3000 && true)
					}
				}
			});
	
			machine.start(CommandStateMachineMode.AUTO) //CommandStateMachineMode.AUTO);
			setTimeout(() => reject(new Error('Timer did not fire')), 10 * 1000)

			setTimeout(async () => {
				await machine.runOneshot('flush')
			}, 1000)
			// await machine.runOneshot('flush')
		})

		machine.stop()
		expect(result).toBe(true)
	})

	
})

