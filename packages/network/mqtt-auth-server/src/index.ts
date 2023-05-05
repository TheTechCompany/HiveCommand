import { MQTTAuth } from "@hive-command/rabbitmq-auth";
import jwt from 'jsonwebtoken';
import { PrismaClient } from "@hive-command/data";
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const prisma = new PrismaClient();

(async () => {

    const mqttAuth = MQTTAuth(async (user, pass) => {
        console.log("MQTT Auth", user, pass);

        if(user == process.env.IOT_USER && pass == process.env.IOT_PASS) return {allow: true, role: 'administrator'};

        const {deviceId} = jwt.verify(pass, process.env.IOT_SECRET || '') as any;

        if(!deviceId) return false;

        const device = await prisma.device.findFirst({
            where: {
                id: deviceId,
                network_name: user,
            }
        })

        return device != null;
    }, async (username, resource, permission) => {
        
        console.log("MQTT Resource", resource, permission);
        let permissionOk = (permission === 'configure' || permission === "permission" || permission === "write");

        if(username === process.env.IOT_USER){
            permissionOk = permissionOk || permission === "read";
        }

        return (resource === process.env.IOT_EXCHANGE || resource === 'device_values') && permissionOk
    })

    const internalAuthApi = express();

    internalAuthApi.use(cors());
    internalAuthApi.use(bodyParser.json());

    internalAuthApi.use(mqttAuth);

    internalAuthApi.listen(8005, async () => {
        console.log("Internal API up on 8005");
    });
})()