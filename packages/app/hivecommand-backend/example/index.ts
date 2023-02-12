import { PrismaClient } from "@hive-command/data";

const prisma = new PrismaClient();

(async () => {
    const dv = await prisma.deviceValue.findMany({
        where: {
          
        },
        orderBy: {
            lastUpdated: 'desc'
        },
        distinct: ['deviceId', 'placeholder', 'key']
    })
    console.log(dv)
})()