import { MQTTHub } from "../src";
import { DataType } from 'node-opcua'

(async () => {
    const hub = new MQTTHub({
        host: process.env.IOT_HOST || '',
        exchange: 'IOT-SUBJECT',
        onMessage: (message) => {
            let json = JSON.parse(message.messageContent || '{}')

            let dt = DataType[json.dataType]
            let val = json.value;
            console.log({dt, val: val})
        }
    })
    
    await hub.setup()

    console.log("Connected")

    await hub.subscribe()

    console.log("Subscribed");
})()
