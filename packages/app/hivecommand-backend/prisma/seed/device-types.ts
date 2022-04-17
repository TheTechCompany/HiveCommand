import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";

export default async (prisma: PrismaClient) => {
    // await prisma.iOTemplateAction.deleteMany()
    // await prisma.iOTemplateState.deleteMany()
    await prisma.iOTemplate.deleteMany({});
    await prisma.canvasNodeTemplate.deleteMany({});
    
    /* 
    Dosing Pump
       {
                    key: 'inlet',
                    x: -38,
                    y: 56
                },
                {
                    key: 'outlet',
                    x: 72,
                    y: 76,
                    rotation: 180
                }
    */
   
    const hmiValve = await prisma.canvasNodeTemplate.createMany({
        data: [{
            id: nanoid(),
            name: "BallValve",
            width: 35,
            height: 35,
            ports: [
                {
                    "key": "out",
                    "x": 100,
                    "rotation": 180,
                    "y": 85
                  },
                  {
                    "key": "in",
                    "x": -55,
                    "y": 60
                  }
            ]
        }, {
            id: nanoid(),
            name: "DiaphragmValve",
            width: 35,
            height: 25,
            ports: [
                {
                    "key": "in",
                    "y": 35,
                    "x": -55
                  },
                  {
                    "key": "out",
                    "x": 100,
                    "y": 55,
                    "rotation": 180
                  }
            ]
        }]
    })


    const valve = await prisma.iOTemplate.create({
        data: {
            id: nanoid(),
            name: 'Valve',
            type: 'valve',

            state: {
                createMany: {
                    data: [
                        {
                            id: nanoid(),
                            key: 'open',
                            type: 'BooleanT',
                            writable: true
                        },
                        {
                            id: nanoid(),
                            key: 'opening',
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
                            key: 'open',
                        },
                        {
                            id: nanoid(),
                            key: 'close'
                        }
                    ]
                }
            }
        }
    });

    const hmiPump = await prisma.canvasNodeTemplate.createMany({
        data: [{
            id: nanoid(),
            name: "Pump",
            width: 50,
            height: 40,
            ports: [
                {
                    "key": "out",
                    "rotation": 180,
                    "y": 45,
                    "x": 90
                  },
                  {
                    "key": "in",
                    "x": -35,
                    "y": 45
                  }
            ]
        }, {
            id: nanoid(),
            name: "Sump"
        }]
    })

    const pump = await prisma.iOTemplate.create({
        data: {
            id: nanoid(),
            name: 'Pump',
            type: 'pump'
        }
    });
}