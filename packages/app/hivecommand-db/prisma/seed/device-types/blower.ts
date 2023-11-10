import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";

export default async (prisma: PrismaClient) => {
    const blower = await prisma.iOTemplate.create({
        data: {
            id: nanoid(),
            name: "Blower",
            type: "blower",
            state: {
                createMany: {
                    data: [
                        {
                            id: nanoid(),
                            key: 'on',
                            type: 'BooleanT',
                            writable: false
                        }
                    ]
                }
            },
            actions: {
                createMany: {
                    data: [
                        {
                            id: nanoid(),
                            key: 'Stop',
                            func: `
                                setState({starting: true}); 
                                requestState(false);
                                await new Promise((resolve, reject) => setTimeout(() => resolve(true), 2 * 1000)); 
                                setState({starting: false, on: false});
                            `
                        },
                        {
                            id: nanoid(),
                            key: 'Start',
                            func: `
                                setState({starting: true}); 
                                requestState(true); 
                                await new Promise((resolve, reject) => setTimeout(() => resolve(true), 2 * 1000)); 
                                setState({starting: false, on: true});
                            `
                        }
                    ]
                }
            }
        }
    })

    const hmiBlower = await prisma.canvasNodeTemplate.create({
        data: {
            id: nanoid(),
            name: "Blower",
            width: 50,
            height: 40,
            ports: [
                {
                    key: "out",
                    rotation: 180,
                    x: 96,
                    y: 35
                }
            ]
        }
    })
}