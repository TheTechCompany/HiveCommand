import { DataType } from "node-opcua";
import { MQTTPublisher } from "../src";

(async () => {
    const publisher = new MQTTPublisher({
        host: process.env.IOT_HOST || '',
        user: process.env.IOT_USER || '',
        pass: process.env.IOT_PASS || '',
        exchange: 'device_values',
        // onMessage: (message) => console.log({message})
    })
    
    await publisher.setup()

    console.log("Connected")

    await publisher.subscribe(async (message) => {
        console.log("STUFF", message)
    })

    // await publisher.publish('asdf', 'Boolean', false);
    
    console.log("Subscribed");
})()
