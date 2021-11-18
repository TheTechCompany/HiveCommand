'use strict';

import {CommandStateMachine, CommandStateMachineMode} from '../src'
import locks from 'locks'

jest.setTimeout(20000);

describe('Conditional Paths', () => {

	// test('Process forks into petrinet', () => {

	// })

	test('Process follows only the path with valid conditions', async () => {

		const result = await new Promise((resolve, reject) => {

			let isTrue = false;

			const machine = new CommandStateMachine({
				initialState: {
					CT301: {conductivity: 1900},
					PMP101: {on: false},
					PMP201: {on: false}
				},
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
									actions: [
										{
											device: 'PMP201',
											operation: "stop"
										}
									]
								}
							},
							'0.2.2': {
								id: '0.2.2',
								extras: {
									blockType: 'action',
									actions: [
										{
											device: 'PMP101',
											operation: 'stop'
										}
									]
								}
							},
							"0.3": {
								id: '0.3',
								extras: {
									blockType: 'action',
									actions: [{
										device: 'PMP201',
										operation: 'start'
									}]
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
								target: '0.2',
								extras: {
									conditions: [
										{
											input: 'CT301',
											inputKey: 'conductivity',
											comparator: '>',
											value: 2000
										}
									]
								}
							},
							link3: {
								source: '0.1',
								target: '0.2.2',
								extras: {
									conditions: [
										{
											input: 'CT301',
											inputKey: "conductivity",
											comparator: '<',
											value: 2000
										}
									]
								}
							},
							link4: {
								source: '0.2',
								target: '0.3'
							},
							link5: {
								source: '0.2.2',
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
					}
					
					if(event.device == "PMP201" && event.operation == "stop") {
						resolve(false);
					}

					if(event.device == "PMP101" && event.operation == 'stop'){
						
						// machine.state.update('PMP101', {on: false})
						setTimeout(() => resolve(true), 3000);
					}
				}
			});
	
			machine.start(CommandStateMachineMode.AUTO);
			// setTimeout(() => machine.state.update('LT201', {level: 1200}), 5 * 1000)

			setTimeout(() => reject(new Error('Timer did not fire')), 10 * 1000)
		})
		
		expect(result).toBe(true)

	})
})

