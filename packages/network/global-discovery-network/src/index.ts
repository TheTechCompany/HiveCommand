import express from 'express'
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import cors from 'cors';

import { PrismaClient } from '@hive-command/data';

const app = express();

app.use(cors());

app.use(bodyParser.json());

const prisma = new PrismaClient();

app.get('/', async (req, res) => {
    res.send({success: true})
})

//Auth against a short-code in the system
app.post('/authorize', async (req, res) => {
    const { shortCode } = req.body;

    if(!shortCode) return res.send({error: "shortCode not found in body"})

    const screen = await prisma.deviceScreen.findFirst({
        where: {
            provisionCode: shortCode
        }
    })


    if(!screen) return res.send({error: "No screen found with that shortCode"});

    const token = jwt.sign({
        sub: screen.id,
        aud: screen.deviceId
    }, process.env.JWT_SECRET || '');
    
    return res.send({token})
}) 

const verifyAccess = (req: any, res: any, next: any) => {
    const { token } = req.query;

    if(!token) return res.send({error: "Token not provided"});

    const tokenBlob = jwt.verify(token.toString(), process.env.JWT_SECRET || '');

    if(typeof(tokenBlob) == 'string') return res.send({error: "Token payload was invalid"});

    const { sub: screenId, aud: deviceId } = tokenBlob

    req.screenId = screenId;
    req.deviceId = deviceId;
    next();
}

/* -- Protected routes -- */

app.get('/network-layout', verifyAccess, async (req, res) => {

    const device = await prisma.device.findFirst({
        where: {
            id: (req as any).deviceId?.toString(),
            screens: {
                some: {
                    id: (req as any).screenId
                }
            }
        },
        include: {
            deviceMapping: {
                include: {
                    device: true,
                    deviceState: true
                }
            }
        }
    });

    if(!device) return res.send({error: "No device found for token"})

    res.send({results: device?.deviceMapping || []})

})

app.get('/control-layout', verifyAccess, async (req, res) => {
    
    let deviceInclude = {
        type: {
            include: {
                state: true,
                actions: true
            }
        }
    };

    const device = await prisma.device.findFirst({
        where: {
            id: (req as any).deviceId?.toString(),
            screens: {
                some: {
                    id: (req as any).screenId
                }
            }
        },
        include: {
            activeProgram: {
                include: {
                    templatePacks: {
                        include: {
                            elements: true
                        }
                    },
                    interface: {
                        include:{
                            nodes: {
                                include:{
                                    devicePlaceholder: {
                                        include: deviceInclude
                                    }
                                }
                            },
                            edges: {
                                include: {
                                    from: true,
                                    to: true
                                }
                            },
                            
                        }
                    },
                    devices: {
                        include: deviceInclude
                    }
                }
            }
        }
    })

    if(!device) return res.send({error: "No device found for token"})

    res.send({results: device.activeProgram})
})

app.listen(8004, () => {
    console.log("Discovery server up on 8004")
})
