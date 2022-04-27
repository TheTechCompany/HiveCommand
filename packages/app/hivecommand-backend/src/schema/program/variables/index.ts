import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";

export default (prisma: PrismaClient) => {

        const typeDefs = `
            type Mutation {
                createCommandProgramVariable(program: ID!, input: CommandProgramVariableInput!): CommandProgramVariable!
                updateCommandProgramVariable(program: ID!, id: ID!, input: CommandProgramVariableInput!): CommandProgramVariable!
                deleteCommandProgramVariable(program: ID!, id: ID!): CommandProgramVariable!
            }

            input CommandProgramVariableInput {
                name: String
                type: String
                defaultValue: String
            }

            type CommandProgramVariable {
                id: ID!
                name: String
                type: String
                defaultValue: String
                value: String

                program: CommandProgram

            }
        `;

        const resolvers = {
            Mutation : {
                createCommandProgramVariable: async (parent: any, {program, input}: any, ctx: any) => {
                    return await prisma.programVariable.create({
                        data: {
                            id: nanoid(),
                            name: input.name,
                            type: input.type,
                            defaultValue: input.defaultValue,   
                            program: {
                                connect: {id: program}
                            }
                        }
                    })
                },
                updateCommandProgramVariable: async (parent: any, {program, id, input}: any, ctx: any) => {
                    return await prisma.programVariable.update({
                        where: {id},
                        data: {
                            name: input.name,
                            type: input.type,
                            defaultValue: input.defaultValue,
                        }
                    })
                },
                deleteCommandProgramVariable: async (parent: any, {program, id}: any, ctx: any) => {
                    return await prisma.programVariable.delete({where: {id}})
                }
            }
        };


        return {
            typeDefs,
            resolvers
        }
}