'use strict';

import {CommandStateMachine, CommandStateMachineMode} from '../src'

jest.setTimeout(20000);

describe('Transition Events', () => {

	// test('Movement between nodes provides conditions and relevant state', () => {

	// })

	test('Movement between nodes triggers listener', async () => {

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
						nodes: [
							{
								id: 'origin',
								type: 'trigger'
							},
							{
								id: '0.1',
								type: 'action',
								options: {
									blockType: 'action',
									actions: [
										{
											device: 'PMP101',
											operation: 'start'
										}
									]
								}
							},
							{
								id: "0.2",
								type: 'action',
								options: {
									blockType: 'timer',
									actions: [
										{
											device: 'PMP201',
											operation: "stop"
										}
									]
								}
							}
						],
						edges: [
							{
								source: "origin",
								target: "0.1"
							},
							{
								source: '0.1',
								target: '0.2'
							}
						]
					}
				]
			}, {
				requestState: async (event) => {
					
				}
			});
	
			machine.changeMode(CommandStateMachineMode.AUTO)
			
			machine.on('transition', (ev) => {
				console.log("transition", ev)
				machine.stop()
				resolve(true)
			})
			
			machine.start();

			// setTimeout(() => machine.state.update('LT201', {level: 1200}), 5 * 1000)

			const timeout = setTimeout(() => reject(new Error('Timer did not fire')), 10 * 1000)
		})
		
		expect(result).toBe(true)

	})
})

