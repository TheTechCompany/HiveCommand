import express from 'express'
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import cors from 'cors';

import { MQTTHub } from '@hive-command/opcua-mqtt-hub'
import { AlarmCenter } from './alarm-center';
import amqplib from 'amqplib';

import { PrismaClient } from '@hive-command/data';
import { API } from './api';

(async () => {

    const alarmCenter = new AlarmCenter();


    const mqttHub = new MQTTHub({
        user: 'user1',
        pass: 'pass1',
        host: 'localhost',
        port: 5673,
        
        exchange: 'device_values',
        onMessage: ({ routingKey, messageContent, userId }) => {

            //Log into timeseries with routingKey describing opc tree state and messageContent containing the value

            // prisma.deviceValue.create({
            //     data: {
            //         deviceId,
            //         key: routingKey,
            //         value: messageContent.value,
            //         a
            //     }
            // })

            //Call alarm center hook to allow for business logic based alarm signals
            alarmCenter.hook({routingKey, messageContent, userId})
        }
    });

    await mqttHub.setup();
    await mqttHub.subscribe();

    const app = express();

    app.use(cors());

    app.use(bodyParser.json());

    const prisma = new PrismaClient();

    app.use(API(prisma));

    app.listen(8004, () => {
        console.log("Discovery server up on 8004")
    })

})()