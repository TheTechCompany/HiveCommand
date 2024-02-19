import { PrismaClient } from "@prisma/client";

import DataScopePlugins from './datascope-plugins'

const prisma = new PrismaClient();

(async () => {

    await DataScopePlugins(prisma)

})().finally(async () => {
    await prisma.$disconnect();
})