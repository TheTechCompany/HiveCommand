import { PrismaClient, ProgramTag, ProgramTagType } from "@hive-command/data";
import { nanoid } from "nanoid";
import { isStringType } from "../types/util";

export default (prisma: PrismaClient) => {

    const typeDefs = `
     
        
        type Mutation {
            createCommandProgramAlarm(program: ID, input: CommandProgramAlarmInput): CommandProgramAlarm
            updateCommandProgramAlarm(program: ID, id: ID!, input: CommandProgramAlarmInput): CommandProgramAlarm
            deleteCommandProgramAlarm(program: ID, id: ID!): CommandProgramAlarm

            createCommandProgramAlarmAction(program: ID, alarm: ID, input: CommandProgramAlarmActionInput): CommandProgramAlarmAction
            updateCommandProgramAlarmAction(program: ID, alarm: ID, id: ID!, input: CommandProgramAlarmActionInput): CommandProgramAlarmAction
            deleteCommandProgramAlarmAction(program: ID, alarm: ID, id: ID!): CommandProgramAlarmAction
        }

        input CommandProgramAlarmInput {
            name: String

            description: String

            conditions: JSON
        }

        type CommandProgramAlarm {
            id: ID

            name: String
            description: String

            conditions: JSON

            edges: [CommandProgramAlarmEdge]
            nodes: [CommandProgramAlarmAction]
        }

        type CommandProgramAlarmType {
            id: ID
            name: String
        }


        type CommandProgramAlarmAction {
            id: ID
            name: String

            type: CommandProgramAlarmType

            sourcedBy: [CommandProgramAlarmEdge]
            targetedBy: [CommandProgramAlarmEdge]
        }

        type CommandProgramAlarmEdge {
            id: ID

            source: CommandProgramAlarmAction
            target: CommandProgramAlarmAction
            
        }

        input CommandProgramAlarmActionInput {
            type: String

            targetedBy: String
        }

        type CommandProgramAlarmAction {
            id: ID

            type: CommandProgramAlarmType

        }
       

    `

    const resolvers = {
       
        Mutation: {
            createCommandProgramAlarm: async (root: any, args: { program: string, input: any }, context: any) => {

                const program = await prisma.program.findFirst({
                    where: {
                        id: args.program,
                        organisation: context?.jwt?.organisation
                    }
                })

                if (!program) throw new Error("Program access not allowed");
               
                
                return await prisma.programAlarm.create({

                    data: {
                        id: nanoid(),
                        name: args.input.name,
                        description: args.input.description,
                        conditions: args.input.conditions,
                        program: { 
                            connect: { 
                                id: args.program 
                            } 
                        }
                    }
                })
            },
            updateCommandProgramAlarm: async (root: any, args: { program: string, id: string, input: any }, context: any) => {
                const program = await prisma.program.findFirst({
                    where: {
                        id: args.program,
                        organisation: context?.jwt?.organisation
                    }
                })

                if (!program) throw new Error("Program access not allowed");
                
                return await prisma.programAlarm.update({
                    where: {
                        id: args.id
                    },
                    data: {
                        name: args.input.name,
                        description: args.input.description,
                        conditions: args.input.conditions
                    }
                })
            },
            deleteCommandProgramAlarm: async (root: any, args: { program: string, id: string }, context: any) => {
                const program = await prisma.program.findFirst({
                    where: {
                        id: args.id,
                        organisation: context?.jwt?.organisation
                    }
                })

                if (!program) throw new Error("Program access not allowed");

                return await prisma.programAlarm.delete({
                    where: { id: args.id }
                })
            },
            createCommandProgramAlarmAction: async (root: any, args: any, context: any) => {
                let parentUpdate = {};
                if(args.input.targetedBy){
                    parentUpdate['targetedBy'] = {
                        create: {
                            id: nanoid(),
                            alarm: {
                                connect: {
                                    id: args.alarm
                                }
                            },
                            source: {
                                connect: {
                                    id: args.input.parent
                                }
                            }
                        }
                    }
                }

                await prisma.programAlarm.update({
                    where: {
                        id: args.alarm,
                    },
                    data: {
                        nodes: {
                            create: {
                                id: nanoid(),
                                name: '',
                                type: {
                                    connect: {
                                        id: args.input.type
                                    }
                                },
                                ...parentUpdate
                            }
                        }
                    }
                })
            },
            updateCommandProgramAlarmAction: async (root: any, args: any, context: any) => {
                await prisma.programAlarm.update({
                    where: {
                        id: args.alarm
                    },
                    data: {
                        nodes: {
                            update: {
                                where: {
                                    id: args.id,
                                },
                                data: {
                                    type: {
                                        connect: {
                                            id: args.input.type
                                        }
                                    }
                                }
                            }
                        }
                    }
                })
            },
            deleteCommandProgramAlarmAction: async (root: any, args: any, context: any) => {
                await prisma.programAlarm.update({
                    where: {
                        id: args.alarm
                    },
                    data: {
                        nodes: {
                            delete: {
                                id: args.id
                            }
                        }
                    }
                })
            }

        }
    };

    return {
        typeDefs,
        resolvers
    }
}