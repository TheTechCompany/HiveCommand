import express from 'express'
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import cors from 'cors';

import { MQTTAuth } from '@hive-command/rabbitmq-auth'

import { PrismaClient } from '@hive-command/data';
import { API } from './api';

(async () => {

    const prisma = new PrismaClient();

    const app = express();

    app.use(cors());

    app.use(bodyParser.json());

    app.use(API(prisma));

    app.listen(8004, () => {
        console.log("Discovery server up on 8004")
    })

})()