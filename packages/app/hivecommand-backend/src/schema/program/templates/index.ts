import { subject } from "@casl/ability";
import { PrismaClient } from "@hive-command/data";
import { nanoid } from "nanoid";

export default (prisma: PrismaClient) => {

    const typeDefs = `

        type Mutation {

            createCommandProgramTemplate(program: ID!, input: CommandTemplateTransformerInput!): CommandTemplateTransformer
            updateCommandProgramTemplate(program: ID!, id: ID!, input: CommandTemplateTransformerInput!): CommandTemplateTransformer
            deleteCommandProgramTemplate(program: ID!, id: ID!): Boolean!
            
            createCommandTemplateIO(template: ID!, input: CommandTemplateIOInput!): CommandTemplateIO
            updateCommandTemplateIO(template: ID!, id: ID!, input: CommandTemplateIOInput!): CommandTemplateIO
            deleteCommandTemplateIO(template: ID!, id: ID!): CommandTemplateIO

            createCommandTemplateEdge(template: ID!, input: CommandTemplateEdgeInput!): CommandTemplateEdge
            updateCommandTemplateEdge(template: ID!, id: ID!, input: CommandTemplateEdgeInput!): CommandTemplateEdge
            deleteCommandTemplateEdge(template: ID!, id: ID!): CommandTemplateEdge

        }

        input CommandTemplateEdgeInput {
            to: ID
            from: ID
            script: String
        }

        type CommandTemplateEdge {
            id: ID
            from: CommandTemplateIO
            script: String
            to: CommandTemplateIO
        }

        input CommandTemplateTransformerInput {
            name: String
        }   

        type CommandTemplateTransformer {
            id: ID

            name: String

            edges : [CommandTemplateEdge]

            inputs: [CommandTemplateIO]
            outputs: [CommandTemplateIO]
        }

        type CommandDataTransformer {
            id: ID

            template: CommandTemplateTransformer
            configuration: [CommandDataTransformerConfiguration]
        }

        type CommandDataTransformerConfiguration{
            id: ID

            field: CommandTemplateIO
            value: String
        }

        input CommandTemplateIOInput {
            name: String
            type: String

            direction: String
        }

        type CommandTemplateIO {
            id: ID
            name: String
            type: String
        }


    `

    const resolvers = {

        Mutation : {

            createCommandProgramTemplate: async (root: any, args: any, context: any) => {
                const program = await prisma.program.findFirst({
                    where: {
                        id: args.program,
                        organisation: context?.jwt?.organisation
                    }
                })

                if (!program) throw new Error("Program access not allowed");

                if(!context?.jwt?.acl.can('update', subject('CommandProgram', program) )) throw new Error('Cannot create update CommandProgram');

                return await prisma.program.update({
                    where: {
                        id: args.program,
                    },
                    data: {
                        templates: {
                            create: {
                                
                                id: nanoid(),
                                name: args.input.name

                            }
                        }
                    }
                })
            },
            updateCommandProgramTemplate: async (root: any, args: any, context: any) => {
                const program = await prisma.program.findFirst({
                    where: {
                        id: args.program,
                        organisation: context?.jwt?.organisation
                    }
                })

                if (!program) throw new Error("Program access not allowed");

                if(!context?.jwt?.acl.can('update', subject('CommandProgram', program) )) throw new Error('Cannot create update CommandProgram');

                return await prisma.program.update({
                    where: {
                        id: args.program
                    },
                    data: {
                        templates: {
                            update: {
                                where: {
                                    id: args.id,
                                },
                                data: {
                                    name: args.input.name
                                }
                            }
                        }
                    }
                })
            },
            deleteCommandProgramTemplate: async (root: any, args: any, context: any) => {
                const program = await prisma.program.findFirst({
                    where: {
                        id: args.program,
                        organisation: context?.jwt?.organisation
                    }
                })

                if (!program) throw new Error("Program access not allowed");

                if(!context?.jwt?.acl.can('update', subject('CommandProgram', program) )) throw new Error('Cannot create update CommandProgram');

                return await prisma.program.update({
                    where: {
                        id: args.program
                    },
                    data: {
                        templates: {
                            delete: [{
                                    id: args.id
                            }]
                        }
                    }
                })
            },
            createCommandTemplateEdge: async (root: any, args: any, context: any) => {
                // const program = await prisma.program.findFirst({
                //     where: {
                //         id: args.program,
                //         organisation: context?.jwt?.organisation
                //     }
                // })

                // if (!program) throw new Error("Program access not allowed");

                // if(!context?.jwt?.acl.can('update', 'CommandProgram', program)) throw new Error('Cannot create update CommandProgram');


                let sourcedBy : any = {from: {connect: {id: args.input.from}}};

                if(args.input.script){
                    sourcedBy = {script: args.input.script}
                }

                return await prisma.canvasDataTemplate.update({
                    where: {
                        id: args.template
                    },
                    data: {
                        edges: {
                            create: {
                                id: nanoid(),
                                to: {
                                    connect: {id: args.input.to}
                                },
                                ...sourcedBy,
                            }
                        }
                    }
                })
            },
            updateCommandTemplateEdge: async (root: any, args: any, context: any) => {
                
                let sourcedByUpdate : any = {from: {connect: {id: args.input.from}}, script: null};
                if(args.input.script){
                    sourcedByUpdate = {script: args.input.script, from: {disconnect: true}};
                }

                return await prisma.canvasDataTemplateEdge.update({
                    where: {
                        id: args.id
                        // templateId: args.template
                    },
                    data: {
                        ...sourcedByUpdate
                    }
                })
                
            },
            deleteCommandTemplateEdge: async (root: any, args: any, context: any) => {
                return await prisma.canvasDataTemplate.update({
                    where: {
                        id: args.template
                    },
                    data: {
                        edges: {
                            delete: [{
                                id: args.id   
                            }]
                        }
                    }
                })
            },
            createCommandTemplateIO: async (root: any, args: any, context: any) => {
                const { direction } = args.input;

                let dataUpdateKey : any = 'outputs';
                if(direction == 'input') dataUpdateKey = 'inputs';

                return await prisma.canvasDataTemplate.update({
                    where: {
                        id: args.template,
                    },
                    data: {
                        [dataUpdateKey]: {
                            create: {
                                id: nanoid(),
                                name: args.input.name,
                                type: args.input.type
                            }
                        }
                    }
                });
            },
            updateCommandTemplateIO:  async (root: any, args: any, context: any) => {
                return await prisma.canvasDataTemplateIO.update({
                    where: {
                        id: args.id
                    },
                    data: {
                        name: args.input.name,
                        type: args.input.type
                    }
                })
            },
            deleteCommandTemplateIO:  async (root: any, args: any, context: any) => {
                return await prisma.canvasDataTemplateIO.delete({
                    where: {
                        id: args.id
                    }
                });
            }
        }
    };
    
	return {
		typeDefs,
		resolvers
	}
}