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
        }

        input CommandProgramAlarmInput {
            title: String

            script: String
        }

        type CommandProgramAlarm {
            id: ID

            title: String
            script: String

            rank: String

            createdAt: DateTime

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
                        script: args.input.script,
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
                        script: args.input.script
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
            }
        }
    }

    return {
        typeDefs,
        resolvers
    }
}