import { MQTTHub } from "../src";
import { DataType } from 'node-opcua'

(async () => {
    const hub = new MQTTHub({
        host: process.env.IOT_HOST || '',
        exchange: 'IOT-SUBJECT',
        onMessage: ({messageContent}) => {

            let dt = DataType[messageContent?.dataType]
            let val = messageContent?.value;
            console.log({dt, val: val})
        }
    })
    
    await hub.setup()

    console.log("Connected")

    await hub.subscribe()

    console.log("Subscribed");
})()
