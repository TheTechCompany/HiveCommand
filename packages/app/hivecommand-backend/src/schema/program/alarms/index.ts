import { PrismaClient, ProgramTag, ProgramTagType } from "@hive-command/data";
import { nanoid } from "nanoid";
import { isStringType } from "../types/util";

export default (prisma: PrismaClient) => {

    const typeDefs = `
     
        
        type Mutation {
            createCommandProgramAlarm(program: ID, input: CommandProgramAlarmInput): CommandProgramAlarm
            updateCommandProgramAlarm(program: ID, id: ID!, input: CommandProgramAlarmInput): CommandProgramAlarm
            deleteCommandProgramAlarm(program: ID, id: ID!): CommandProgramAlarm
        }

        input CommandProgramAlarmInput {
            name: String

            description: String
        }

        type CommandProgramAlarm {
            id: ID

            name: String
            description: String

            conditions: [CommandProgramAlarmCondition]
            actions: [CommandProgramAlarmAction]
        }

        type CommandProgramAlarmCondition {
            id: ID
            name: String

            input: String
            value: String
        }

        type CommandProgramAlarmAction {
            id: ID
            name: String

            func: String
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
                        
                    }
                })
            },
            deleteCommandProgramTag: async (root: any, args: { program: string, id: string }, context: any) => {
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
            }

        }
    };

    return {
        typeDefs,
        resolvers
    }
}