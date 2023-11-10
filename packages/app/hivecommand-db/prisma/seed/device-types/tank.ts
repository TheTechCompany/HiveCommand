import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";

export default async (prisma: PrismaClient) => {
    await prisma.canvasNodeTemplate.create({
        data: {
            id: nanoid(),
            name: "Tank",
            ports: [
                {
                    key: 'in',
                    rotation: 90,
                    x: 10,
                    y: -20
                },
                {
                    key: 'out',
                    rotation: 90,
                    x: 70,
                    y: -20
                }
            ]
        }
    })

    await prisma.iOTemplate.create({
        data: {
            id: nanoid(),
            name: "Tank",
            type: "tank",
            state: {
                createMany: {
                    data: [
                        {
                            id: nanoid(),
                            key: 'level',
                            type: 'UIntegerT',
                            min: '4',
                            max: '20',
                            writable: false,
                        }
                    ]
                }
            }
        }
    })

    await prisma.canvasNodeTemplate.create({
        data: {
            id: nanoid(),
            name: "DosingTank",
            ports: [
                {
                    key: 'out',
                    rotation: 180,
                    x: 97,
                    y: 82
                }
            ]
        }
    })

    await prisma.iOTemplate.create({
        data: {
            id: nanoid(),
            name: "Dosing Tank",
            type: 'dosing-tank',
            state: {
                createMany: {
                    data: [
                        {
                            id: nanoid(),
                            key: 'empty',
                            type: 'BooleanT',
                            writable: false
                        }
                    ]
                }
            }
        }
    })
}