import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";

export default async (prisma: PrismaClient) => {

    // await prisma.iOPluginTemplate.deleteMany({});

    const actuatorId = nanoid();
    const targetId = nanoid();

    const pluginId = nanoid();

 
    const pid = await prisma.iOPluginTemplate.create({
        data: {
            id: pluginId,
            name: 'PID Controller',
            tick: `
                if((state.__host.on == 'true' || state.__host.on == true) && (state.__host.starting == false || state.__host.starting == 'false')) { 
                    const addValue = instance.update(state.targetValue); 
                    updateState({actuatorValue: state.actuatorValue += addValue});
                }
            `,
            config: {
                createMany: {
                    data: [
                       
                        {
                            id: nanoid(),
                            key: 'target',
                            type: 'Number',
                            order: 4
                        },
                        {
                            id: nanoid(),
                            key: 'p',
                            type: 'Number',
                            order: 5,
                        },
                        {
                            id: nanoid(),
                            key: 'i',
                            type: 'Number',
                            order: 6,
                        },
                        {
                            id: nanoid(),
                            key: 'd',
                            type: 'Number',
                            order: 7
                        }
                    ]
                }
            }
        }
    })


    const actuator = await prisma.iOPluginTemplateConfig.create({
        data: {
            id: actuatorId,
            key: 'actuator',
            type: 'Device',
            order: 0,
            template: {
                connect: {id: pluginId}
            }
        }
    })
    const actuatorField = await prisma.iOPluginTemplateConfig.create({
        data: {
            id: nanoid(),
            key: 'actuatorField',
            type: 'DeviceState',
            order: 1,
            requires: {
                connect: {
                    id: actuatorId
                }
            },
            template: {
                connect: {id: pluginId}
            }
        }
    })

    const target = await prisma.iOPluginTemplateConfig.create({
        data: {
            id: targetId,
            key: 'targetDevice',
            type: 'Device',
            order: 2,
            template: {
                connect: {id: pluginId}
            }
        }
    })
    const targetField = await prisma.iOPluginTemplateConfig.create({
        data: {
            id: nanoid(),
            key: 'targetDeviceField',
            type: 'DeviceState',
            order: 3,
            requires: {
                connect: {id: targetId}
            },
            template: {
                connect: {
                    id: pluginId
                }
            }
        }
    })
}