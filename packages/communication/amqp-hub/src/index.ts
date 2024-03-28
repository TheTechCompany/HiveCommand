import MQTT, {MqttClient} from 'mqtt';

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
    onStatus?: (id: string, status: string) => Promise<void>;
}

export class MQTTHub {

    private client? : MqttClient;

    private options : MQTTHubOptions;

    private DEVICE_DATA_PREFIX: string;
    private DEVICE_ONLINE_PREFIX: string;

    constructor(options: MQTTHubOptions){
        this.options = options;

        this.DEVICE_DATA_PREFIX = this.options.exchange || `device_values`
        this.DEVICE_ONLINE_PREFIX = `device_online`;

    }

    async setup(){
        // let authSection = this.options.user ? `${this.options.user}:${this.options.pass}` : undefined;

        // new MqttClient();

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

            this.client?.subscribe(`${this.DEVICE_ONLINE_PREFIX}/+`, (err) => {
                if(err){
                    console.error(`Failed to subscribe to ${this.DEVICE_ONLINE_PREFIX}`)
                }else{
                    console.log(`Subscribed to ${this.DEVICE_ONLINE_PREFIX}`)
                }
            })
    
        })

        // this.client.handleMessage = async (packet, cb) => {
        //     const { topic, payload } = packet;

        //     if(topic.indexOf(this.DEVICE_DATA_PREFIX) > -1){

        //         let messageContent = JSON.parse(payload?.toString() || '{error: "No message content"}');

        //         const regex = new RegExp(`${this.DEVICE_DATA_PREFIX}/(.+?)/`);

        //         await this.options.onMessage?.({
        //             routingKey: topic.replace(regex, ''),
        //             messageContent: messageContent,
        //             userId: topic.match(regex)?.[1]
        //         });
        //     }else{
        //         console.log("Message received on topic: " + topic);
        //     }

        //     if(topic.indexOf(this.DEVICE_ONLINE_PREFIX) > -1){
        //         const regex = new RegExp(`${this.DEVICE_ONLINE_PREFIX}/(.+?)/`);

        //         let messageContent = JSON.parse(payload?.toString() || '{error: "No message content"}');

        //         const online_id = topic.match(regex)?.[1];

        //         console.log("LWAT ", online_id, messageContent, topic)
        //         if(online_id && messageContent.offline != null){
        //             await this.options.onStatus?.(online_id, messageContent.offline ? 'OFFLINE' : 'ONLINE')
        //         }
        //     }

        //     cb();

        // }

        this.client.on('message', async (topic, payload, packet) => {

            if(topic.indexOf(this.DEVICE_DATA_PREFIX) > -1){

                let messageContent = JSON.parse(payload?.toString() || '{error: "No message content"}');

                const regex = new RegExp(`${this.DEVICE_DATA_PREFIX}/(.+?)/`);

                await this.options.onMessage?.({
                    routingKey: topic.replace(regex, ''),
                    messageContent: messageContent,
                    userId: topic.match(regex)?.[1]
                });
            }else{
                console.log("Message received on topic: " + topic);
            }

            if(topic.indexOf(this.DEVICE_ONLINE_PREFIX) > -1){
                const regex = new RegExp(`${this.DEVICE_ONLINE_PREFIX}/(.+?)/`);

                let messageContent = JSON.parse(payload?.toString() || '{error: "No message content"}');

                const online_id = topic.match(regex)?.[1];

                console.log("LWAT ", online_id, messageContent, topic)
                if(online_id && messageContent.offline != null){
                    await this.options.onStatus?.(online_id, messageContent.offline ? 'OFFLINE' : 'ONLINE')
                }
            }
        //     if(topic.indexOf(this.DEVICE_DATA_PREFIX) > -1){

        //         let messageContent = JSON.parse(payload?.toString() || '{error: "No message content"}');

        //         const regex = new RegExp(`${this.DEVICE_DATA_PREFIX}/(.+?)/`);

        //         this.options.onMessage?.({
        //             routingKey: topic.replace(regex, ''),
        //             messageContent: messageContent,
        //             userId: topic.match(regex)?.[1]
        //         });
        //     }else{
        //         console.log("Message received on topic: " + topic);
        //     }

        //     if(topic.indexOf(this.DEVICE_ONLINE_PREFIX) > -1){
        //         const regex = new RegExp(`${this.DEVICE_ONLINE_PREFIX}/(.+?)/`);

        //         let messageContent = JSON.parse(payload?.toString() || '{error: "No message content"}');

        //         const online_id = topic.match(regex)?.[1];

        //         console.log("LWAT ", online_id, messageContent, topic)
        //         if(online_id && messageContent.offline != null){
        //             this.options.onStatus?.(online_id, messageContent.offline ? 'OFFLINE' : 'ONLINE')
        //         }
        //     }

        })

        this.client.on('reconnect', () => {
            console.log("MQTT Client reconnecting...");
        })

        this.client.on('error', (err) => {
            console.error(err);
        })
            
    }


}