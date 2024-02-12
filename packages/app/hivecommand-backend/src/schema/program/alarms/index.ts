import { PrismaClient, ProgramTag, ProgramTagType } from "@hive-command/data";
import { nanoid } from "nanoid";
import { isStringType } from "../types/util";
import { LexoRank } from "lexorank";

export default (prisma: PrismaClient) => {

    const typeDefs = `
     
        
        type Mutation {
            createCommandProgramAlarm(program: ID, input: CommandProgramAlarmInput): CommandProgramAlarm
            updateCommandProgramAlarm(program: ID, id: ID!, input: CommandProgramAlarmInput): CommandProgramAlarm
            deleteCommandProgramAlarm(program: ID, id: ID!): CommandProgramAlarm

            createCommandProgramAlarmSeverity(program: ID, input: CommandProgramAlarmSeverityInput): CommandProgramAlarmSeverity
            updateCommandProgramAlarmSeverity(program: ID, id: ID!, input: CommandProgramAlarmSeverityInput): CommandProgramAlarmSeverity
            updateCommandProgramAlarmSeverityOrder(program: ID, id: ID!, above: ID, below: ID): CommandProgramAlarmSeverity
            deleteCommandProgramAlarmSeverity(program: ID, id: ID!): CommandProgramAlarmSeverity
        }

        input CommandProgramAlarmInput {
            title: String

            message: String

            severityId: String

            conditions: JSON
        }

        type CommandProgramAlarm {
            id: ID

            title: String
            message: String

            severity: CommandProgramAlarmSeverity

            rank: String

            conditions: JSON

            createdAt: DateTime

        }

        input CommandProgramAlarmSeverityInput {
            title: String
            nodes: JSON
            edges: JSON
        }

        type CommandProgramAlarmSeverity {
            id: ID
            title: String
            rank: String

            nodes: JSON
            edges: JSON

            usedByAlarm: [CommandProgramAlarm]
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
               
                const last = await prisma.programAlarm?.findFirst({where: {programId: args.program}, orderBy: {rank: 'desc'}})
                
                const rank = LexoRank.parse(last?.rank || LexoRank.min().toString()).between(LexoRank.max()).toString()

                return await prisma.programAlarm.create({

                    data: {
                        id: nanoid(),
                        title: args.input.title,
                        // message: args.input.message,
                        // conditions: args.input.conditions,
                        rank,
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
                        title: args.input.title,
                        // message: args.input.message,
                        // conditions: args.input.conditions
                    }
                })
            },
            deleteCommandProgramAlarm: async (root: any, args: { program: string, id: string }, context: any) => {
                const program = await prisma.program.findFirst({
                    where: {
                        id: args.program,
                        organisation: context?.jwt?.organisation
                    }
                })

                if (!program) throw new Error("Program access not allowed");

                return await prisma.programAlarm.delete({
                    where: { id: args.id }
                })
            },
            // createCommandProgramAlarmSeverity: async (root: any, args: any, context: any) => {
            //     let parentUpdate = {};
            //     if(args.input.targetedBy){
            //         parentUpdate['targetedBy'] = {
            //             create: {
            //                 id: nanoid(),
            //                 alarm: {
            //                     connect: {
            //                         id: args.alarm
            //                     }
            //                 },
            //                 source: {
            //                     connect: {
            //                         id: args.input.parent
            //                     }
            //                 }
            //             }
            //         }
            //     }

            //     const currentSeverity = await prisma.programAlarmSeverity.findFirst({where: {programId: args.program}, orderBy: {rank: 'desc'}})

            //     let above = LexoRank.parse(currentSeverity?.rank || LexoRank.min().toString())
            //     let below = LexoRank.parse(LexoRank.max().toString())

            //     let rank = above.between(below).toString()

            //     await prisma.program.update({
            //         where: {
            //             id: args.program,
            //         },
            //         data: {
            //             alarmSeverity: {
            //                 create: [
            //                     {
            //                         id: nanoid(),
            //                         title: args.input.title,
            //                         rank,
            //                         nodes: [],
            //                         edges: []
            //                     }
            //                 ]
            //             }
            //         }
            //     })
            // },
            // updateCommandProgramAlarmSeverity: async (root: any, args: any, context: any) => {
            //     await prisma.program.update({
            //         where: {
            //             id: args.program
            //         },
            //         data: {
            //             alarmSeverity: {
            //                 update: {
            //                     where: {id: args.id},
            //                     data: {
            //                         title: args.input.title,
                                    
            //                     }
            //                 }
            //             }
            //         }
            //     })
            // },
            // deleteCommandProgramAlarmSeverity: async (root: any, args: any, context: any) => {
            //     await prisma.program.update({
            //         where: {
            //             id: args.program
            //         },
            //         data: {
            //             alarmSeverity: {delete: {id: args.id}}
            //         }
            //     })
            // },
            // updateCommandProgramAlarmSeverityOrder: async (root: any, args: any, context: any) => {
            //     let above = await prisma.programAlarmSeverity.findFirst({
            //         where: {
            //             programId: args.program, 
            //             id: args.above
            //         }
            //     })
            //     let below = await prisma.programAlarmSeverity.findFirst({
            //         where: {
            //             programId: args.program, 
            //             id: args.below
            //         }
            //     })

            //     let rank = LexoRank.parse(above?.rank || LexoRank.min().toString()).between(LexoRank.parse(below?.rank || LexoRank.max().toString()))?.toString()
                
            //     await prisma.program.update({
            //         where: {
            //             id: args.program
            //         },
            //         data: {
            //             // alarmSeverity: {
            //             //     update: {
            //             //         where: {id: args.id},
            //             //         data: {
            //             //             rank
            //             //         }
            //             //     }
            //             // }
            //         }
            //     })
            // }

        }
    };

    return {
        typeDefs,
        resolvers
    }
}