import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";

export default async (prisma: PrismaClient) => {
    await prisma.canvasNodeTemplate.create({
        data: {
            id: nanoid(),
            name: "BlowerSparge",
            
        }
    })
}