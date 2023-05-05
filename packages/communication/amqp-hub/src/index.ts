import MQTT from 'mqtt';

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

    private client? : MQTT.Client;

    private options : MQTTHubOptions;

    private DEVICE_DATA_PREFIX: string;

    constructor(options: MQTTHubOptions){
        this.options = options;

        this.DEVICE_DATA_PREFIX = this.options.exchange || `device_values`

    }

    async setup(){
        // let authSection = this.options.user ? `${this.options.user}:${this.options.pass}` : undefined;

        this.client = MQTT.connect(this.options.host, {
            username: this.options.user,
            password: this.options.pass
        })

        this.client.on('connect', () => {
            console.log("MQTT Client connected!");

            this.client?.subscribe(`${this.DEVICE_DATA_PREFIX}/+/#`, (err) => {
                if(err){
                    console.error(`Failed to subscribe to ${this.DEVICE_DATA_PREFIX}`)
                }else{
                    console.log(`Subscribed to ${this.DEVICE_DATA_PREFIX}`)
                }
            })
    
        })

        this.client.on('message', (topic, payload, packet) => {
            if(topic.indexOf(this.DEVICE_DATA_PREFIX) > -1){

                let messageContent = JSON.parse(payload?.toString() || '{error: "No message content"}');

                const regex = new RegExp(`${this.DEVICE_DATA_PREFIX}/(.+?)/`);

                this.options.onMessage?.({
                    routingKey: topic.replace(regex, ''),
                    messageContent: messageContent,
                    userId: topic.match(regex)?.[1]
                });
            }
        })

        this.client.on('reconnect', () => {
            console.log("MQTT Client reconnecting...");
        })

        this.client.on('error', (err) => {
            console.error(err);
        })
            
    }


}