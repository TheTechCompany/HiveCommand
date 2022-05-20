import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";

export default async (prisma: PrismaClient) => {

    await prisma.iOTemplate.create({
        data: {
            id: nanoid(),
            name: "Virtual Counter",
            type: 'counter',
            state: {
                createMany: {
                    data: [
                        {
                            id: nanoid(),
                            key: 'value',
                            type: 'IntegerT',
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
                            key: 'increment',
                            func: `
                                setState({value: ((state || {}).value || 0) + 1})
                            `
                        },
                        {
                            id: nanoid(),
                            key: 'reset',
                            func: `
                                setState({value: 0})
                            `
                        }
                    ]
                }
            }
        }
    })
}