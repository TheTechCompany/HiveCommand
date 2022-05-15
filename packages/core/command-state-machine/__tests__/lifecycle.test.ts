import { CommandStateMachine, CommandStateMachineMode } from "../src"

jest.setTimeout(15000)

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

    it('Restarts', async () => {
        const result = await new Promise((resolve, reject) => {
            let firstPass = true;

            let pumpCounter = 0;

            const sm = new CommandStateMachine({
                devices: [{
                    name: 'PMP101',
                    actions: [{key: 'Start', func: `setState({starting: true}); requestState({speed: 0}); await new Promise((resolve, reject) => setTimeout(() => resolve(true), 2 * 1000)); setState({starting: false, on: true});`}, {key: 'Stop', func: `setState({starting: true}); requestState({speed: 0}); await new Promise((resolve, reject) => setTimeout(() => resolve(true), 2 * 1000)); setState({starting: false, on: false});`}]
                }, {
                    name: 'PMP201',
                    actions: [{key: 'Start', func: `setState({starting: true}); requestState({speed: 0}); await new Promise((resolve, reject) => setTimeout(() => resolve(true), 2 * 1000)); setState({starting: false, on: true});`}, {key: 'Stop', func: `setState({starting: true}); requestState({speed: 0}); await new Promise((resolve, reject) => setTimeout(() => resolve(true), 2 * 1000)); setState({starting: false, on: false});`}]
                }, {
                    name: 'PMP301',
                    actions: [{key: 'Start', func: `setState({starting: true}); requestState({speed: 0}); await new Promise((resolve, reject) => setTimeout(() => resolve(true), 2 * 1000)); setState({starting: false, on: true});`}, {key: 'Stop', func: `setState({starting: true}); requestState({speed: 0}); await new Promise((resolve, reject) => setTimeout(() => resolve(true), 2 * 1000)); setState({starting: false, on: false});`}]
                }],
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
                                id: 'trigger',
                                type: 'trigger',
                            },
                            {
                                id: 'relax',
                                type: 'sub-process',
                                options: {
                                    blockType: 'sub-process',
                                    "sub-process": "relax"
                                }
                            },
                            {
                                id: 'perm',
                                type: 'sub-process',
                                options: {
                                    blockType: 'sub-process',
                                    "sub-process": "permeate"
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
                                source: 'trigger',
                                target: 'relax',
                            },
                            {
                                source: 'relax',
                                target: 'perm',
                            },
                            {
                                source: 'perm',
                                target: 'relax',
                            }
                        ],
                        sub_processes: [
                            {
                                id: 'relax',
                                name: 'Relax',
                                nodes: [
                                    {
                                        id: 'relax-origin',
                                        type: 'trigger',
                                    },
                                    {
                                        id: 'relax-action',
                                        type: 'action',
                                        options: {
                                            blockType: 'action',
                                            actions: [{device: 'PMP201', operation: 'Start'}]
                                        }
                                    }
                                ],
                                edges: [
                                    {
                                        source: 'relax-origin',
                                        target: 'relax-action',
                                    }
                                ]
                            },
                            {
                                id: "permeate",
                                name: "Permeate",
                                nodes: [
                                    {
                                        id: 'perm-origin',
                                        type: 'trigger',
                                    },
                                    {
                                        id: 'perm-action',
                                        type: 'action',
                                        options: {
                                            blockType: 'action',
                                            actions: [{device: 'PMP201', operation: 'Start'}]
                                        }
                                    }
                                ],
                                edges: [
                                    {
                                        source: 'perm-origin',
                                        target: 'perm-action',
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }, {
                requestState: async ({device, state}) => {
                    if(device == "PMP201"){
                        pumpCounter++;
                        console.log("PUMP IT", pumpCounter, firstPass)

                        if(pumpCounter == 1 && !firstPass){
                            await sm.stop()
                        }

                        if(pumpCounter == 2 && !firstPass){
                            await sm.stop()

                            resolve(true)
                        }   
                    }
                    console.log({device, state})
                }
            })

            sm.changeMode(CommandStateMachineMode.AUTO)

            sm.on('started', async () => {
                // console.log("Test Stopping")
                if(firstPass) {
                    // await sm.stop();
                    firstPass = false;
                }
                // console.log("Test stopped")
            })

            sm.on('transition', (transition) => {
                console.log({transition})
            })

            sm.on('stopped', () => {
                sm.changeMode(CommandStateMachineMode.AUTO)
                sm.reload()
                sm.start()
                // const r = sm.changeMode(CommandStateMachineMode.MANUAL)

                // console.log({r})
                // resolve(!(r instanceof Error) && true)
            })
            sm.start()
        })
        expect(result).toBe(true)

    })

})