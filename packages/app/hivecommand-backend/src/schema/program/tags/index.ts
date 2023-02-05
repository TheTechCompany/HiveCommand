import { PrismaClient, ProgramTag, ProgramTagType } from "@hive-command/data";
import { nanoid } from "nanoid";
import { isStringType } from "../types/util";

export default (prisma: PrismaClient) => {

    const typeDefs = `
     
        
        type Mutation {
            createCommandProgramTag(program: ID, input: CommandProgramTagInput): CommandProgramTag
            updateCommandProgramTag(program: ID, id: ID!, input: CommandProgramTagInput): CommandProgramTag
            deleteCommandProgramTag(program: ID, id: ID!): CommandProgramTag

        }

        input CommandProgramTagInput {
            name: String

            type: String
        }

        type CommandProgramTag {
            id: ID

            name: String

            type: String
        }
       

    `

    const resolvers = {
        CommandProgramTag: {
            type: async (root: ProgramTag & { type?: ProgramTagType }) => {
                if (root.type?.typeId) {
                    let res = await prisma.programType.findFirst({ where: { id: root.type.typeId, programId: root.programId } });
                    return res?.name
                } else if (root.type?.scalar) {
                    return root.type.scalar
                }
            }
        },
        Mutation: {
            createCommandProgramTag: async (root: any, args: { program: string, input: any }, context: any) => {

                const program = await prisma.program.findFirst({
                    where: {
                        id: args.program,
                        organisation: context?.jwt?.organisation
                    }
                })

                if (!program) throw new Error("Program access not allowed");
               
                let [isType, type] = isStringType(args.input?.type);
                
                let typeUpdate = isType ? {type: {connect: {id: type}}} : {scalar: type};

                
                return await prisma.programTag.create({

                    data: {
                        id: nanoid(),
                        name: args.input.name,
                        type: {
                            create: {
                                id: nanoid(),
                                ...(args.input?.type ? typeUpdate : {}),
                                // scalar: args.input.type,
                                // type: {
                                //     connect: {id: args.input.type}
                                // }
                            }
                        },
                        program: { 
                            connect: { 
                                id: args.program 
                            } 
                        }
                    }
                })
            },
            updateCommandProgramTag: async (root: any, args: { program: string, id: string, input: any }, context: any) => {
                const program = await prisma.programTag.findFirst({
                    where: {
                        id: args.id,
                        program: {
                            id: args.program,
                            organisation: context?.jwt?.organisation
                        }
                    }
                })

                if (!program) throw new Error("Program tag access not allowed");
                
                let [isType, type] = isStringType(args.input.type);
                
                let typeUpdate = isType ? {type: {connect: {id: type}}} : {scalar: type};

                return await prisma.programTag.update({
                    where: {
                        id: program.id
                    },
                    data: {
                        name: args.input.name,
                        ...(
                            args.input.type ? { 
                                type: {
                                    update: {
                                        ...typeUpdate
                                    }
                                } 
                            } : {}
                        )
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
            deleteCommandProgramTag: async (root: any, args: { program: string, id: string }, context: any) => {
                const program = await prisma.programTag.findFirst({
                    where: {
                        id: args.id,
                        program: {
                            id: args.program,
                            organisation: context?.jwt?.organisation
                        }
                    }
                })

                if (!program) throw new Error("Program tag access not allowed");

                return await prisma.programTag.delete({
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