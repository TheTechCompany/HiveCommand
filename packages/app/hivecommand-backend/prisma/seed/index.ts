import { PrismaClient } from "@prisma/client";

import DeviceTypes from './device-types'

const prisma = new PrismaClient();

(async () => {

    await DeviceTypes(prisma);

})().finally(async () => {
    await prisma.$disconnect();
})