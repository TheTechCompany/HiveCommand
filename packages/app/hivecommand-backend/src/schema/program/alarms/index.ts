import { PrismaClient, ProgramTag, ProgramTagType } from "@hive-command/data";
import { nanoid } from "nanoid";
import { isStringType } from "../types/util";
import { LexoRank } from "lexorank";
import { JsxEmit, ModuleKind, ScriptTarget, transpile } from 'typescript';
import { Project } from 'ts-morph'
import { defaultAlarm, defaultAlarmPathway } from "./defaults";
import { FnTranspileOptions } from "@hive-command/scripting";

const canCompile = (tsCode: string) => {


    return true;

}

export default (prisma: PrismaClient) => {

    const typeDefs = `
    
        type Mutation {
            createCommandProgramAlarm(program: ID, input: CommandProgramAlarmInput): CommandProgramAlarm
            updateCommandProgramAlarm(program: ID, id: ID!, input: CommandProgramAlarmInput): CommandProgramAlarm
            deleteCommandProgramAlarm(program: ID, id: ID!): CommandProgramAlarm

            createCommandProgramAlarmPathway(program: ID, input: CommandProgramAlarmPathwayInput): CommandProgramAlarmPathway
            updateCommandProgramAlarmPathway(program: ID, id: ID!, input: CommandProgramAlarmPathwayInput): CommandProgramAlarmPathway
            deleteCommandProgramAlarmPathway(program: ID, id: ID!): CommandProgramAlarmPathway
        }

        input CommandProgramAlarmInput {
            title: String
            script: String
        }

        type CommandProgramAlarm {
            id: ID

            title: String
            script: String

            compileError: Boolean
            
            rank: String

            createdAt: DateTime
        }

        input CommandProgramAlarmPathwayInput {
            name: String
            scope: String
            script: String
        }

        type CommandProgramAlarmPathway {
            id: ID

            name: String
            scope: String
            script: String
            
            compileError: Boolean

            createdAt: DateTime
        }

    `
    const resolvers = {
        CommandProgramAlarmPathway: {
            compileError: (root: any) => {
                const id = nanoid();
                console.time(`Compile error - ${id}`)
                if(root.script){
                    const notCompiled = !canCompile(root.script)
                    console.timeEnd(`Compile error - ${id}`)
                    
                    return notCompiled
                }
                return false;
            }
        },
        CommandProgramAlarm: {
            compileError: (root: any) => {
                const id = nanoid();
                console.time(`Compile error - ${id}`)
                if(root.script){
                    const notCompiled = !canCompile(root.script)
                    console.timeEnd(`Compile error - ${id}`)
                    return notCompiled;
                }
                return false;
            }
        },
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
                        script: args.input.script || defaultAlarm,
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
                
                let compiled;
                
                try{
                    compiled = transpile(args.input.script, FnTranspileOptions)
                }catch(err){

                }

                return await prisma.programAlarm.update({
                    where: {
                        id: args.id
                    },
                    data: {
                        title: args.input.title,
                        script: args.input.script,
                        compiledScript: compiled
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
            createCommandProgramAlarmPathway: async (root: any, args: { program: string, input: any }, context: any) => {
                return await prisma.programAlarmPathway.create({
                    data: {
                        id: nanoid(),
                        name: args.input.name,
                        scope: args.input.scope,
                        script: args.input.script || defaultAlarmPathway,
                        program: {
                            connect: {id: args.program}
                        }
                    }
                })
            },
            updateCommandProgramAlarmPathway: async (root: any, args: { program: string, id: string, input: any }, context: any) => {
                let compiled;
                
                try{
                    compiled = transpile(args.input.script, FnTranspileOptions)
                }catch(err){

                }

                return await prisma.programAlarmPathway.update({
                    where: {
                        id: args.id
                    },
                    data: {
                        name: args.input.name,
                        script: args.input.script,
                        compiledScript: compiled,
                        scope: args.input.scope
                    }
                })
            },
            deleteCommandProgramAlarmPathway: async (root: any, args: { program: string, id: string }, context: any) => {
                return await prisma.programAlarmPathway.delete({
                    where: {
                        id: args.id
                    }
                })
            }
        }
    }

    return {
        typeDefs,
        resolvers
    }
}