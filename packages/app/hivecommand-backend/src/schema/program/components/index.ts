import { PrismaClient } from "@hive-command/data";
import { nanoid } from "nanoid";

export default (prisma: PrismaClient) => {

    const typeDefs = `
   
    type Mutation {
        

        createCommandProgramComponent(program: ID, input: CommandProgramComponentInput): CommandProgramComponent
        updateCommandProgramComponent(program: ID, id: ID!, input: CommandProgramComponentInput): CommandProgramComponent
        deleteCommandProgramComponent(program: ID, id: ID!): CommandProgramComponent

        createCommandProgramComponentFile(program: ID!, component: ID!, path: String, content: String): CommandProgramComponentFile
        updateCommandProgramComponentFile(program: ID!, component: ID!, id: ID!, path: String, content: String): CommandProgramComponentFile
        deleteCommandProgramComponentFile(program: ID!, component: ID!, id: ID!): CommandProgramComponentFile
       
        createCommandProgramComponentProperty(program: ID!, component: ID!, key: String, scalar: String, typeId: String): CommandProgramComponentFile
        updateCommandProgramComponentProperty(program: ID!, component: ID!, id: ID!, key: String, scalar: String, typeId: String): CommandProgramComponentFile
        deleteCommandProgramComponentProperty(program: ID!, component: ID!, id: ID!): CommandProgramComponentFile

    }

    input CommandProgramComponentInput {
        name: String
        description: String

        mainId: String

        properties: [CommandProgramComponentPropertyInput]
    }

    input CommandProgramComponentPropertyInput {
        id: ID
        key: String
        typeId: String
        scalar: String
    }

    type CommandProgramComponentProperty{
        id: ID
        key: String
        type: CommandProgramType
        scalar: String
    }

    type CommandProgramComponentFile {
        id: ID
        path: String
        content: String
    }

    type CommandProgramComponent {
        id: ID

        name: String
        description: String

        properties: [CommandProgramComponentProperty]
        files: [CommandProgramComponentFile]

        main: CommandProgramComponentFile

        program: CommandProgram
    }
   


    `

    const resolvers = {
        Mutation: {
            createCommandProgramComponent: async (root: any, args: {program: string, input: any}, context: any) => {
                const p = await prisma.program.findFirst({where: {id: args.program, organisation: context?.jwt?.organisation}})

                if(!p) throw new Error("Access to Program not allowed");

                return await prisma.program.update({
                    where: {
                        id: p.id,
                    },
                    data: {
                        components: {
                            create: {
                                id: nanoid(),
                                name: args.input.name,
                                description: args.input.description,
                                mainId: args.input.mainId
                            }
                        }
                  
                    }
                })
            },
            updateCommandProgramComponent: async (root: any, args: {program: string, id: string, input: any}, context: any) => {
                const p = await prisma.programComponent.findFirst({
                    where: {
                        id: args.id, 
                        program: {
                            id: args.program, 
                            organisation: context?.jwt?.organisation
                        }
                    }
                })

                if(!p) throw new Error("Access to ProgramComponent not allowed");

                return await prisma.programComponent.update({
                    where: {id: p.id},
                    data: {
                        name: args.input.name,
                        description: args.input.description,
                        mainId: args.input.mainId
                    }
                })
            }, 
            deleteCommandProgramComponent:async (root: any, args: {program: string, id: string}, context: any) => {
                const p = await prisma.programComponent.findFirst({where: {id: args.id, program: {id: args.program, organisation: context?.jwt?.organisation}}})

                if(!p) throw new Error("Access to ProgramComponent not allowed");

                return await prisma.programComponent.delete({
                    where: {
                        id: p.id
                    }
                })
            },
    
            createCommandProgramComponentFile: async (root: any, args: {program: string, component: string, path: string, content: string}, context: any) => {
                const p = await prisma.programComponent.findFirst({
                    where: {
                        id: args.component, 
                        program: {id: args.program, organisation: context?.jwt?.organisation}
                    }
                })

                if(!p) throw new Error("Access to ProgramComponent not allowed");

                return await prisma.programComponent.update({
                    where: {
                        id: p.id,
                    },
                    data: {
                        files: {
                            create: {
                                id: nanoid(),
                                path: args.path,
                                content: args.content
                            }
                        }
                  
                    }
                })
            },
            updateCommandProgramComponentFile: async (root: any, args: {program: string, id: string, component: string, path: string, content: string}, context: any) => {
                const p = await prisma.programComponentFile.findFirst({
                    where: {
                        id: args.id,
                        component: {
                            id: args.component, 
                            program: {
                                id: args.program, organisation: context?.jwt?.organisation
                            }
                        }
                    }
                })

                if(!p) throw new Error("Access to ProgramComponent not allowed");

                return await prisma.programComponentFile.update({
                    where: {id: p.id},
                    data: {
                        path: args.path,
                        content: args.content
                    }
                })
            },
            deleteCommandProgramComponentFile: async (root: any, args: {program: string,  id: string, component: string}, context: any) => {
                const p = await prisma.programComponentFile.findFirst({
                    where: {
                        id: args.id, 
                        component: {
                            id: args.component,
                            program: {id: args.program, organisation: context?.jwt?.organisation}}
                        }
                    })

                if(!p) throw new Error("Access to ProgramComponent not allowed");

                return await prisma.programComponentFile.delete({
                    where: {
                        id: p.id
                    }
                })
            },
            createCommandProgramComponentProperty: async (root: any, args: {program: string, component: string, key: string, typeId?: string, scalar?: string}, context: any) => {
                const p = await prisma.programComponent.findFirst({
                    where: {
                        id: args.component, 
                        program: {id: args.program, organisation: context?.jwt?.organisation}
                    }
                })

                if(!p) throw new Error("Access to ProgramComponent not allowed");

                return await prisma.programComponent.update({
                    where: {
                        id: p.id,
                    },
                    data: {
                        properties: {
                            create: {
                                id: nanoid(),
                                key: args.key,
                                typeId: !args.scalar ? args.typeId : null,
                                scalar: args.scalar
                            }
                        }
                  
                    }
                })
            },
            updateCommandProgramComponentProperty: async (root: any, args: {program: string, component: string, id: string, key: string, typeId?: string, scalar?: string}, context: any) => {
                const p = await prisma.programComponentProperty.findFirst({
                    where: {
                        id: args.id,
                        component: {
                            id: args.component, 
                            program: {
                                id: args.program, organisation: context?.jwt?.organisation
                            }
                        }
                    }
                })

                if(!p) throw new Error("Access to ProgramComponent not allowed");

                return await prisma.programComponentProperty.update({
                    where: {id: p.id},
                    data: {
                        key: args.key,
                        typeId: !args.scalar ? args.typeId : null,
                        scalar: args.scalar
                    }
                })
            },
            deleteCommandProgramComponentProperty: async (root: any, args: {program: string, component: string, id: string}, context: any) => {
                const p = await prisma.programComponentProperty.findFirst({
                    where: {
                        id: args.id, 
                        component: {
                            id: args.component,
                            program: {
                                id: args.program, 
                                organisation: context?.jwt?.organisation
                            }
                        }
                    }
                })

                if(!p) throw new Error("Access to ProgramComponent not allowed");

                return await prisma.programComponentProperty.delete({
                    where: {
                        id: p.id
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