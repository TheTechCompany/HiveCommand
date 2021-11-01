import {CommandStateMachine} from '../src'

const machine = new CommandStateMachine({
	processes: [
		{
			id: 'raw-water',
			name: 'Feed',
			nodes: {
				"origin": {
					id: 'origin'
				},
				"0.1": {
					id: "0.1",
					extras: {
						blockType: "action",
						actions: [
							{
								device: "AV101",
								operation: "start"
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
					source: "0.1",
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
		console.log("perform op", event)
	}
});

(async () => {
	machine.start()
})()