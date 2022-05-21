import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";

export default async (prisma: PrismaClient) => {
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
                    "y": 30,
                    "x": -55
                  },
                  {
                    "key": "out",
                    "x": 100,
                    "y": 70,
                    "rotation": 180
                  }
            ]
        }]
    })



    const BallValve = await prisma.iOTemplate.create({
        data: {
            id: nanoid(),
            name: 'Ball Valve',
            type: 'ball-valve',

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
                            key: 'Open',
                            func: `
                                setState({opening: true}); 
                                requestState(true);
                                await new Promise((resolve, reject) => setTimeout(() => resolve(true), 11 * 1000)); 
                                setState({opening: false, open: true});
                            `
                        },
                        {
                            id: nanoid(),
                            key: 'Close',
                            func: `
                                setState({opening: true}); 
                                requestState(false); 
                                await new Promise((resolve, reject) => setTimeout(() => resolve(true), 11 * 1000)); 
                                setState({opening: false, open: false});
                            `
                        }
                    ]
                }
            }
        }
    });
    
    const DiaphragmValve = await prisma.iOTemplate.create({
        data: {
            id: nanoid(),
            name: 'Diaphragm Valve',
            type: 'diaphragm-valve',

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
                            key: 'Open',
                            func: `
                                setState({opening: true}); 
                                requestState(true);
                                await new Promise((resolve, reject) => setTimeout(() => resolve(true), 2 * 1000)); 
                                setState({opening: false, open: true});
                            `
                        },
                        {
                            id: nanoid(),
                            key: 'Close',
                            func: `
                                setState({opening: true}); 
                                requestState(false); 
                                await new Promise((resolve, reject) => setTimeout(() => resolve(true), 2 * 1000)); 
                                setState({opening: false, open: false});
                            `
                        }
                    ]
                }
            }
        }
    });

}