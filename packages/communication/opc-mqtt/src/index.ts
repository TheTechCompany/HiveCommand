import { connect, ConsumeMessage, Connection, Channel } from 'amqplib'
import { DataType } from 'node-opcua';

export interface MQTTPublisherOptions {
    user?: string;
    pass?: string;
    host: string;
    port?: number;

    exchange: string;
}

export class MQTTPublisher {
    
    private connection? : Connection;
    private channel? : Channel;

    private options: MQTTPublisherOptions;

    constructor(options: MQTTPublisherOptions){
        this.options = options;
    }

    async setup(){
        const authSect = this.options.user ? `${this.options.user}:${this.options.pass}` : undefined;
        console.log({authSect, opts: this.options})
        this.connection = await connect(`amqp://${authSect ? authSect + '@' : ''}${this.options.host}${this.options.port ? `:${this.options.port}` : ''}`)
        this.channel = await this.connection.createChannel();

        console.log("Connected with a channel to ", this.options.host);

        await this.channel.assertExchange(this.options.exchange, 'topic');
    }

    //Subscribe to changes requested by other entities
    async subscribe(onMessage: (message: {routingKey?: string, userId?: string, messageContent: any}) => Promise<void>){
        const generatedQueue = await this.channel?.assertQueue(`device:${this.options.user}`)
        if(!generatedQueue) return;

        this.channel?.consume(generatedQueue.queue, async (message) => {
            if(!message) return;
            const routingKey = message?.fields.routingKey;
            const userId : string | undefined = message?.properties.userId;
            const messageContent = JSON.parse(message?.content.toString() || '{error: "No message content"}');
    
            try{
                await onMessage({routingKey, userId, messageContent})
            }catch(e){
                console.error("Error leading to nack", message)
                return this.channel?.nack(message)
            }
            return this.channel?.ack(message)
        });
    }

    //Publish current state to other entities
    async publish(key: string, dataType: string, value: any){
        if(!value) return null;

        console.log("Publishing ", key, dataType, value)
        if(value.BYTES_PER_ELEMENT != undefined){
            value = Array.from(value)
        }

        return this.channel?.publish(
            this.options.exchange, 
            key, 
            Buffer.from(JSON.stringify({
                dataType,
                value
            })), 
            {userId: this.options.user});
    }


}