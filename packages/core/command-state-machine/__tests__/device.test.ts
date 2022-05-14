import { CommandStateMachine, CommandStateMachineMode } from '../src'
// import { StateDevice } from '../src/device'
import PIDPlugin from './pid-plugin'

// const commandClient = {
// 	requestState: async (ev: any) => {
// 		machine.state?.update(ev.device, ev.state)
// 		console.log(ev)
// 	}
// }
// const machine = new CommandStateMachine({
// 	processes: [],
// 	initialState: {
// 		FIT101: {
// 			flow: 0
// 		},
// 		PMP101: {
// 			speed: 0
// 		}
// 	}
// }, commandClient)

// const device = new StateDevice({
// 	name: 'PMP101',
// 	state: [{key: 'on', type: 'boolean'}],
// 	actions: [],
// 	plugins: [{
// 		classString: PIDPlugin,
// 		imports: [{key: 'PIDController', module: 'node-pid-controller'}],
// 		options: {
// 			p: 0.5,
// 			i: 0.01,
// 			d: 0.01,
// 			target: 12,
// 			targetDevice: 'FIT101',
// 			targetDeviceField: 'flow'
// 		},
// 		actions: [{key: 'start', func: 'start'}, {key: 'stop', func: 'stop'}]
// 	}]
// }, machine, commandClient)

// device.performOperation('start')

// setTimeout(() => device.performOperation('stop'), 2000)



describe("State Device", () => {
	it('Device has multiple PID controllers for different stages', async () => {

		const machine = new CommandStateMachine({
			initialState: {
				'PMP101': {
					speed: 0
				},
				'FIT101': {
					flow: 0
				}
			},
			processes: [
				{
					id: 'root',
					name: "Root",
					nodes: [{
						id: 'origin',
						type: 'trigger'
					}, {
						id: 'stage1',
						type: 'sub-process',
						options: {
							"sub-process": 'raw-water'
						}
					}, {
						id: 'stage2',
						type: 'sub-process',
						options: {
							"sub-process": 'filtered-water'
						}
					}],
					edges: [{
						source: 'origin',
						target: 'stage1'
					}, {
						source: 'stage1',
						target: 'stage2'
					}],
					sub_processes: [
						{
							id: 'raw-water',
							name: "Raw Water",
							nodes: [
								{
									id: 'origin',
									type: 'trigger'
								},
								{
									id: 'pump',
									type: 'action',
									options: {
										blockType: 'action',
										actions: [{
											device: 'PMP101',
											operation: 'start'
										}]
									}
								},
								{
									id: 'stop',
									type: 'action',
									options: {
										blockType: 'action',
										actions: [{
											device: 'PMP101',
											operation: 'stop'
										}]
									}
								}
							],
							edges: [
								{
									source: 'origin',
									target: 'pump',
								},
								{
									source: 'pump',
									target: 'stop'
								}
							]
						},
						{
							id: 'filtered-water',
							name: "Filtered Water",
							nodes: [{
								id: 'origin',
								type: 'trigger'
							}, {
								id: 'pump',
								type: 'action',
								options: {
									blockType: 'action',
									actions: [{
										device: 'PMP101',
										operation: 'start'
									}]
								}
							}, 
								{
									id: 'stop',
									type: 'action',
									options: {
										blockType: 'action',
										actions: [{
											device: 'PMP101',
											operation: 'stop'
										}]
									}
								}
							],
							edges: [{
								source: 'origin',
								target: 'pump',
							}, {
								source: 'pump',
								target: 'stop'
							}]
						}
					]
				}
			],
			devices: [
				{
					name: "PMP101",
					plugins: [
						{
							classString: PIDPlugin,
							imports: [{key: 'PIDController', module: 'node-pid-controller'}],
							options: {
								p: 0.5,
								i: 0.01,
								d: 0.01,
								target: 12,
								targetDevice: 'FIT101',
								targetDeviceField: 'flow'
							},
							actions: [{key: 'start', func: 'start'}, {key: 'stop', func: 'stop'}],
							activeWhen: `raw-water`
						},
						{
							classString: PIDPlugin,
							imports: [{key: 'PIDController', module: 'node-pid-controller'}],
							options: {
								p: 0.5,
								i: 0.01,
								d: 0.01,
								target: 3,
								targetDevice: 'FIT101',
								targetDeviceField: 'flow'
							},
							actions: [{key: 'start', func: 'start'}, {key: 'stop', func: 'stop'}],
							activeWhen: `filtered-water`
						}
					]
				}
			]
		}, {
			requestState: async (event) => {
			console.log("Request State", event)
			}
		})

		machine.on('transition', (event) => {
			console.log(event)	
		})

		machine.changeMode(CommandStateMachineMode.AUTO)

		await machine.start()

	})
})