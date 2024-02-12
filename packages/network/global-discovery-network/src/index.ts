import express from 'express'
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import cors from 'cors';

import { MQTTAuth } from '@hive-command/rabbitmq-auth'
import { MQTTHub } from '@hive-command/amqp-hub'
import { AlarmCenter } from './alarm-center';

import { createClient } from "redis";

import { PrismaClient } from '@hive-command/data';
import { API } from './api';
import { formatSnapshot } from './utils/format';

(async () => {

    const prisma = new PrismaClient();

    const redisCli = createClient({
        url: process.env.REDIS_URL ? `redis://${process.env.REDIS_URL}` : "redis://localhost:6379"
    })

    await redisCli.connect();

    const alarmCenter = new AlarmCenter(prisma);

    const publishValue = async (deviceId: string, deviceName: string, value: any, timestamp: number, key?: string ) => {
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
            redisCli.HSET(`device:${deviceId}:values`, `${deviceName}${key ? `:${key}`: ''}`, `${value}`)
        ]);
    };


    try {

        const onMessage =  async ({ routingKey, messageContent, userId } : {
            routingKey?: string, 
            messageContent?: {dataType: string, value: any, timestamp: number}, 
            userId?: string
        }) => {

            console.log(`Data from ${userId} ${routingKey}`)
            console.log(messageContent?.value);

            const device = await prisma.device.findFirst({ 
                where: { network_name: userId },  
                include: {
                    activeProgram: {
                        include: {
                            tags: {include: {type: true}},
                            types: true,
                            alarms: true
                        }
                    }
                }
            })
            //Log into timeseries with routingKey describing opc tree state and messageContent containing the value

            if (!device || !routingKey || !messageContent) throw new Error("No routingKey or no device or no messageContent");

            if (typeof (messageContent.value) == "object") {

                await Promise.all(Object.keys(messageContent.value).map(async (valueKey) => {
                    try{
                        await publishValue(device.id, routingKey, messageContent?.value[valueKey], messageContent.timestamp, valueKey);
                    }catch(e){
                        console.error("publish multi error", e, routingKey, messageContent);
                    }
                }))
                
            } else {
                try{
                    let mainKey = routingKey?.split('/')?.[0]
                    let subKey = routingKey?.split('/')?.[1]

                    await publishValue(device.id, mainKey, messageContent?.value, messageContent.timestamp, subKey)
                }catch(e){
                    console.error("publish single error", e, routingKey, messageContent);
                }
            }
            if (!device || !routingKey || !messageContent) return;

            const results = await redisCli.HGETALL(`device:${device.id}:values`);

			const values = Object.keys(results).map((r) => {
							return {
								deviceId: device.id,
								placeholder: r?.split(':')?.[0],
								key: r?.split(':')?.[1],
								value: results?.[r]
							}
					})

            const snapshot : any = formatSnapshot(device?.activeProgram?.tags || [], device?.activeProgram?.types || [], values)

            const typedSnapshot = device?.activeProgram?.tags?.reduce((prev, tag) => {

                let typeName = device?.activeProgram?.types?.find((a) => a.id == tag.type?.typeId)?.name;
                if(!typeName) return prev;

                return {
                    ...prev,
                    [typeName]: [...(prev[typeName] || []), snapshot[tag.name] ]
                }
            }, {} as any)
            //Call alarm center hook to allow for business logic based alarm signals
            
            // alarmCenter.hook(device?.activeProgram?.alarms || [], device, snapshot, typedSnapshot)
        } 

        const onStatus = async (id: string, status: "OFFLINE" | "ONLINE") => {

            console.log('onStatus: ', id, status);
            
            const device = await prisma.device.findFirst({ where: { network_name: id } })

            if(!device) return;

            await prisma.device.update({
                where: {
                    id: device.id
                },
                data: {
                    online: status == "ONLINE",
                    lastSeen: new Date()
                }
            })
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

    const app = express();

    app.use(cors());

    app.use(bodyParser.json());

    app.use(API(prisma));

    app.listen(8004, () => {
        console.log("Discovery server up on 8004")
    })

})()