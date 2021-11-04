'use strict';

import {CommandStateMachine, CommandStateMachineMode} from '../src'


jest.setTimeout(20000);

describe('State Machine Timers', () => {

	test('Timer runs and blocks until completion', async () => {

		const result = await new Promise((resolve, reject) => {
			const machine = new CommandStateMachine({
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
									blockType: 'timer',
									timer: 2 * 1000
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
							}
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
							links4: {
								source: '0.3',
								target: 'origin'
							}
						}
					}
				]
			}, {
				performOperation: async (event) => {
					if(event.device == "AV101" && event.operation == "open") {
						await machine.stop();
						resolve(true)
					}
				}
			});
	
			machine.start(CommandStateMachineMode.AUTO);
			setTimeout(() => reject(new Error('Timer did not fire')), 10 * 1000)
		})
		expect(result).toBe(true)

	})
})

