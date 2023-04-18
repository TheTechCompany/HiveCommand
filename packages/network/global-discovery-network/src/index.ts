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

(async () => {

    const prisma = new PrismaClient();

    const redisCli = createClient({
        url: process.env.REDIS_URL ? `redis://${process.env.REDIS_URL}` : "redis://localhost:6379"
    })

    await redisCli.connect();

    const alarmCenter = new AlarmCenter();

    const publishValue = async (deviceId: string, deviceName: string, value: any, key?: string ) => {
        await Promise.all([
            prisma.deviceValue.create({
                data: {
                    deviceId: deviceId,
                    placeholder: deviceName,
                    key: key,
                    value: `${value}`
                }
            }),
            redisCli.HSET(`device:${deviceId}:values`, `${deviceName}${key ? `:${key}`: ''}`, `${value}`)
        ]);
    };


    try {
        const mqttHub = new MQTTHub({
            user: process.env.IOT_USER,
            pass: process.env.IOT_PASS,
            host: process.env.IOT_ENDPOINT || '',
            exchange: process.env.IOT_EXCHANGE || 'device_values',

            onMessage: async ({ routingKey, messageContent, userId }) => {

                console.log(`Data from ${userId} ${routingKey}`);

                const device = await prisma.device.findFirst({ where: { network_name: userId } })
                //Log into timeseries with routingKey describing opc tree state and messageContent containing the value

                if (!device || !routingKey || !messageContent) throw new Error("No routingKey or no device or no messageContent");

                if (typeof (messageContent.value) == "object") {

                    await Promise.all(Object.keys(messageContent.value).map(async (valueKey) => {

                        await publishValue(device.id, routingKey, messageContent?.value[valueKey], valueKey);

                        // await prisma.deviceValue.create({
                        //     data: {
                        //         deviceId: device.id,
                        //         placeholder: routingKey,
                        //         key: valueKey,
                        //         value: `${messageContent?.value[valueKey]}`
                        //     }
                        // })

                    }))
                    
                } else {
                    await publishValue(device.id, routingKey, messageContent?.value)
                    // await prisma.deviceValue.create({
                    //     data: {
                    //         deviceId: device.id,
                    //         placeholder: routingKey,
                    //         // key: routingKey,
                    //         value: `${messageContent?.value}`,
                    //     }
                    // })
                }
                if (!device || !routingKey || !messageContent) return;


                //Call alarm center hook to allow for business logic based alarm signals
                alarmCenter.hook({ routingKey, messageContent, userId })
            }
        });

        await mqttHub.setup();
        await mqttHub.subscribe();
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