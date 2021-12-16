'use strict';

import {CommandStateMachine, CommandStateMachineMode} from '../src'


jest.setTimeout(20000);

describe('State Machine Timers', () => {

	test('Timer runs and blocks until completion', async () => {

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
								type: 'timer',

								options: {
									blockType: 'timer',
									timer: 1 * 1000
								}
							}, {
								id: '0.3',
								type: 'action',
								options: {
									blockType: 'action',
									actions: [{
										device: 'AV101',
										operation: 'open'
									}]
								}
							}
						],
						edges: [{
								source: "origin",
								target: "0.2"
							},{
								source: '0.2',
								target: '0.3'
							}, {
								source: '0.3',
								target: 'origin'
							}
						]
					}
				]
			}, {
				performOperation: async (event) => {
					console.log(event)
					if(event.device == "AV101" && event.operation == "open") {
						await machine.stop();
						clearTimeout(timeout)
						// machine.stop()
						resolve(true)
					}
				}
			});
	
			await machine.start(CommandStateMachineMode.AUTO);
			const timeout = setTimeout(() => {
				machine.stop()
				reject(new Error('Timer did not fire'))
			}, 10 * 1000)
		})
		expect(result).toBe(true)

	})
})

