
import { PrismaClient } from "@hive-command/data";
import { Router } from "express";
import { GDSControlLayout, GDSNetworkLayout } from '@hive-command/discovery-api-types'
import jwt from 'jsonwebtoken'

const IOT_ENDPOINT = process.env.IOT_ENDPOINT || 'http://discovery.internal'

const IOT_EXCHANGE = process.env.IOT_EXCHANGE || 'device_values';

export const API = (prisma: PrismaClient) => {
    const router = Router();

    router.get('/', async (req, res) => {
        res.send({ success: true })
    })


    //Auth against a short-code in the system
    router.post('/authorize', async (req, res) => {
        const { shortCode } = req.body;

        if (!shortCode) return res.send({ error: "shortCode not found in body" })

        const screen = await prisma.deviceScreen.findFirst({
            where: {
                provisionCode: shortCode
            }
        })


        if (!screen) return res.send({ error: "No screen found with that shortCode" });

        const token = jwt.sign({
            sub: screen.id,
            aud: screen.deviceId
        }, process.env.JWT_SECRET || '');

        return res.send({ token })
    })

    const verifyAccess = (req: any, res: any, next: any) => {
        const { token } = req.query;

        if (!token) return res.send({ error: "Token not provided" });

        const tokenBlob = jwt.verify(token.toString(), process.env.JWT_SECRET || '');

        if (typeof (tokenBlob) == 'string') return res.send({ error: "Token payload was invalid" });

        const { sub: screenId, aud: deviceId } = tokenBlob

        req.screenId = screenId;
        req.deviceId = deviceId;
        next();
    }


    /* -- Protected routes -- */

    router.get('/network-layout', verifyAccess, async (req, res) => {

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
                        dataScopes: {
                            include: {
                                plugin: true
                            }
                        },
                        alarmPathways: true
                    }
                }
            }
        });
        
        

        if (!device) return res.send({ error: "No device found for token" })


        const token = jwt.sign({
            deviceId: device.id
        }, process.env.IOT_SECRET || '');

        let response : GDSNetworkLayout = { 
                deviceId: device?.id,

                dataScopes: device.activeProgram?.dataScopes || [],

                alarmPathways: (device.activeProgram?.alarmPathways || []).filter((pathway) => pathway.scope?.toLowerCase() == "local"),

                iotEndpoint: IOT_ENDPOINT,
                iotSubject: IOT_EXCHANGE,
                iotUser: device.network_name,
                iotToken: token
        }
        
        res.send({results: response})

    })

    router.get('/control-layout', verifyAccess, async (req, res) => {

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
                        components: {
							include: {
								main: true,
								properties: {
									include: {
										type: true
									}
								},
								files: true
							}
						},
                        interface: {
                            include: {
                                nodes: {
                                    include: {
                                        dataTransformer: {
                                            include: {
                                                template: {
                                                    include: {
                                                        outputs: true,
                                                        inputs: true,
                                                        edges: {
                                                            include: {
                                                                to: true,
                                                                from: true
                                                            }
                                                        }
                                                    }
                                                },
                                                configuration: {
                                                    include: {
                                                        field: true
                                                    }
                                                }
                                            }
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
                        tags: {
                            include: {
                                type: {
                                    include: {
                                        type: true,
                                    }
                                },
                                scope: {
                                    include: {
                                        plugin: true
                                    }
                                }
                            }
                        },
                        types: {
                            include: {
                                fields: {
                                    include: {
                                        type: true,
                                    }
                                }
                            }
                        },
                        alarms: true
                    }
                }
            }
        })

        if (!device) return res.send({ error: "No device found for token" })

        const response : GDSControlLayout = {
            ...device.activeProgram,
                tags: (device.activeProgram?.tags || []).map((tag) => ({
                    ...tag,
                    type: tag.type?.type?.name || tag.type?.scalar
                })),
                types: (device.activeProgram?.types || []).map((type) => ({
                    ...type,
                    fields: type.fields.map((typeField) => ({
                        ...typeField,
                        type: typeField.type?.name || typeField.scalar
                    }))
                }))
        }
        res.send({ 
            results: response
        })
    })



    return router;
}

