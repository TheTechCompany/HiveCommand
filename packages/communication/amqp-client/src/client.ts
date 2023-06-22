// import { connect, ConsumeMessage, Connection, Channel } from 'amqplib'
import MQTT from 'mqtt';

export interface MQTTClientOptions {
    user?: string;
    pass?: string;
    host: string;
    port?: number;

    exchange?: string;

    lwt?: {

    },
    reconnectOptions?: {
        maxAttempts?: number,
        maxDelay?: number,
        timeMultiple?: number
        startingDelay?: number
    }
}

export class MQTTClient {

    private client?: MQTT.Client;

    private options: MQTTClientOptions;

    private DEVICE_CONTROL_PREFIX: string;
    private DEVICE_DATA_PREFIX: string;
    private DEVICE_ONLINE_PREFIX: string ;

    constructor(options: MQTTClientOptions) {
        this.options = options;

        this.DEVICE_CONTROL_PREFIX = `device_control/${this.options.user}`;
        this.DEVICE_DATA_PREFIX = this.options.exchange || `device_values`
        this.DEVICE_ONLINE_PREFIX = `device_online/${this.options.user}`;
    }

    disconnect(){
        this.client?.end()
    }

    async connect(onMessage: (message: { routingKey?: string, userId?: string, messageContent: any }) => Promise<void>) {

        this.client = MQTT.connect(this.options.host, {
            username: this.options.user,
            password: this.options.pass,
            will: {
                topic: this.DEVICE_ONLINE_PREFIX,
                payload: Buffer.from(JSON.stringify({offline: true})),
                qos: 1, 
                retain: false
            }
        })


        this.client.on('connect', () => {
            console.log("MQTT Client Connected!");

            this.client?.subscribe(`${this.DEVICE_CONTROL_PREFIX}/#`, (err) => {
                if (err) {
                    console.error("Subscription error to write topic");
                }else{
                    console.log("Subscribed to control line " + this.DEVICE_CONTROL_PREFIX)
                }
            });

        });

        this.client.on('message', (topic, payload, packet) => {
            if (topic.indexOf(this.DEVICE_CONTROL_PREFIX) > -1){

                let messageContent = JSON.parse(payload?.toString() || '{error: "No message content"}');
                onMessage({ routingKey: topic.split(`${this.DEVICE_CONTROL_PREFIX}/`)?.[1], messageContent })
            }
        })

        this.client.on('error', (err) => {
            console.log("MQTT Client Error", err);

        })

        this.client.on('reconnect', () => {
            console.log("MQTT Client Reconnecting...");
        })


    }

    // //Subscribe to changes requested by other entities
    // async subscribe(onMessage: (message: { routingKey?: string, userId?: string, messageContent: any }) => Promise<void>) {


    //     const generatedQueue = await this.channel?.assertQueue(`device:${this.options.user}`)
    //     if (!generatedQueue) return;

    //     this.channel?.consume(generatedQueue.queue, async (message) => {
    //         if (!message) return;
    //         const routingKey = message?.fields.routingKey;
    //         const userId: string | undefined = message?.properties.userId;
    //         const messageContent = JSON.parse(message?.content.toString() || '{error: "No message content"}');

    //         try {
    //             await onMessage({ routingKey, userId, messageContent })
    //         } catch (e) {
    //             console.error("Error leading to nack", message)
    //             return this.channel?.nack(message)
    //         }
    //         return this.channel?.ack(message)
    //     });
    // }



    //Publish current state to other entities
    async publish(key: string, dataType: string, value: any, timestamp: number = Date.now()) {

        if (value?.BYTES_PER_ELEMENT != undefined) {
            value = Array.from(value)
        }

        if (!this.DEVICE_DATA_PREFIX) throw new Error("No topic provided.");

        this.client?.publish(
            `${this.DEVICE_DATA_PREFIX}/${this.options.user}/${key}`,
            Buffer.from(JSON.stringify({
                dataType,
                value,
                timestamp
            })),
            {
                qos: 1
            }
        );

    }


}