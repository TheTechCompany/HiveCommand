import {Channel, Connection, ConsumeMessage} from 'amqplib';
import { MQTTClient } from '@hive-command/opcua-mqtt';

export interface MQTTHubMessage {
    userId?: string;
    routingKey?: string;
    messageContent?: {[key: string]: any};
}

export interface MQTTHubOptions {
    user?: string;
    pass?: string;
    host: string;
    port?: number;

    exchange: string;

    onMessage?: (message: MQTTHubMessage) => Promise<void>;
}

export class MQTTHub {

    private client : MQTTClient;

    private options : MQTTHubOptions;

    constructor(options: MQTTHubOptions){
        this.options = options;

        this.client = new MQTTClient({
            user: this.options.user,
            pass: this.options.pass,
            host: this.options.host,
            port: this.options.port,
            exchange: this.options.exchange        
        })
     
    }

    private async onMessage (msg: ConsumeMessage | null) {
        // this.channel
        if(!msg) return;

        const routingKey = msg?.fields.routingKey;
        const userId : string | undefined = msg?.properties.userId;
        const messageContent = JSON.parse(msg?.content.toString() || '{error: "No message content"}');

        console.log({routingKey, userId, messageContent});

        // if(!userId) return console.error("No userId found, private messages not allowed");

        try{
            await this.options.onMessage?.({
                routingKey,
                userId,
                messageContent
            })
        }catch(e){
            console.error("Error dealing with message", e)
            return this.client?.channel?.nack(msg)
        }

        this.client?.channel?.ack(msg)
    }

    async setup(){
        // let authSection = this.options.user ? `${this.options.user}:${this.options.pass}` : undefined;



        await this.client.connect();

        // this.connection = await connect(`amqp://${authSection ? authSection + '@' : ''}${this.options.host}${this.options.port ? `:${this.options.port}` : ''}`)
        
        // this.channel = await this.connection.createChannel()

        await this.client?.channel?.assertExchange(this.options.exchange, 'topic')        
    }

    async subscribe(){

        const generatedQueue = await this.client?.channel?.assertQueue?.('');

        if(!generatedQueue) return;
        await this.client?.channel?.bindQueue(generatedQueue.queue, this.options.exchange, '#');

        this.client?.channel?.consume(generatedQueue.queue, this.onMessage.bind(this));
    }



}