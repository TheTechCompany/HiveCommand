import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";

export default async (prisma: PrismaClient) => {

    const sensor = await prisma.iOTemplate.create({
        data: {
            id: nanoid(),
            name: "Conductivity Sensor",
            type: 'conductivity-sensor',
            state: {
                createMany: {
                    data: [
                        {
                            id: nanoid(),
                            key: 'conductivity',
                            type: 'UIntegerT',
                            writable: false
                        }
                    ]
                }
            }
        }
    })

    const hmiSensor = await prisma.canvasNodeTemplate.create({
        data: {
            id: nanoid(),
            name: "Conductivity",
            width: 50,
            height: 70,
            ports: [
                {
                    key: 'in',
                    x: -24,
                    y: 65
                },
                {
                    key: 'out',
                    x: 82,
                    rotation: 180,
                    y: 82
                }
            ]
        }
    })
}