import { PrismaClient } from "@prisma/client";
import blower from "./blower";
import membranes from "./membranes";
import pumps from "./pumps";
import sensors from "./sensors";
import tank from "./tank";
import valves from "./valves";
import virtual from "./virtual";

export default async (prisma: PrismaClient) => {
    await prisma.iOTemplate.deleteMany({});
    await prisma.canvasNodeTemplate.deleteMany({});
    
    await membranes(prisma)
    await sensors(prisma);
    await valves(prisma);
    await pumps(prisma);
    await blower(prisma)
    await virtual(prisma)
    await tank(prisma);
}