import {Channel, connect, Connection, ConsumeMessage} from 'amqplib';

export interface MQTTHubMessage {
    userId?: string;
    routingKey?: string;
    messageContent?: string;
}

export interface MQTTHubOptions {
    user?: string;
    pass?: string;
    host: string;
    port?: number;

    exchange: string;

    onMessage?: (message: MQTTHubMessage) => void;
}

export class MQTTHub {

    private connection? : Connection;
    private channel?: Channel;

    private options : MQTTHubOptions;
    

    constructor(options: MQTTHubOptions){
        this.options = options;

    }

    private onMessage (msg: ConsumeMessage | null) {
        // this.channel
        const routingKey = msg?.fields.routingKey;
        const userId : string | undefined = msg?.properties.userId;
        const messageContent = msg?.content.toString();

        console.log({routingKey, messageContent});

        // if(!userId) return console.error("No userId found, private messages not allowed");

        this.options.onMessage?.({
            routingKey,
            userId,
            messageContent
        })
    }

    async setup(){
        let authSection = this.options.user ? `${this.options.user}:${this.options.pass}` : undefined;

        this.connection = await connect(`amqp://${authSection ? authSection + '@' : ''}${this.options.host}${this.options.port ? `:${this.options.port}` : ''}`)
        
        this.channel = await this.connection.createChannel()

        await this.channel.assertExchange(this.options.exchange, 'topic')        
    }

    async subscribe(){
        const generatedQueue = await this.channel?.assertQueue('')

        if(!generatedQueue) return;
        await this.channel?.bindQueue(generatedQueue.queue, this.options.exchange, '#');

        this.channel?.consume(generatedQueue.queue, this.onMessage.bind(this));
    }



}