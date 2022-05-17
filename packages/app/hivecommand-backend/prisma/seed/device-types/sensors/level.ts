import { PrismaClient } from "@prisma/client"
import { nanoid } from "nanoid"

export default async (prisma: PrismaClient) => {

    const levelSensor = await prisma.iOTemplate.create({
        data: {
            id: nanoid(),
            name: "Level Sensor",
            type: 'level-meter',
            state: {
                createMany: {
                    data: [
                        {
                            id: nanoid(),
                            key: 'level',
                            type: 'UIntegerT',
                            writable: false
                        }
                    ]
                }
            }
        }
    })

    // const hmiFlow = await prisma.canvasNodeTemplate.create({
    //     data: {
    //         id: nanoid(),
    //         name: "LevelSensor",
    //         width: 50,
    //         height: 70,
    //         ports: [
    //             {
    //                 key: "out",
    //                 rotation: 180,
    //                 x: 82,
    //                 y: 82
    //             },
    //             {
    //                 key: "in",
    //                 x: -27,
    //                 y: 67
    //             }
    //         ]
    //     }
    // })
}