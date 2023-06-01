import { PrismaClient } from "@hive-command/data";
import { mergeResolvers } from '@graphql-tools/merge'

import dataScope from "./data-scope";

export default (prisma: PrismaClient) => {
    
    const { typeDefs: dataScopeTypeDefs, resolvers: dataScopeResolvers } = dataScope(prisma);
    
    return {
        resolvers: mergeResolvers([
            dataScopeResolvers
        ]),
        typeDefs: `
            ${dataScopeTypeDefs}
        `
    }
}