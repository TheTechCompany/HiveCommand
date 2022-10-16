import express from 'express'
import bodyParser from 'body-parser'
import { IOTServer } from '.';

const app = express();

app.use(bodyParser.json())


const iotServer = new IOTServer();

app.use(iotServer.router)

app.listen(process.env.PORT || 9000, () => {
    console.log(`IOT Server running on ${process.env.PORT || 9000}`);
})