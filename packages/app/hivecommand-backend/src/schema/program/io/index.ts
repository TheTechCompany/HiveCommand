import { PrismaClient } from "@hive-command/data";
import { nanoid } from "nanoid";

export default (prisma: PrismaClient) => {

    const typeDefs = `

        type Query {
            commandProgramDevices: [CommandProgramDevice]!
            commandProgramDevicePlugins: [CommandProgramDevicePlugin]!
        }

        type Mutation {
            createCommandProgramDevice(program: ID!, input: CommandProgramDeviceInput!): CommandProgramDevicePlaceholder!
            updateCommandProgramDevice(program: ID!, id: ID!, input: CommandProgramDeviceInput!): CommandProgramDevicePlaceholder!
            deleteCommandProgramDevice(program: ID!, id: ID!): Boolean!

            createCommandProgramDeviceInterlock(program: ID!, device: ID!, input: CommandProgramDeviceInterlockInput!): CommandInterlock!
            updateCommandProgramDeviceInterlock(program: ID!, device: ID!, id: ID!, input: CommandProgramDeviceInterlockInput!): CommandInterlock!
            deleteCommandProgramDeviceInterlock(program: ID!, device: ID!, id: ID!): Boolean!

            createCommandProgramDeviceSetpoint(program: ID!, device: ID!, input: CommandProgramDeviceSetpointInput!): CommandDeviceSetpoint!
            updateCommandProgramDeviceSetpoint(program: ID!, device: ID!, id: ID!, input: CommandProgramDeviceSetpointInput!): CommandDeviceSetpoint!
            deleteCommandProgramDeviceSetpoint(program: ID!, device: ID!, id: ID!): Boolean!

            createCommandProgramDevicePlugin(program: ID!, device: ID!, input: CommandDevicePluginInput!): CommandDevicePlugin!
            updateCommandProgramDevicePlugin(program: ID!, device: ID!, id: ID!, input: CommandDevicePluginInput!): CommandDevicePlugin!
            deleteCommandProgramDevicePlugin(program: ID!, device: ID!, id: ID!): Boolean!
        }
    
        input CommandProgramDeviceInput {
            name: String
            template: String
        }

        type CommandProgramDevicePlaceholder {
            id: ID! 
            name: String

            type: CommandProgramDevice 

            units: [CommandProgramDeviceUnit]

            requiresMutex: Boolean

            interlocks: [CommandInterlock] 
            setpoints: [CommandDeviceSetpoint] 
            plugins: [CommandDevicePlugin] 

            program: CommandProgram 
        }

        input CommandProgramDeviceInterlockInput {
            inputDevice: String
            inputDeviceKey: String
            comparator: String
            
            assertion: CommandAssertionInput

            action: String
        }

        type CommandInterlock {
            id: ID! 

            state: [CommandInterlockState] 

            inputDevice: CommandProgramDevicePlaceholder 
            inputDeviceKey: CommandProgramDeviceState
            comparator: String

            assertion: CommandAssertion 
            
            action: CommandProgramDeviceAction

            device: CommandProgramDevicePlaceholder 
        }

        input CommandAssertionInput {
            type: String
            value: String
            setpoint: String
            variable: String
        }

        type CommandAssertion {
            id: ID! 
            type: String
            value: String
            setpoint: CommandDeviceSetpoint 
            variable: CommandProgramVariable
        }

        type CommandInterlockState {
            id: ID! 
            device: CommandProgramDevicePlaceholder 
            deviceKey: CommandProgramDeviceState 
            comparator: String
            assertion: CommandAssertion 

            interlock: CommandInterlock 
        }

        input CommandProgramDeviceSetpointInput {
            name: String
            key: String
            type: String
            value: String
        }

        type CommandDeviceSetpoint {
            id: ID! 
            name: String
            key: CommandProgramDeviceState 
            type: String
            value: String
        }


        type CommandProgramDevice {
            id: ID! 
            name: String
            type: String

            usedIn: [CommandProgramDevicePlaceholder]

            config: [CommandProgramDeviceConfiguration]

            state: [CommandProgramDeviceState]
            actions: [CommandProgramDeviceAction] 
        }

        type CommandProgramDeviceConfiguration {
            id: ID
            key: String
            type: String
        }


        type CommandProgramDeviceAction {
            id: ID! 
            key: String
            func: String

            device: CommandProgramDevice 

        }

        type CommandProgramDeviceState {
            id: ID! 
            key: String
            type: String
            
            inputUnits: String
            units: String

            writable: Boolean

            min: String
            max: String

            device: CommandProgramDevice
        }
    

       
        type CommandProgramDevicePlugin {
            id: ID! 
            name: String
            compatibility: [CommandProgramDevicePluginCompatibility] 
            config: [CommandProgramDevicePluginConfiguration] 
            tick: String
        }
    
        type CommandProgramDevicePluginCompatibility {
            id: ID! 
            name: String
        }
    
        type CommandProgramDevicePluginConfiguration {
            id: ID! 
            key: String
            type: String
            
            order: Int

            requires: [CommandProgramDevicePluginConfiguration]
            value: String
            plugin: CommandProgramDevicePlugin
        }

        input CommandDevicePluginConfigurationInput {
            id: ID
            key: String
            value: String
        }

        input CommandDevicePluginInput {
            plugin: String
            rules: String
            config: [CommandDevicePluginConfigurationInput]
        }

        type CommandDevicePlugin {
            id: ID! 
            plugin: CommandProgramDevicePlugin 
            rules: CommandProgramFlow 
            config: [CommandDevicePluginConfiguration] 
        }

        type CommandDevicePluginConfiguration {
            id: ID
            key: CommandProgramDevicePluginConfiguration
            value: String
        }

    
        type CommandProgramDeviceUnit {
            id: ID! 

            inputUnit: String
            displayUnit: String
            
            state: CommandProgramDeviceState 
            device: CommandProgramDevicePlaceholder 
        }

    `

    const resolvers = {
        Query: {
            commandProgramDevices: async (parent: any, args: any, context: any, info: any) => {
                return await prisma.iOTemplate.findMany();
            },
            commandProgramDevicePlugins: async (parent: any, args: any, context: any, info: any) => {
                return await prisma.iOPluginTemplate.findMany({
                    include: {
                        config: {
                            include: {
                                requires: true
                            }
                        },
                        
                    }
                });
            }
        },
        Mutation: {
            createCommandProgramDevice: async (root: any, args: any) => {
                return await prisma.programFlowIO.create({
                    data: {
                        id: nanoid(),
                        name: args.input.name,
                        type: {
                            connect: {id: args.input.template}
                        },
                        program: {
                            connect: {id: args.program}
                        }
                    }
                })
            },
            updateCommandProgramDevice: async (root: any, args: any) => {
                return await prisma.programFlowIO.update({
                    where: {
                        id: args.id
                    },
                    data: {
                        name: args.input.name,
                        type: {
                            connect: {id: args.input.template}
                        }
                    }
                })
            },
            deleteCommandProgramDevice: async (root: any, args: any) => {
                const res = await prisma.programFlowIO.delete({where: {id: args.id}})
                return res != null;
            },
            createCommandProgramDeviceInterlock: async (root: any, args: any) => {
                let assertionUpdate : any = {};
                
                let assertionType = args.input.assertion.type.toLowerCase();

                if (assertionType == "setpoint") {
                    assertionUpdate = {
                        setpoint: {
                            connect: {id: args.input.assertion.setpoint}
                        }
                    }
                } else if (assertionType == "variable") {
                    assertionUpdate = {
                        variable: {
                            connect: {id: args.input.assertion.variable}
                        }
                    }

                } else if (assertionType == "value") {
                    assertionUpdate = {
                        value: args.input.assertion.value
                    }
                }

                return await prisma.programInterlock.create({
                    data: {
                        id: nanoid(),
                        inputDevice: {
                            connect: {id: args.input.inputDevice}
                        },
                        inputDeviceKey: {
                            connect: {id: args.input.inputDeviceKey}
                        },
                        comparator: args.input.comparator,
                        assertion: {
                            create: {
                                id: nanoid(),
                                type: args.input.assertion.type,
                                ...assertionUpdate
                            }
                        },
                        action: {
                            connect: {id: args.input.action}
                        },
                        device: {
                            connect: {id: args.device}
                        }
                    }
                })
            },
            updateCommandProgramDeviceInterlock: async (root: any, args: any) => {
                let assertionUpdate : any = {};
                
                let assertionType = args.input.assertion.type.toLowerCase();

                if (assertionType == "setpoint") {
                    assertionUpdate = {
                        setpoint: {
                            connect: {id: args.input.assertion.setpoint}
                        },
                        variable: {
                            disconnect: true
                        },
                        value: undefined
                    }
                } else if (assertionType == "variable") {
                    assertionUpdate = {
                        variable: {
                            connect: {id: args.input.assertion.variable}
                        },
                        setpoint: {
                            disconnect: true
                        },
                        value: undefined
                    }

                } else if (assertionType == "value") {
                    assertionUpdate = {
                        value: args.input.assertion.value,
                        variable: {
                            disconnect: true
                        },
                        setpoint: {
                            disconnect: true
                        }
                    }
                }

                return await prisma.programInterlock.update({
                    where: {id: args.id},
                    data: {
                        inputDevice: {
                            connect: {id: args.input.inputDevice}
                        },
                        inputDeviceKey: {
                            connect: {id: args.input.inputDeviceKey}
                        },
                        comparator: args.input.comparator,
                        assertion: {
                            update: {
                                type: args.input.assertion.type,
                                ...assertionUpdate
                            }
                        },
                        action: {
                            connect: {id: args.input.action},
                        }
                    }
                })
            },
            deleteCommandProgramDeviceInterlock: async (root: any, args: any) => {
                return await prisma.programInterlock.delete({where: {id: args.id}});
            },
            createCommandProgramDeviceSetpoint: async (root: any, args: any, context: any) => {
                return await prisma.programSetpoint.create({
                    data: {
                        id: nanoid(),
                        name: args.input.name,
                        key: {connect: {id: args.input.key}},
                        type: args.input.type,
                        value: args.input.value,
                        device: {
                            connect: {id: args.device}
                        }
                    }
                })
            },
            updateCommandProgramDeviceSetpoint: async (root: any, args: any, context: any) => {
                return await prisma.programSetpoint.update({
                    where: {
                        id: args.id
                    },
                    data: {
                        name: args.input.name,
                        key: {connect: {id: args.input.key}},
                        type: args.input.type,
                        value: args.input.value,
                        device: {
                            connect: {id: args.device}
                        }
                    }
                })
            },
            deleteCommandProgramDeviceSetpoint: async (root: any, args: any) => {
                return await prisma.programSetpoint.delete({where: {id: args.id}})
            },
            createCommandProgramDevicePlugin: async (root: any, args: any, context: any) => {
                let rulesInput : any = {};

                if(args.input.rules){
                    rulesInput.rules = {connect: {id: args.input.rules}}
                }
                return await prisma.iOPlugin.create({
                    data: {
                        id: nanoid(),
                        ...rulesInput,
                        plugin: {
                            connect: {
                                id: args.input.plugin
                            }
                        },
                        config: {
                            createMany: {
                                data: args.input.config.map((config: any) => {
                                    return {
                                        id: nanoid(),
                                        configId: config.key,
                                        value: config.value
                                    }  
                                })
                            }
                        },
                        device: {
                            connect: {id: args.device}
                        }
                    }
                })
            },
            updateCommandProgramDevicePlugin: async (root: any, args: any, context: any) => {
                let rulesInput : any = {};

                if(args.input.rules){
                    rulesInput.rules = {connect: {id: args.input.rules}}
                }
                return await prisma.iOPlugin.update({
                    where: {id: args.id},
                    data: {
                        ...rulesInput,
                        plugin: {
                            connect: { id: args.input.plugin }
                        },
                        config: {
                            // updateMany: [{where: }] ,
                            updateMany: args.input.config.map((config: any) => ({
                                where: {
                                    configId: config.key
                                },
                                data: {
                                    value: config.value
                                }
                            }))
                        }
                    }
                })
            },
            deleteCommandProgramDevicePlugin: async (root: any, args: any, context: any) => {
                return await prisma.iOPlugin.delete({where: {id: args.id}})
            }
        }
    };

    return {
        typeDefs,
        resolvers
    }
}