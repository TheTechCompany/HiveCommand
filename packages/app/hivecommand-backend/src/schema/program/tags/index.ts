import { PrismaClient, ProgramTag, ProgramTagType } from "@hive-command/data";
import { nanoid } from "nanoid";
import { isStringType } from "../types/util";
import { Document } from '@allenbradley/l5x'
import { toJSType } from '@hive-command/scripting'
import { subject } from "@casl/ability";

export default (prisma: PrismaClient) => {

    const typeDefs = `
 
        
        type Mutation {
            importCommandProgramTags(program: ID, input: [CommandProgramTagInput], scope: String): [CommandProgramTag]

            createCommandProgramTag(program: ID, input: CommandProgramTagInput): CommandProgramTag
            updateCommandProgramTag(program: ID, id: ID!, input: CommandProgramTagInput): CommandProgramTag
            deleteCommandProgramTag(program: ID, id: ID!): CommandProgramTag

        }

        input CommandProgramTagInput {
            name: String

            type: String

            scope: String
        }

        type CommandProgramTag {
            id: ID

            name: String

            type: String

            scope: CommandProgramDataScope
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
            importCommandProgramTags: async (root: any, args: any, context: any) => {
                // const doc = new Document(args.file);
                // console.log({doc})
                       
                const program = await prisma.program.findFirst({
                    where: {
                        id: args.program,
                        organisation: context?.jwt?.organisation
                    }
                })

                if (!program) throw new Error("Program access not allowed");

                if(!context?.jwt?.acl.can('update', subject('CommandProgram', program) )) throw new Error('Cannot create update CommandProgram');


                return await Promise.all(args.input.map(async (programTag) => {

                    let isScalar = toJSType(programTag?.type) != 'unknown';

                    let typeUpdate = {};
                    if(!isScalar) {
                        const programType = await prisma.programType.findFirst({where: {name: programTag.type, program: {id: args.program}}})
                        typeUpdate['type'] = {
                            connect: {id: programType?.id}
                        }
                    }else{
                        typeUpdate['scalar'] = programTag.type
                    }
                
                    // let typeUpdate = isType ? {type: {connect: {id: type}}} : {scalar: type};
    
                    return await prisma.programTag.create({
                        data: {
                            id: nanoid(),
                            name: programTag.name,
                            type: {
                                create: {
                                    id: nanoid(),
                                    ...typeUpdate
                                }
                            },
                            scope: {
                                connect: {
                                    id: args.scope
                                }
                            },
                            program: {
                                connect: {
                                    id: args.program
                                }
                            }
                        }
                    })
                }))
            },
            createCommandProgramTag: async (root: any, args: { program: string, input: any }, context: any) => {
                
                const program = await prisma.program.findFirst({
                    where: {
                        id: args.program,
                        organisation: context?.jwt?.organisation
                    }
                })

                if (!program) throw new Error("Program access not allowed");

                if(!context?.jwt?.acl.can('update', subject('CommandProgram', program) )) throw new Error('Cannot create update CommandProgram');

               
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
                        scopeId: args.input.scope,
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
                if(!context?.jwt?.acl.can('update', subject('CommandProgram', program) )) throw new Error('Cannot create update CommandProgram');
                
                let [isType, type] = isStringType(args.input.type);
                
                let typeUpdate = isType ? {type: {connect: {id: type}}} : {scalar: type};

                return await prisma.programTag.update({
                    where: {
                        id: program.id
                    },
                    data: {
                        name: args.input.name,
                        scopeId: args.input.scope,
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
                console.log(args.id, args.program, context?.jwt)
               
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
                if(!context?.jwt?.acl.can('update', subject('CommandProgram', program) )) throw new Error('Cannot create update CommandProgram');


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