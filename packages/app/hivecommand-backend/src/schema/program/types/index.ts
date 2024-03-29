import { PrismaClient, ProgramTagType, ProgramType, ProgramTypeField } from "@hive-command/data";
import { nanoid } from "nanoid";
import { isStringType } from "./util";
import { toJSType } from "@hive-command/scripting";

export default (prisma: PrismaClient) => {
    

    const typeDefs = `
        type Mutation {
            importCommandProgramTypes(program: ID, input: [CommandProgramTypeInput], scope: String): [CommandProgramType]

            createCommandProgramType(program: ID, input: CommandProgramTypeInput): CommandProgramType
            updateCommandProgramType(program: ID, id: ID, input: CommandProgramTypeInput): CommandProgramType
            deleteCommandProgramType(program: ID, id: ID): CommandProgramType

            createCommandProgramTypeField(type: ID, input: CommandProgramTypeFieldInput): CommandProgramTypeField
            updateCommandProgramTypeField(type: ID, id: ID, input: CommandProgramTypeFieldInput): CommandProgramTypeField
            deleteCommandProgramTypeField(type: ID, id: ID): CommandProgramTypeField
        } 

        input CommandProgramTypeInput {
            name: String

            fields: [CommandProgramTypeFieldInput]
        }

        type CommandProgramType {
            id: ID

            name: String

            fields: [CommandProgramTypeField]

            usedByTag: [CommandProgramTag]
        }

        input CommandProgramTypeFieldInput {
            name: String
            type: String
        }
        type CommandProgramTypeField {
            id: ID

            name: String

            type: String
        }
       

    `

    const resolvers = {

        CommandProgramType: {
            usedByTag: async (root: any) => {
                if(root.usedByTagType){
                    return root.usedByTagType?.map((x) => x.tag)
                }
            }
        },
        CommandProgramTypeField: {
            type: async (root: ProgramTypeField) => {
                if(root.typeId){
                    let res = await prisma.programType.findFirst({where: {id: root.typeId}})
                    return res?.name
                }else{
                    return root.scalar
                }
            }
        },
        Mutation : {
            importCommandProgramTypes: async (root: any, args: any, context: any) => {
                // await prisma.$transaction(async (prisma) => {
                //     prisma
                // })
      
                
                return await Promise.all(args.input.map(async (programType) => {


                    const fields = await Promise.all(programType.fields.map( async (field) => {
                        return await prisma.programType.findFirst({ where: {name: field.type, program: {id: args.program } } })
                    }))

                    return await prisma.programType.create({
                        data: {
                            id: nanoid(),
                            name: programType.name,
                            fields: {
                                createMany: {
                                    data: programType.fields.map((field, ix) =>  {

                                        let isScalar = toJSType(field?.type) != 'unknown';
                                        let typeUpdate = {};
                                        if(!isScalar) {
                                            typeUpdate['typeId'] = fields[ix].id
                                        }else{
                                            typeUpdate['scalar'] = field.type
                                        }

                                        return {
                                            id: nanoid(),
                                            name: field.name,
                                            ...typeUpdate
                                        }
                                    }) 
                                
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
            createCommandProgramType: async (root: any, args: {program: string, input: any}, context: any) => {
                //TODO add auth opt
        
                return await prisma.programType.create({
                    data: {
                        id: nanoid(),
                        name: args.input.name,
                        program: {
                            connect: {
                                id: args.program
                            }
                        }
                    }
                });
            },
            updateCommandProgramType: async (root: any, args: {program: string, id: string, input: any}, context: any) => {
       
                return await prisma.programType.update({
                    where: {
                        id: args.id
                    },
                    data: {
                        name: args.input.name,
                    }
                })
            },
            deleteCommandProgramType: async (root: any, args: {program: string, id: string}, context: any) => {
                return await prisma.programType.delete({
                    where: {
                        id: args.id
                    }
                })
            },
            createCommandProgramTypeField: async (root: any, args: {type: string, input: any}, context: any) => {
                let [isType, type] = isStringType(args.input.type);
                
                let typeUpdate = isType ? {type: {connect: {id: type}}} : {scalar: type};

                return await prisma.programTypeField.create({
                    data: {
                        id: nanoid(),
                        name: args.input.name,
                        ...(args.input.type ? typeUpdate : {}),
                        // type: {
                        //     connect: {id: args.input.type}
                        // },
                        // scalar: args.input.type
                        parent: {
                            connect: {
                                id: args.type
                            }
                        }
                    }
                })
            },
            updateCommandProgramTypeField: async (root: any, args: {type: string, id: string, input: any}, context: any) => {
                let [isType, type] = isStringType(args.input.type);
                
                let typeUpdate = isType ? {type: {connect: {id: type}}} : {scalar: type};

                return await prisma.programTypeField.update({
                    where: {
                        id: args.id
                    },
                    data: {
                        name: args.input.name,
                        ...(args.input.type ? typeUpdate : {})
                    }
                })
            },
            deleteCommandProgramTypeField: async (root: any, args: {type: string, id: string}, context: any) => {
                return await prisma.programTypeField.delete({where: {id: args.id}})
            }
        }
    };
    
	return {
		typeDefs,
		resolvers
	}
}