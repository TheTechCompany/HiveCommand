import { MQTTHub } from '@hive-command/amqp-hub'
import { AlarmCenter, invertSnapshot } from '@hive-command/alarm-engine';

import { formatSnapshot, formatTagType } from './utils/format';
import { PrismaRegister } from './alarm-center/prisma-register';
import { PrismaClient } from '@hive-command/data';

import { createClient } from "redis";
import { nanoid } from 'nanoid';

(async () => {

    const runtimeId = nanoid();

    let watching = [];

    const prisma = new PrismaClient();

    const redisCli = createClient({
        url: process.env.REDIS_URL ? `redis://${process.env.REDIS_URL}` : "redis://localhost:6379"
    })

    await redisCli.connect();

    await redisCli.SET(`recovery-nodes:${runtimeId}`, Date.now(), {EX: 15})

    setInterval(async () => {

        console.log("Running leader election");

        await redisCli.SET(`recovery-nodes:${runtimeId}`, Date.now(), {EX: 15})
        // await redisCli.EXPIRE(`recovery-nodes:${runtimeId}`, 15);

        const rawNodes = await redisCli.KEYS(`recovery-nodes:*`);

        const devices = await prisma.device.findMany({});

        let ix = rawNodes.indexOf(`recovery-nodes:${runtimeId}`);

        let devices_per_node = Math.ceil(devices.length / rawNodes.length);

        let start_ix = ix * devices_per_node;
        let end_ix = (ix + 1) * devices_per_node;
        if (end_ix > devices.length) {
            end_ix = devices.length - 1;
        }

        await Promise.all(devices.slice(start_ix, end_ix).map(async (device) => {
            await redisCli.SET(`watchers:${device.network_name}`, runtimeId, {EX: 15});
        }))

    }, 7500)


    const publishValue = async (deviceId: string, deviceName: string, value: any, timestamp: number, key?: string) => {

        const updateIfAfter = async () => {
            let canUpdate = true;

            const lastUpdated = await redisCli.HGET(`device:${deviceId}:valuesLastUpdate`, `${deviceName}${key ? `:${key}` : ''}`);

            if (lastUpdated) {
                canUpdate = new Date(parseInt(lastUpdated)).getTime() < new Date(timestamp).getTime();
            }

            if (canUpdate) {
                await Promise.all([
                    redisCli.HSET(`device:${deviceId}:valuesLastUpdate`, `${deviceName}${key ? `:${key}` : ''}`, new Date(timestamp).getTime()),
                    redisCli.HSET(`device:${deviceId}:values`, `${deviceName}${key ? `:${key}` : ''}`, `${value}`)
                ])
            } else {
                console.log(`failed to update value because lastUpdated was after timestamp`, { lastUpdated, timestamp })
            }
        }

        await Promise.all([
            prisma.deviceValue.create({
                data: {
                    deviceId: deviceId,
                    placeholder: deviceName,
                    key: key,
                    lastUpdated: new Date(timestamp),
                    value: `${value}`
                }
            }),
            prisma.device.update({
                where: {
                    id: deviceId
                },
                data: {
                    online: true,
                    lastSeen: new Date(timestamp)
                }
            }),
            updateIfAfter()
        ]);
    };


    try {
        const onMessage = async ({ routingKey, messageContent, userId }: {
            routingKey?: string,
            messageContent?: { dataType: string, value: any, timestamp: number },
            userId?: string
        }) => {


            try {

                const watcher = await redisCli.GET(`watchers:${userId}`)

                if (watcher && watcher != runtimeId) {
                    return;
                } else if (!watcher) {
                    console.log("No watcher specified");
                }

                console.log(`Data from ${userId} ${routingKey} ${Date.now()}`)

                const device = await prisma.device.findFirst({
                    where: { network_name: userId },
                    include: {
                        // activeProgram: {
                        //     include: {
                        //         types: {
                        //             include: {
                        //                 fields: {
                        //                     include: {
                        //                         type: true
                        //                     }
                        //                 }
                        //             }
                        //         },
                        //         tags: {
                        //             include: {
                        //                 type: {
                        //                     include: {
                        //                         type: true
                        //                     }
                        //                 }
                        //             }
                        //         },
                        //         alarms: true,
                        //         alarmPathways: true
                        //     }
                        // }
                    }
                })
                //Log into timeseries with routingKey describing opc tree state and messageContent containing the value

                if (!device || !routingKey || !messageContent) throw new Error("No routingKey or no device or no messageContent");

                if (typeof (messageContent.value) == "object") {

                    await Promise.all(Object.keys(messageContent.value).map(async (valueKey) => {
                        try {
                            await publishValue(device.id, routingKey, messageContent?.value[valueKey], messageContent.timestamp, valueKey);
                        } catch (e) {
                            console.error("publish multi error", e, routingKey, messageContent);
                        }
                    }))

                } else {
                    try {
                        let mainKey = routingKey?.split('/')?.[0]
                        let subKey = routingKey?.split('/')?.[1]

                        await publishValue(device.id, mainKey, messageContent?.value, messageContent.timestamp, subKey)
                    } catch (e) {
                        console.error("publish single error", e, routingKey, messageContent);
                    }
                }
                if (!device || !routingKey || !messageContent) return;

                try {
                    // const results = await redisCli.HGETALL(`device:${device.id}:values`);

                    // const values = Object.keys(results).map((r) => {
                    //     return {
                    //         deviceId: device.id,
                    //         placeholder: r?.split(':')?.[0],
                    //         key: r?.split(':')?.[1],
                    //         value: results?.[r]
                    //     }
                    // })

                    // const { tags = [], types = [] } = device?.activeProgram || {};

                    // const deviceTags = (tags || []).map((tag) => {
                    //     return {
                    //         ...tag,
                    //         type: tag.type ? formatTagType(tag.type) : null
                    //     }
                    // })

                    // const deviceTypes = (types || []).map((type) => {
                    //     return {
                    //         ...type,
                    //         fields: type.fields.map((field) => {
                    //             return {
                    //                 ...field,
                    //                 type: formatTagType(field)
                    //             }
                    //         })
                    //     }
                    // })

                    // const snapshot: any = formatSnapshot(deviceTags, deviceTypes, values)

                    // const typedSnapshot = invertSnapshot(snapshot, deviceTags)

                    // const alarmCenter = new AlarmCenter(new PrismaRegister(device.id, prisma));

                    // const alarmPathways = (device?.activeProgram?.alarmPathways || [])?.filter((a) => a.scope?.toLowerCase() == "remote")?.map((pathway) => ({ ...pathway, script: pathway.script || '' }))
                    // alarmCenter.hook(device?.activeProgram?.alarms || [], alarmPathways, snapshot, typedSnapshot)

                } catch (err) {
                    console.error("Error with alarmCenter.hook")
                }
            } catch (err) {
                console.error("Error with onMessage handler")
            }
        }

        const onStatus = async (id: string, status: "OFFLINE" | "ONLINE") => {
            try{
                console.log('onStatus: ', id, status);

                const device = await prisma.device.findFirst({ where: { network_name: id } })

                if (!device) return;

                await prisma.device.update({
                    where: {
                        id: device.id
                    },
                    data: {
                        online: status == "ONLINE",
                        lastSeen: new Date()
                    }
                })
            }catch(err){
                console.error("Error with onStatus");
            }
        }

        const mqttHub = new MQTTHub({
            user: process.env.IOT_USER,
            pass: process.env.IOT_PASS,
            host: process.env.IOT_ENDPOINT || '',
            exchange: process.env.IOT_EXCHANGE || 'device_values',

            onMessage: onMessage as any,
            onStatus: onStatus as any
        });

        await mqttHub.setup();
    } catch (e) {
        console.error({ e });
    }
})();