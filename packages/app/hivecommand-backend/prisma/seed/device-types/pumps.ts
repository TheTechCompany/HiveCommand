import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";

export default async (prisma: PrismaClient) => {
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
            name: "Sump",
            width: 50,
            height: 40,
            ports: [
                {
                    "key": "out",
                    "rotation": 180,
                    "y": 45,
                    "x": 90
                },
            ]
        }, {
            id: nanoid(),
            name: "DosingPump",
            ports: [
                {
                    key: 'outlet',
                    x: 72,
                    y: 76,
                    rotation: 180
                },
                {
                    key: 'inlet',
                    x: -38,
                    y: 56
                }
            ]            
        }]
    })

    const pump = await prisma.iOTemplate.create({
        data: {
            id: nanoid(),
            name: 'Pump',
            type: 'pump',
            state: {
                createMany: {
                    data: [
                        {
                            id: nanoid(),
                            key: 'speed',
                            min: '4',
                            max: '20',
                            type: 'IntegerT',
                            writable: true
                        },
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
                            key: 'Start',
                            func: `
                                setState({starting: true}); 
                                requestState(true); 
                                await new Promise((resolve, reject) => setTimeout(() => resolve(true), 2 * 1000)); 
                                setState({starting: false, on: true});
                            `
                        },
                        {
                            id: nanoid(),
                            key: 'Stop',
                            func: `
                                setState({starting: true}); 
                                requestState(false); 
                                await new Promise((resolve, reject) => setTimeout(() => resolve(true), 2 * 1000)); 
                                setState({starting: false, on: false});
                            `
                        }
                    ]
                }
            }
        }
    });

    const dosingPump = await prisma.iOTemplate.create({
        data: {
            id: nanoid(),
            name: "Dosing Pump",
            type: "dosing-pump",
            actions: {
                createMany: {
                    data: [
                        {
                            id: nanoid(),
                            key: 'Stop',
                            func: `
                                setState({starting: true}); 
                                requestState(false); 
                                setState({starting: false, on: false});
                            `
                        },
                        {
                            id: nanoid(),
                            key: 'Start',
                            func: `
                                setState({starting: true}); 
                                requestState(true); 
                                setState({starting: false, on: true});
                            `
                        }
                    ]
                }
            },
            state: {
                createMany: {
                    data: [
                        {
                            id: nanoid(),
                            key: 'starting',
                            type: 'BooleanT',
                            writable: false
                        },
                        {
                            id: nanoid(),
                            key: 'on',
                            type: 'BooleanT',
                            writable: false
                        }
                    ]
                }
            }
        }
    })
}