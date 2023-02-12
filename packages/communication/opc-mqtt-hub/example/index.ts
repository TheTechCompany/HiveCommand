import { MQTTHub } from "../src";
import { DataType } from 'node-opcua'

(async () => {
    const hub = new MQTTHub({
        host: process.env.IOT_HOST || '',
        user: process.env.IOT_USER,
        pass: process.env.IOT_PASS,
        exchange: 'device_values',
        onMessage: async ({messageContent}) => {

            let dt = DataType[messageContent?.dataType]
            let val = messageContent?.value;
            console.log({dt, val: val, DataType: messageContent?.dataType})
        }
    })
    
    await hub.setup()

    console.log("Connected")

    await hub.subscribe()

    console.log("Subscribed");
})()
