import express from 'express'
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import cors from 'cors';

import { MQTTAuth } from '@hive-command/rabbitmq-auth'
import { MQTTHub } from '@hive-command/opcua-mqtt-hub'
import { AlarmCenter } from './alarm-center';

import { PrismaClient } from '@hive-command/data';
import { API } from './api';

(async () => {

    const prisma = new PrismaClient();

    const alarmCenter = new AlarmCenter();


    const mqttAuth = MQTTAuth(async (user, pass) => {
        console.log("MQTT Auth", user, pass);

        if(user == process.env.IOT_USER && pass == process.env.IOT_PASS) return true;

        const {deviceId} = jwt.verify(pass, process.env.IOT_SECRET || '') as any;

        if(!deviceId) return false;
        const device = await prisma.device.findFirst({
            where: {
                id: deviceId,
                network_name: user,
            }
        })

        return device != null;
    }, async (username, resource) => {
        return resource === process.env.IOT_EXCHANGE || resource === 'device_values'
    });

    const internalAuthApi = express();

    internalAuthApi.use(cors());
    internalAuthApi.use(bodyParser.json());

    internalAuthApi.use(mqttAuth);

    internalAuthApi.listen(8005, async () => {
        console.log("Internal API up on 8005");

        const mqttHub = new MQTTHub({
            user: process.env.IOT_USER,
            pass: process.env.IOT_PASS,
            host: process.env.IOT_ENDPOINT || '',        
            exchange: process.env.IOT_EXCHANGE || 'device_values',
            onMessage: async ({ routingKey, messageContent, userId }) => {
    
                console.log(`Data from ${userId} ${routingKey}`);
    
                const device = await prisma.device.findFirst({where: {network_name: userId}})
                //Log into timeseries with routingKey describing opc tree state and messageContent containing the value
    
                if(!device || !routingKey || !messageContent) return;
    
                await prisma.deviceValue.create({
                    data: {
                        deviceId: device.id,
                        placeholder: routingKey,
                        // key: routingKey,
                        value: messageContent?.value,
                    }
                })
    
                //Call alarm center hook to allow for business logic based alarm signals
                alarmCenter.hook({routingKey, messageContent, userId})
            }
        });
    
        await mqttHub.setup();
        await mqttHub.subscribe();
    
    })
    
  
    const app = express();

    app.use(cors());

    app.use(bodyParser.json());


    app.use(API(prisma));

    app.listen(8004, () => {
        console.log("Discovery server up on 8004")
    })

})()