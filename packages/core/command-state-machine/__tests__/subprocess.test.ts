import { CommandStateMachine, CommandStateMachineMode } from "../src";

jest.setTimeout(20 * 1000);

describe('Subprocess as a blockType', () => {
	// it('Subprocess runs waiting for conditions and completing stages', async () => {

	// 	let subTime : number;
	// 	let interruptTime : number;
	// 	const result = await new Promise((resolve, reject) => {
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
	// 							id: '0.2',
	// 							extras: {
	// 								blockType: 'sub-process',
	// 								"sub-process": 'sub1'
	// 							}
	// 						},
	// 						"0.3": {
	// 							id: '0.3',
	// 							extras: {
	// 								blockType: 'timer',
	// 								timer: 1000
	// 							}
	// 						},
	// 						"0.4": {
	// 							id: "0.4",
	// 							extras: {
	// 								blockType: 'action',
	// 								actions: [{
	// 									device: "AV101",
	// 									operation: 'close'
	// 								}]
	// 							}
	// 						}
	// 					},
	// 					sub_processes: [{
	// 						id: 'sub1',
	// 						name: 'Sub1',
	// 						nodes: {
	// 							origin: {
	// 								id: 'origin',
									
	// 							},
	// 							"0.1": {
	// 								id: '0.1',
	// 								extras: {
	// 									blockType: 'action',
	// 									actions: [{device: "AV101", operation: "open"}]
	// 								}
	// 							},
	// 							'0.2': {
	// 								id: '0.2'
	// 							}
	// 						},
	// 						links: {
	// 							'0.1': {
	// 								source: 'origin',
	// 								target: '0.1'
	// 							},
	// 							'0.2': {
	// 								source: '0.1',
	// 								target: '0.2'
	// 							}
								
	// 						}
	// 					}],
	// 					links: {
	// 						link: {
	// 							source: "origin",
	// 							target: "0.2",
								
	// 						},
	// 						link3: {
	// 							source: '0.2',
	// 							target: '0.3'
	// 						},
	// 						link4: {
	// 							source: '0.3',
	// 							target: '0.4'
	// 						},
	// 						links5: {
	// 							source: '0.4',
	// 							target: '0.5'
	// 						}
	// 					}
	// 				}
	// 			]
	// 		}, {
	// 			performOperation: async (event) => {
	// 				console.log(event)
	// 				if(event.device == "AV101"){
	// 					if(event.operation == "open"){
	// 						subTime = Date.now()
	// 					}else if(event.operation == "close"){
	// 						interruptTime = Date.now()
	// 					}
	// 				}

	// 				if(subTime && interruptTime){
	// 					machine.stop()
	// 					resolve(subTime < interruptTime)
	// 				}
	// 			}
	// 		});
	
	// 		machine.start(CommandStateMachineMode.AUTO);
	// 		setTimeout(() => {
	// 			machine.stop()
	// 			reject(new Error('Timer did not fire'))
	// 		}, 10 * 1000)
	// 	})

	// 	expect(result).toBe(true)
	// })

	it('Subprocess has timer', async () => {
		let subTime : number;
		let interruptTime : number;
		const result = await new Promise((resolve, reject) => {
			const machine = new CommandStateMachine({
				processes: [
					{
						id: 'raw-water',
						name: 'Feed',
						nodes: [{
								id: 'origin',
								type: 'trigger',

							},{
								id: '0.2',
								type: 'sub-process',

								options: {
									blockType: 'sub-process',
									"sub-process": 'sub1'
								}
							},
							// "0.3": {
							// 	id: '0.3',
							// 	extras: {
							// 		blockType: 'timer',
							// 		timer: 1 * 1000
							// 	}
							// },
							{
								id: '0.4',
								type: 'sub-process',
								options: {
									blockType: 'sub-process',
									"sub-process": 'sub2'
								}
							},{
								id: "0.5",
								type: 'action',
								options: {
									blockType: 'action',
									actions: [{
										device: "AV101",
										operation: 'close'
									}]
								}
							},
							
						],
						sub_processes: [{
							id: 'sub1',
							name: 'Sub1',
							nodes: [{
									id: 'origin',
									type: 'trigger',
									
								}, {
									id: '0.1',
									type: 'action',

									options: {
										blockType: 'action',
										actions: [{device: "AV101", operation: "open"}]
									}
								}, {
									id: '0.2',
									type: 'timer',

									options: {
										blockType: 'timer',
										timer: 1 * 1000
									}
								},{
									id: '0.3',
									type: 'action',

								}
							],
							edges: [ {
									source: 'origin',
									target: '0.1'
								},{
									source: '0.1',
									target: '0.2'
								},{
									source: '0.2',
									target: '0.3'
								}
								
							]
						}, {
							id: 'sub2',
							name: 'Sub2',
							nodes: [ {
									id: 'origin',
									type: 'trigger',

									
								},{
									id: '0.1',
									type: 'action',

									options: {
										blockType: 'action',
										actions: [{device: "AV101", operation: "open"}]
									}
								},{
									id: '0.2',
									type: 'timer',

									options: {
										blockType: 'timer',
										timer: 1 * 1000
									}
								}, {
									id: '0.3',
									type: 'action',

								}
							],
							edges: [ {
									source: 'origin',
									target: '0.1'
								},{
									source: '0.1',
									target: '0.2'
								},{
									source: '0.2',
									target: '0.3'
								},
								
							]
						}],
						edges: [{
								source: "origin",
								target: "0.2",
								
							},{
								source: '0.2',
								target: '0.4'
							},{
								source: '0.4',
								target: '0.5'
							}
						]
					}
				]
			}, {
				requestState: async (event) => {
					console.log(event)
					if(event.device == "AV101"){
						if(event.state == true){
							subTime = Date.now()
						}else if(event.state == false){
							interruptTime = Date.now()
						}
					}

					if(subTime && interruptTime){
						await machine.stop()
						clearTimeout(timeout)
						resolve(subTime < interruptTime)
					}
				}
			});
	
			machine.changeMode(CommandStateMachineMode.AUTO)
			machine.start();
			
			const timeout = setTimeout(() => {
				machine.stop()
				reject(new Error('Timer did not fire'))
			}, 10 * 1000)
		})

		expect(result).toBe(true)
	})
})