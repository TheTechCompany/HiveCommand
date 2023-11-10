import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";

export default async (prisma: PrismaClient) => {
    await prisma.canvasNodeTemplate.create({
        data: {
            id: nanoid(),
            name: "NfMembrane",
            width: 60,
            height: 40,
            ports: [
                {
                    key: 'in',
                    x: -38,
                    y: 36

                },
                {
                    key: 'out',
                    x: 97,
                    rotation: 180,
                    y: 61
                }
            ]
        }
    })
}