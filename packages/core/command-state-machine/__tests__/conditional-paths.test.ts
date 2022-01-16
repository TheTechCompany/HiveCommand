'use strict';

import {CommandStateMachine, CommandStateMachineMode} from '../src'
import pidPlugin from './pid-plugin';

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
					PMP101: {on: false, speed: 0},
					PMP201: {on: false, speed: 0}
				},
				devices: [
					{
						name: 'PMP101',
						plugins: [
							{
								classString: pidPlugin,
								imports: [{key: 'PIDController', module: 'node-pid-controller'}],
								options: {
									p: 0.5,
									i: 0.01,
									d: 0.01,
									targetDevice: 'CT301',
									targetDeviceField: 'conductivity',
									target: 1700
								},
								actions: [{key: 'start', func: 'start'}, {key: 'stop', func: 'stop'}]
							}
						]
					},
					{
						name: 'PMP201',
						plugins: [
							{
								classString: pidPlugin,
								imports: [{key: 'PIDController', module: 'node-pid-controller'}],
								options: {
									p: 0.5,
									i: 0.01,
									d: 0.01,
									targetDevice: 'CT301',
									targetDeviceField: 'conductivity',
									target: 1700
								},
								actions: [{key: 'start', func: 'start'}, {key: 'stop', func: 'stop'}]
							}
						]
					},
					{
						name: "CT301"
					}
				],
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
							},
							{
								id: '0.2.2',
								type: 'action',
								options: {
									blockType: 'action',
									actions: [
										{
											device: 'PMP101',
											operation: 'stop'
										}
									]
								}
							},
							{
								id: '0.3',
								type: 'action',
								options: {
									blockType: 'action',
									actions: [{
										device: 'PMP201',
										operation: 'start'
									}]
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
								target: '0.2',
								options: {
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
							{
								source: '0.1',
								target: '0.2.2',
								options: {
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
							{
								source: '0.2',
								target: '0.3'
							},
							{
								source: '0.2.2',
								target: '0.3'
							}
						]
					}
				]
			}, {
				requestState: async (event) => {
					console.log({event})

					if(event.device == "PMP101") {
						machine.state?.update('PMP101', event.state)
						// await machine.stop();
						// resolve(true)
					}
					
					if(event.device == "PMP201") {
						resolve(false);
					}

					if(event.device == "PMP101" && event.state.speed == 0){
						await machine.stop()
						// machine.state.update('PMP101', {on: false})
						clearTimeout(timeout)
						setTimeout(() => resolve(true), 3000);
					}
				}
			});
	
			machine.changeMode(CommandStateMachineMode.AUTO)
			machine.start();
			// setTimeout(() => machine.state.update('LT201', {level: 1200}), 5 * 1000)

			const timeout = setTimeout(() => reject(new Error('Timer did not fire')), 10 * 1000)
		})
		
		expect(result).toBe(true)

	})
})

