import { connect, ConsumeMessage, Connection, Channel } from 'amqplib'
import { DataType } from 'node-opcua';

export interface MQTTPublisherOptions {
    user?: string;
    pass?: string;
    host: string;
    port?: number;

    exchange: string;

    reconnectOptions?: {
        maxAttempts?: number,
        maxDelay?: number,
        timeMultiple?: number
        startingDelay?: number
    }
}

export class MQTTPublisher {
    
    private isConnected : boolean = false;

    private wal : any[] = [];

    private connection? : Connection;
    private channel? : Channel;

    private options: MQTTPublisherOptions;

    constructor(options: MQTTPublisherOptions){
        this.options = options;
    }

    private backoff(power: number){

        const constant = this.options.reconnectOptions?.startingDelay || 100
        const base = this.options.reconnectOptions?.timeMultiple || 2
        const delay = constant * Math.pow(base, power)

        return Math.min(delay, this.options.reconnectOptions?.maxDelay || Infinity)
    }

    async connect(attempt: number = 1){
        let reconnecting = false;

        const authSect = this.options.user ? `${this.options.user}:${this.options.pass}` : undefined;

        if((this.options.reconnectOptions?.maxAttempts || 0) > 0 && attempt >= ( this.options.reconnectOptions?.maxAttempts || 0 ) ){
            throw new Error('Maximum amqp reconnection attempts exceeded');
        }

        const onConnectionError = async (err: any): Promise<void> => {
            this.connection = undefined;
            this.isConnected = false;

            if(reconnecting){
                return Promise.resolve()
            }

            reconnecting = true;

            console.debug(`AMQP Error retrying in ${this.backoff(attempt)}`, err);

            await new Promise( (resolve) => setTimeout(() => { resolve(true) }, this.backoff(attempt) ))
            return await this.connect(attempt + 1)
        }

        try{
            this.connection = await connect(`amqp://${authSect ? authSect + '@' : ''}${this.options.host}${this.options.port ? `:${this.options.port}` : ''}`)
            this.channel = await this.connection.createChannel();

            this.connection.once('error', onConnectionError);
            this.connection.once('close', onConnectionError);

            this.isConnected = true;
            console.log("Connected with a channel to ", this.options.host);

            await this.publishWAL()

            await this.channel.assertExchange(this.options.exchange, 'topic');
            
            reconnecting = false;
        }catch(e: any){
            await onConnectionError(e)
        }
        
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

    async publishWAL(){
        await Promise.all(this.wal.slice().map(async (logItem, ix) => {
            try{
                await this.publish(logItem.key, logItem.dataType, logItem.value)
                this.wal.splice(ix, 1)
            }catch(e){

            }
        }));
    }


    //Publish current state to other entities
    async publish(key: string, dataType: string, value: any, isRetry?: number, retryCount: number = 1){
        console.log("Publishing ", key, dataType, value)

        if(value.BYTES_PER_ELEMENT != undefined){
            value = Array.from(value)
        }

        let ix = isRetry;
        if(isRetry == undefined){
            ix = this.wal.push({key, dataType, value});
        }

        if(this.isConnected){
            try{
                if(!ix) return;

                this.channel?.publish(
                    this.options.exchange, 
                    key, 
                    Buffer.from(JSON.stringify({
                        dataType,
                        value
                    })), 
                    {userId: this.options.user});
                
                this.wal.splice(ix, 1)

            }catch(e){
                //Retry publish
                await new Promise((resolve) => setTimeout(() => resolve(true), this.backoff(retryCount)) )

                if(retryCount < 5){
                    await this.publish(key, dataType, value, ix, retryCount + 1);
                }
            }
        }
        // if(!value || !this.channel) return null;

       
    }


}