import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";

export default async (prisma: PrismaClient) => {
    await prisma.canvasNodeTemplate.create({
        data: {
            id: nanoid(),
            name: "UfMembrane",
            width: 55,
            height: 35
        }
    })
}