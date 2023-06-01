import { PrismaClient } from "@prisma/client";
import devicePlugins from "./device-plugins";

import DataScopePlugins from './datascope-plugins'
import DeviceTypes from './device-types'

const prisma = new PrismaClient();

(async () => {

    await devicePlugins(prisma);
    await DeviceTypes(prisma);

    await DataScopePlugins(prisma)

})().finally(async () => {
    await prisma.$disconnect();
})