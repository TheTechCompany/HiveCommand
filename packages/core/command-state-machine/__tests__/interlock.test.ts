'use strict';

import {CommandStateMachine, CommandStateMachineMode} from '../src'
import locks from 'locks'

jest.setTimeout(20000);

describe('Interlock Machine', () => {
	test('Process runs and blocks start of competing process', async () => {

		const interlock = locks.createMutex();

		let pumpTime = 0;
		let pumpInterrupt = 0;

		const result = await new Promise((resolve, reject) => {
			const machine = new CommandStateMachine({
				initialState: {
					'IL-AV101': {available: !interlock.isLocked}
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
						nodes: {
							"origin": {
								id: 'origin'
							},
							"0.2": {
								id: "0.2",
								extras: {
									blockType: 'action',
									actions: [
										{
											device: 'AV101',
											operation: 'open'
										}
									]
								}
							},
							"0.3": {
								id: '0.3',
								extras: {
									blockType: 'action',
									actions: [{
										device: 'PMP101',
										operation: 'start'
									}]
								}
							},
							"0.4": {
								id: '0.4',
								extras: {
									blockType: 'timer',
									timer: 1000
								}
							},
							"0.5": {
								id: "0.5",
								extras: {
									blockType: 'action',
									actions: [{
										device: "AV101",
										release: true
									}]
								}
							}
						},
						links: {
							link: {
								source: "origin",
								target: "0.2",
								
							},
							link3: {
								source: '0.2',
								target: '0.3'
							},
							link4: {
								source: '0.3',
								target: '0.4'
							},
							links5: {
								source: '0.4',
								target: '0.5'
							},
							links6: {
								source: '0.5',
								target: 'origin'
							}
						}
					},
					{
						id: 'water-filter',
						name: 'Filter',
						nodes: {
							origin: {
								id: 'origin'
							},
							"0.1": {
								id: '0.1',
								extras: {
									blockType: 'action',
									actions: [
										{
										device: 'AV101',
										operation: 'close'
									}]
								}
							},
							"0.2": {
								id: "0.2",
								extras: {
									blockType: 'action',
									actions: [
										{
											device: 'BLO701',
											operation: 'start'
										}
									]
								}
							},
							"0.3": {
								id: "0.3",
								extras: {
									blockType: 'action',
									actions: [
										{
											device: 'AV101',
											release: true
										}
									]
								}
							}
						},
						links: {
							link: {
								source: "origin",
								target: '0.1'
							},
							link2: {
								source: "0.1",
								target: '0.2'
							},
							link3: {
								source: '0.2',
								target: 'origin'
							}
						}
					}
				]
			}, {
				performOperation: async (event) => {

					if(event.device == "BLO701" && event.operation == "start"){
						pumpInterrupt = Date.now();
					}

					if(event.device == "PMP101" && event.operation == "start"){
						pumpTime = Date.now()
					}


					if(pumpInterrupt > 0 && pumpTime > 0){
						console.log({pumpTime}, {pumpInterrupt})
						resolve(pumpTime < pumpInterrupt);
					}
					
					if(event.device == 'IL-AV101'){
						if(event.operation == 'claim'){
							console.log('claim start', event)
							await new Promise((resolve, reject) => {
								interlock.lock(() => {
									console.log("Locked")
									machine.state.update('IL-AV101', {available: false});

									resolve(true)
								})
							})
							console.log('claim end', event)

						}else if(event.operation == 'release'){
							await new Promise((resolve, reject) => {
								interlock.unlock()
								console.log('released');
								resolve(true);
								machine.state.update('IL-AV101', {available: true});
							})
						}
					}
			
				}
			});
	
			machine.start(CommandStateMachineMode.AUTO);
			setTimeout(() => reject(new Error('Timer did not fire')), 10 * 1000)
		})

		expect(result).toBe(true)
	})

	test('Process interrupts when condition goes out of sync', async () => {

		const result = await new Promise((resolve, reject) => {
			const machine = new CommandStateMachine({
				initialState: {
					LT201: {level: 12000},
					PMP101: {on: false}
				},
				devices: [
					{
						name: 'PMP101',
						interlock: {
							state: {on: true},
							locks: [{
								device: 'LT201',
								deviceKey: 'level',
								comparator: '>=',
								value: 12000,

								fallback: 'stop'
							}],
						
						}
					}
				],
				processes: [
					{
						id: 'raw-water',
						name: 'Feed',
						nodes: {
							"origin": {
								id: 'origin'
							},
							"0.1": {
								id: '0.1',
								extras: {
									blockType: 'action',
									actions: [
										{
											device: 'PMP101',
											operation: 'start'
										}
									]
								}
							},
							"0.2": {
								id: "0.2",
								extras: {
									blockType: 'timer',
									timer: 10 * 1000
								}
							},
							"0.3": {
								id: '0.3',
								extras: {
									blockType: 'action',
								}
							}
						},
						links: {
							link: {
								source: "origin",
								target: "0.1"
							},
							link2: {
								source: '0.1',
								target: '0.2'
							},
							link3: {
								source: '0.2',
								target: '0.3'
							}
							
						}
					}
				]
			}, {
				performOperation: async (event) => {
					if(event.device == "PMP101" && event.operation == "start") {
						machine.state.update('PMP101', {on: true})
						// await machine.stop();
						// resolve(true)
					}else if(event.device == "PMP101" && event.operation == 'stop'){
						machine.state.update('PMP101', {on: false})
						resolve(true);
					}
				}
			});
	
			machine.start(CommandStateMachineMode.AUTO);
			setTimeout(() => machine.state.update('LT201', {level: 1200}), 5 * 1000)

			setTimeout(() => reject(new Error('Timer did not fire')), 10 * 1000)
		})
		expect(result).toBe(true)

	})
})

