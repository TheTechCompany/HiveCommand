import { DataType } from "node-opcua";
import { MQTTPublisher } from "../src";

(async () => {
    const publisher = new MQTTPublisher({
        host: process.env.IOT_HOST || '',
        exchange: 'IOT-SUBJECT',
        // onMessage: (message) => console.log({message})
    })
    
    await publisher.setup()

    console.log("Connected")

    await publisher.publish('asdf', 'Boolean', false);
    
    console.log("Subscribed");
})()
