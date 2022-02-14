import { CommandStateMachine, CommandStateMachineMode } from "../src"

describe("Lifecycle events", () => {
    
    it('Starts', async () => {
        const result = await new Promise((resolve) => {
            const sm = new CommandStateMachine({
                processes: [
                    {
                        id: 'process1',
                        name: "Process 1",
                        nodes: [
                            {
                                id: 'origin',
                                type: 'trigger',
                            },
                            {
                                id: 'action',
                                type: 'action',
                                options: {
                                    blockType: 'action',
                                    actions: [{device: 'PMP101', operation: 'Start'}]                    
                                }
                            }
                        ],
                        edges: [
                            {
                                source: 'origin',
                                target: 'action',
                            }
                        ]
                    }
                ]
            }, {
                requestState: async ({device, state}) => {
                    console.log({device, state})
                }
            })
            
            sm.changeMode(CommandStateMachineMode.AUTO)

            sm.on('started', () => {
                resolve(true)
            })
            sm.start()
        })
        expect(result).toBe(true)
    })

    it('Stops', async () => {
        const result = await new Promise((resolve, reject) => {
            const sm = new CommandStateMachine({
                processes: [
                    {
                        id: 'process1',
                        name: "Process 1",
                        nodes: [
                            {
                                id: 'origin',
                                type: 'shutdown',
                            },
                            {
                                id: 'action',
                                type: 'action',
                                options: {
                                    blockType: 'action',
                                    actions: [{device: 'PMP101', operation: 'Start'}]                    
                                }
                            },
                            {
                                id: 'action2',
                                type: 'action',
                                options: {
                                    blockType: 'action',
                                    actions: []
                                }
                            },
                            {
                                id: 'trig-origin',
                                type: 'trigger',
                            },
                            {
                                id: 'trig-action',
                                type: 'action',
                                options: {
                                    blockType: 'action',
                                    actions: [{device: 'PMP301', operation: 'Start'}]                    
                                }
                            }
                        ],
                        edges: [
                            {
                                source: 'origin',
                                target: 'action',
                            },
                            {
                                source: 'action',
                                target: 'action2',
                            },
                            {
                                source: 'trig-origin',
                                target: 'trig-action',
                            }
                        ]
                    }
                ]
            }, {
                requestState: async ({device, state}) => {
                    console.log({device, state})
                }
            })

            sm.changeMode(CommandStateMachineMode.AUTO)

            sm.on('started', async () => {
                console.log("Test Stopping")
                await sm.stop();
                console.log("Test stopped")
            })

            sm.on('stopped', () => {
                const r = sm.changeMode(CommandStateMachineMode.MANUAL)

                console.log({r})
                resolve(!(r instanceof Error) && true)
            })
            sm.start()
        })
        expect(result).toBe(true)

    })

})