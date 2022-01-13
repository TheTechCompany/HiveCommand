'use strict';

import { CommandStateMachine, CommandStateMachineMode } from '../src'
import {createMutex} from 'locks';

jest.setTimeout(20000);

describe('Interlock Machine', () => {

	// test('Multiple interlocks, any will stop process', async () => {
	// 	await new Promise(async (resolve, reject) => {
	// 		let layout = [
	// 			{
	// 				name: "PMP201",
	// 				interlocks: [
	// 					{
	// 						"input": {
	// 							"id": "b7e69bb5-deb9-41d9-814c-bf0a2dfd34c9",
	// 							"name": "PT201"
	// 						},
	// 						"action": {
	// 							"func": "setState({starting: true}); requestState({speed: 0}); await new Promise((resolve, reject) => setTimeout(() => resolve(true), 2 * 1000)); setState({starting: false, on: false});",
	// 							"key": "Stop",
	// 							"id": "yQvQ3ssYYfRdQ5q5W3arh"
	// 						},
	// 						"assertion": {
	// 							"setpoint": null,
	// 							"id": "66ddc4e4-438d-485a-9440-4511de33d1ca",
	// 							"value": "-0.5",
	// 							"type": "value"
	// 						},
	// 						"inputKey": {
	// 							"inputUnits": "Pa",
	// 							"key": "pressure",
	// 							"id": "43a7b746-6ecb-4fb2-9e83-1c117c4a01bf",
	// 							"units": "bar",
	// 							"type": "UIntegerT"
	// 						},
	// 						"id": "b2d6d649-6980-4e15-a22d-e65cef502229",
	// 						"comparator": ">"
	// 					},
	// 					{
	// 						"input": {
	// 							"id": "6e229584-ebc5-45d7-a443-108b35c4a850",
	// 							"name": "TK201"
	// 						},
	// 						"action": {
	// 							"func": "setState({starting: true}); requestState({speed: 0}); await new Promise((resolve, reject) => setTimeout(() => resolve(true), 2 * 1000)); setState({starting: false, on: false});",
	// 							"key": "Stop",
	// 							"id": "yQvQ3ssYYfRdQ5q5W3arh"
	// 						},
	// 						"assertion": {
	// 							"setpoint": {
	// 								"id": "d0b19735-d41b-4507-9e5d-a0eb4fb0c36f",
	// 								"name": "Low",
	// 								"type": "ratio",
	// 								"value": "85"
	// 							},
	// 							"id": "d197258c-9266-4559-892a-e96d58ba21b1",
	// 							"type": "setpoint"
	// 						},
	// 						"inputKey": {
	// 							"min": 4,
	// 							"key": "level",
	// 							"id": "a59761ae-543b-4418-b482-bf8cdd3d742c",
	// 							"max": 20,
	// 							"type": "UIntegerT"
	// 						},
	// 						"id": "69230bcf-e5a5-4b9d-b08b-beba15eeefc3",
	// 						"comparator": ">"
	// 					},
	// 			{
	// 				"input": {
	// 					"id": "93d70455-f87f-426e-8f3c-52eba2214758",
	// 					"name": "TK301"
	// 				},
	// 				"action": {
	// 					"func": "setState({starting: true}); requestState({speed: 0}); await new Promise((resolve, reject) => setTimeout(() => resolve(true), 2 * 1000)); setState({starting: false, on: false});",
	// 					"key": "Stop",
	// 					"id": "yQvQ3ssYYfRdQ5q5W3arh"
	// 				},
	// 				"assertion": {
	// 					"setpoint": {
	// 						"id": "b7d0346a-9ab5-4275-9952-cee24dd2783a",
	// 						"name": "High",
	// 						"type": "ratio",
	// 						"value": 70
	// 					},
	// 					"id": "1f2fe33c-abac-4d74-883e-5120c160f0ba",
	// 					"value": "-1",
	// 					"type": "setpoint"
	// 				},
	// 				"inputKey": {
	// 					"min": 4,
	// 					"key": "level",
	// 					"id": "a59761ae-543b-4418-b482-bf8cdd3d742c",
	// 					"max": 20,
	// 					"type": "UIntegerT"
	// 				},
	// 				"id": "219c6b04-5dd4-4db3-b8bf-ea0953ea034e",
	// 				"comparator": "<"
	// 			}]
	// 		}]

	// 		const machine = new CommandStateMachine({
	// 			initialState: {
	// 				'PT201': {
	// 					pressure: '-0.55'
	// 				},
	// 				'PMP201': {
	// 					on: true
	// 				},
	// 				'TK201': {
	// 					level: 90
	// 				},
	// 				'TK301': {
	// 					level: '80'
	// 				}
	// 			},
	// 			devices: layout?.map((x) => ({
	// 				name: x.name, 
	// 				requiresMutex: false, //x.requiresMutex,
	// 				interlock: {
	// 					state: {on: 'true'},
	// 					// state: {on: true},
	// 					locks: (x.interlocks || []).map((lock) => ({
	// 						device: lock.input.name,
	// 						deviceKey: lock.inputKey.key,
	// 						comparator: lock.comparator,
	// 						value: (lock.assertion.type == "value" ? lock.assertion.value : (lock.assertion.setpoint?.type == 'ratio' ? lock.assertion.setpoint.value : lock.assertion.setpoint?.value)),

	// 						fallback: lock.action.key
	// 					}))
	// 				}
	// 			})),
	// 			processes: []
	// 		}, {
	// 			performOperation: async (event) => {
	// 				console.log(event)
	// 			}
	// 		})

	// 		await machine.start()
	// 	})
	// })

	test('Process runs and blocks start of competing process', async () => {

		const interlock = createMutex();

		let pumpTime = 0;
		let pumpInterrupt = 0;

		const result = await new Promise(async (resolve, reject) => {
			const machine = new CommandStateMachine({
				initialState: {
					'IL-AV101': { available: !interlock.isLocked }
				},
				devices: [
					{
						name: 'AV101',
						requiresMutex: true
					}
				],
				processes: [
					{
						id: 'raw-water',
						name: 'Feed',
						nodes: [ {
								id: 'origin',
								type: 'trigger'
							},{
								id: "0.2",
								type: 'action',
								options: {
									blockType: 'action',
									actions: [
										{
											device: 'AV101',
											operation: 'open'
										}
									]
								}
							},{
								id: '0.3',
								type: 'action',
								options: {
									blockType: 'action',
									actions: [{
										device: 'PMP101',
										operation: 'start'
									}]
								}
							},{
								id: '0.4',
								type: 'timer',
								options: {
									blockType: 'timer',
									timer: 1000
								}
							},{
								id: "0.5",
								type: 'action',
								options: {
									blockType: 'action',
									actions: [{
										device: "AV101",
										release: true
									}]
								}
							}
						],
						edges: [{
								source: "origin",
								target: "0.2",

							}, {
								source: '0.2',
								target: '0.3'
							},{
								source: '0.3',
								target: '0.4'
							}, {
								source: '0.4',
								target: '0.5'
							},{
								source: '0.5',
								target: 'origin'
							}
						]
					},
					{
						id: 'water-filter',
						name: 'Filter',
						nodes: [{
								id: 'origin',
								type: 'trigger'
							}, {
								id: '0.1',
								type: 'action',
								options: {
									blockType: 'action',
									actions: [
										{
											device: 'AV101',
											operation: 'close'
										}]
								}
							},{
								id: "0.2",
								type: 'action',
								options: {
									blockType: 'action',
									actions: [
										{
											device: 'BLO701',
											operation: 'start'
										}
									]
								}
							},{
								id: "0.3",
								type: 'action',
								options: {
									blockType: 'action',
									actions: [
										{
											device: 'AV101',
											release: true
										}
									]
								}
							}
						],
						edges: [ {
								source: "origin",
								target: '0.1'
							},{
								source: "0.1",
								target: '0.2'
							},{
								source: '0.2',
								target: 'origin'
							}
						]
					}
				]
			}, {
				performOperation: async (event) => {

					if (event.device == "BLO701" && event.operation == "start") {
						pumpInterrupt = Date.now();
					}

					if (event.device == "PMP101" && event.operation == "start") {
						pumpTime = Date.now()
					}


					if (pumpInterrupt > 0 && pumpTime > 0) {
						console.log({ pumpTime }, { pumpInterrupt })
						await machine.stop()
						clearTimeout(timeout)
						resolve(pumpTime < pumpInterrupt);
					}

					if (event.device == 'IL-AV101') {
						if (event.operation == 'claim') {
							console.log('claim start', event)
							await new Promise((resolve, reject) => {
								interlock.lock(() => {
									console.log("Locked")
									machine.state?.update('IL-AV101', { available: false });

									resolve(true)

									// machine.stop()
								})
							})
							console.log('claim end', event)

						} else if (event.operation == 'release') {
							await new Promise((resolve, reject) => {
								interlock.unlock()
								console.log('released');
								resolve(true);
								machine.state?.update('IL-AV101', { available: true });
							})
						}
					}

				}
			});

			const timeout = setTimeout(() => {
				reject(new Error('Timer did not fire'))
				machine.stop()
			}, 10 * 1000)

			machine.changeMode(CommandStateMachineMode.AUTO)
			await machine.start();

			
		
		})

		expect(result).toBe(true)
	})

	// test('Process interrupts when condition goes out of sync', async () => {

	// 	const result = await new Promise((resolve, reject) => {
	// 		const machine = new CommandStateMachine({
	// 			initialState: {
	// 				LT201: { level: 12000 },
	// 				PMP101: { on: false }
	// 			},
	// 			devices: [
	// 				{
	// 					name: 'PMP101',
	// 					interlock: {
	// 						state: { on: true },
	// 						locks: [{
	// 							device: 'LT201',
	// 							deviceKey: 'level',
	// 							comparator: '>=',
	// 							value: 12000,

	// 							fallback: 'stop'
	// 						}],

	// 					}
	// 				}
	// 			],
	// 			processes: [
	// 				{
	// 					id: 'raw-water',
	// 					name: 'Feed',
	// 					nodes: {
	// 						"origin": {
	// 							id: 'origin'
	// 						},
	// 						"0.1": {
	// 							id: '0.1',
	// 							extras: {
	// 								blockType: 'action',
	// 								actions: [
	// 									{
	// 										device: 'PMP101',
	// 										operation: 'start'
	// 									}
	// 								]
	// 							}
	// 						},
	// 						"0.2": {
	// 							id: "0.2",
	// 							extras: {
	// 								blockType: 'timer',
	// 								timer: 10 * 1000
	// 							}
	// 						},
	// 						"0.3": {
	// 							id: '0.3',
	// 							extras: {
	// 								blockType: 'action',
	// 							}
	// 						}
	// 					},
	// 					links: {
	// 						link: {
	// 							source: "origin",
	// 							target: "0.1"
	// 						},
	// 						link2: {
	// 							source: '0.1',
	// 							target: '0.2'
	// 						},
	// 						link3: {
	// 							source: '0.2',
	// 							target: '0.3'
	// 						}

	// 					}
	// 				}
	// 			]
	// 		}, {
	// 			performOperation: async (event) => {
	// 				if (event.device == "PMP101" && event.operation == "start") {
	// 					machine.state.update('PMP101', { on: true })
	// 					// await machine.stop();
	// 					// resolve(true)
	// 				} else if (event.device == "PMP101" && event.operation == 'stop') {
	// 					machine.state.update('PMP101', { on: false })
	// 					resolve(true);
	// 				}
	// 			}
	// 		});

	// 		machine.start(CommandStateMachineMode.AUTO);
	// 		setTimeout(() => machine.state.update('LT201', { level: 1200 }), 5 * 1000)

	// 		setTimeout(() => reject(new Error('Timer did not fire')), 10 * 1000)
	// 	})
	// 	expect(result).toBe(true)

	// })
})

