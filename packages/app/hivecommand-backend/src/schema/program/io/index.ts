import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";

export default (prisma: PrismaClient) => {

    const typeDefs = `

        type Query {
            commandProgramDevices: [CommandProgramDevice]!
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

            createCommandProgramDevicePlugin(program: ID!, device: ID!, input: CommandProgramDevicePluginInput!): CommandProgramDevicePlugin!
            updateCommandProgramDevicePlugin(program: ID!, device: ID!, id: ID!, input: CommandProgramDevicePluginInput!): CommandProgramDevicePlugin!
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

            action: String
        }

        type CommandInterlock {
            id: ID! 

            state: [CommandInterlockState] 

            inputDevice: CommandProgramDevicePlaceholder 
            inputDeviceKey: CommandProgramDeviceState
            comparator: String

            assertion: CommandInterlockAssertion 
            
            action: CommandProgramDeviceAction

            device: CommandProgramDevicePlaceholder 
        }


        type CommandInterlockAssertion {
            id: ID! 
            type: String
            value: String
            setpoint: CommandDeviceSetpoint 
        }

        type CommandInterlockState {
            id: ID! 
            device: CommandProgramDevicePlaceholder 
            deviceKey: CommandProgramDeviceState 
            comparator: String
            assertion: CommandInterlockAssertion 

            interlock: CommandInterlock 
        }

        input CommandProgramDeviceSetpointInput {
            name: String
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

            state: [CommandProgramDeviceState]
            actions: [CommandProgramDeviceAction] 
        }


        type CommandProgramDeviceAction {
            id: ID! 
            key: String

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
    

        input CommandProgramDevicePluginInput {
            name: String
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
            requires: [CommandProgramDevicePluginConfiguration]
            value: String
            plugin: CommandProgramDevicePlugin
        }

        type CommandDevicePlugin {
            id: ID! 
            plugin: CommandProgramDevicePlugin 
            rules: CommandProgramFlow 
            configuration: [CommandKeyValue] 
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
            createCommandProgramDeviceInterlock: () => {
            },
            updateCommandProgramDeviceInterlock: () => {
            },
            deleteCommandProgramDeviceInterlock: () => {
            },
            createCommandProgramDeviceSetpoint: () => {
            },
            updateCommandProgramDeviceSetpoint: () => {
            },
            deleteCommandProgramDeviceSetpoint: () => {
            },
            createCommandProgramDevicePlugin: () => {
            },
            updateCommandProgramDevicePlugin: () => {
            },
            deleteCommandProgramDevicePlugin: () => {
            }
        }
    };

    return {
        typeDefs,
        resolvers
    }
}