import { connect, ConsumeMessage, Connection, Channel } from 'amqplib'
import { DataType } from 'node-opcua';

export interface MQTTPublisherOptions {
    user: string;
    pass: string;
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
        this.connection = await connect(`amqp://${this.options.user}:${this.options.pass}@${this.options.host}${this.options.port ? `:${this.options.port}` : ''}`)
        this.channel = await this.connection.createChannel();

        await this.channel.assertExchange(this.options.exchange, 'topic');
    }

    //Subscribe to changes requested by other entities
    async subscribe(key: string, onMessage: (message: ConsumeMessage | null) => void){
        const generatedQueue = await this.channel?.assertQueue('')
        if(!generatedQueue) return;

        await this.channel?.bindQueue(generatedQueue.queue, this.options.exchange, key);

        this.channel?.consume(generatedQueue.queue, onMessage);
    }

    //Publish current state to other entities
    async publish(key: string, dataType: DataType, value: any){

        this.channel?.publish(
            this.options.exchange, 
            key, 
            Buffer.from(JSON.stringify({
                dataType,
                value
            })), 
            {userId: this.options.user});
    }


}