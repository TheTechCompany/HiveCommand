import { MQTTAuth } from '.'
import express from 'express'

const app = express()

app.use(MQTTAuth(async (user, pass) => true))

app.listen(process.env.PORT || 9000, () => {
    console.log(`MQTT Auth Endpoint on ${process.env.PORT || 9000}`);
});