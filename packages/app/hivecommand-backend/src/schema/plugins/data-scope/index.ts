import { PrismaClient, ProgramTag, ProgramTagType } from "@hive-command/data";

export default (prisma: PrismaClient) => {

    const typeDefs = `

        type Query {
            commandDataScopePlugins: [CommandDataScopePlugin]
        }
        
        input CommandDataScopePluginsInput {
            name: String

            module: String

            configuration: JSON
        }

        type CommandDataScopePlugin {
            id: ID

            name: String
            module: String

            configuration: JSON

        }
       

    `

    const resolvers = {
    
        Query: {
            commandDataScopePlugins: async () => {
                return await prisma.dataScopePlugin.findMany()
            }
        }
    };

    return {
        typeDefs,
        resolvers
    }
}