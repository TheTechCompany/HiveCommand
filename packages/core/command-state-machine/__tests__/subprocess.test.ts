import { CommandStateMachine, CommandStateMachineMode } from "../src";

jest.setTimeout(20 * 1000);

describe('Subprocess as a blockType', () => {
	it('Subprocess runs waiting for conditions and completing stages', async () => {

		let subTime : number;
		let interruptTime : number;
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
								id: '0.2',
								extras: {
									blockType: 'sub-process',
									"sub-process": 'sub1'
								}
							},
							"0.3": {
								id: '0.3',
								extras: {
									blockType: 'timer',
									timer: 1000
								}
							},
							"0.4": {
								id: "0.4",
								extras: {
									blockType: 'action',
									actions: [{
										device: "AV101",
										operation: 'close'
									}]
								}
							}
						},
						sub_processes: [{
							id: 'sub1',
							name: 'Sub1',
							nodes: {
								origin: {
									id: 'origin',
									
								},
								"0.1": {
									id: '0.1',
									extras: {
										blockType: 'action',
										actions: [{device: "AV101", operation: "open"}]
									}
								},
								'0.2': {
									id: '0.2'
								}
							},
							links: {
								'0.1': {
									source: 'origin',
									target: '0.1'
								},
								'0.2': {
									source: '0.1',
									target: '0.2'
								}
								
							}
						}],
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
							}
						}
					}
				]
			}, {
				performOperation: async (event) => {
					console.log(event)
					if(event.device == "AV101"){
						if(event.operation == "open"){
							subTime = Date.now()
						}else if(event.operation == "close"){
							interruptTime = Date.now()
						}
					}

					if(subTime && interruptTime){
						machine.stop()
						resolve(subTime < interruptTime)
					}
				}
			});
	
			machine.start(CommandStateMachineMode.AUTO);
			setTimeout(() => {
				machine.stop()
				reject(new Error('Timer did not fire'))
			}, 10 * 1000)
		})

		expect(result).toBe(true)
	})
})