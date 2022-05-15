import { PrismaClient } from "@prisma/client"
import { nanoid } from "nanoid"

export default async (prisma: PrismaClient) => {

    const flowMeter = await prisma.iOTemplate.create({
        data: {
            id: nanoid(),
            name: "Flow Sensor",
            type: 'flow-meter',
            state: {
                createMany: {
                    data: [
                        {
                            id: nanoid(),
                            key: 'temperature',
                            type: 'IntegerT',
                            writable: false
                        },
                        {
                            id: nanoid(),
                            key: 'flow',
                            type: 'UIntegerT',
                            writable: false
                        }
                    ]
                }
            }
        }
    })

    const hmiFlow = await prisma.canvasNodeTemplate.create({
        data: {
            id: nanoid(),
            name: "FlowSensor",
            width: 50,
            height: 70,
            ports: [
                {
                    key: "out",
                    rotation: 180,
                    x: 82,
                    y: 82
                },
                {
                    key: "in",
                    x: -27,
                    y: 67
                }
            ]
        }
    })
}