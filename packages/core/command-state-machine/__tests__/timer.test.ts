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
				],
				devices: [{
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
					if(event.device == "AV101" && event.state == true) {
						await machine.stop();
						clearTimeout(timeout)
						// machine.stop()
						resolve(true)
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

