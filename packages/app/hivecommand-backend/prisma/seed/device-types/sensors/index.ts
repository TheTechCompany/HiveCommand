import { PrismaClient } from "@prisma/client";
import conductivity from "./conductivity";
import flow from "./flow";
import pressure from "./pressure";

export default async (prisma: PrismaClient) => {
    await conductivity(prisma)
    await flow(prisma)
    await pressure(prisma)
}