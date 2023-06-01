import { PrismaClient, ProgramTag, ProgramTagType } from "@hive-command/data";
import { nanoid } from "nanoid";
import { isStringType } from "../types/util";
import { Document } from '@allenbradley/l5x'
import { toJSType } from '@hive-command/scripting'

export default (prisma: PrismaClient) => {

    const typeDefs = `

        
        type Mutation {

            createCommandProgramDataScope(program: ID, input: CommandProgramDataScopeInput): CommandProgramDataScope
            updateCommandProgramDataScope(program: ID, id: ID!, input: CommandProgramDataScopeInput): CommandProgramDataScope
            deleteCommandProgramDataScope(program: ID, id: ID!): CommandProgramDataScope

        }

        input CommandProgramDataScopeInput {
            name: String
            description: String

            pluginId: String
            configuration: JSON
        }

        type CommandProgramDataScope {
            id: ID

            name: String
            description: String

            plugin: CommandDataScopePlugin

            configuration: JSON

            program: CommandProgram
        }
       

    `

    const resolvers = {
    
        Mutation: {
           
            createCommandProgramDataScope: async (root: any, args: { program: string, input: any }, context: any) => {

                const program = await prisma.program.findFirst({
                    where: {
                        id: args.program,
                        organisation: context?.jwt?.organisation
                    }
                })

                if (!program) throw new Error("Program data-scope not allowed");
               
                let [isType, type] = isStringType(args.input?.type);
                
                let typeUpdate = isType ? {type: {connect: {id: type}}} : {scalar: type};

                
                return await prisma.programDataScope.create({

                    data: {
                        id: nanoid(),
                        name: args.input.name,
                        description: args.input.description,
                        plugin: {
                            connect: {
                                id: args.input.pluginId
                            }
                        },
                        configuration: args.input.configuration,
                        program: { 
                            connect: { 
                                id: args.program 
                            } 
                        }
                    }
                })
            },
            updateCommandProgramDataScope: async (root: any, args: { program: string, id: string, input: any }, context: any) => {
                const program = await prisma.programDataScope.findFirst({
                    where: {
                        id: args.id,
                        program: {
                            id: args.program,
                            organisation: context?.jwt?.organisation
                        }
                    }
                })

                if (!program) throw new Error("Program data-scope access not allowed");
                
           
                return await prisma.programDataScope.update({
                    where: {
                        id: program.id
                    },
                    data: {
                        name: args.input.name,
                        description: args.input.description,
                        plugin: {
                            connect: {
                                id: args.input.pluginId
                            }
                        },
                        configuration: args.input.configuration
                        // type: {
                        //     update: {
                        //         scalar: args.input.type,
                        //         type: {
                        //             connect: {id: args.input.type}
                        //         }
                        //     }
                        // }
                    }
                })
            },
            deleteCommandProgramDataScope: async (root: any, args: { program: string, id: string }, context: any) => {
                console.log(args.id, args.program, context?.jwt)
               
                const program = await prisma.programDataScope.findFirst({
                    where: {
                        id: args.id,
                        program: {
                            id: args.program,
                            organisation: context?.jwt?.organisation
                        }
                    }
                })


                if (!program) throw new Error("Program data-scope access not allowed");

                return await prisma.programDataScope.delete({
                    where: { id: program.id }
                })
            }

        }
    };

    return {
        typeDefs,
        resolvers
    }
}