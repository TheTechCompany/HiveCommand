import MQTT from 'mqtt';

export interface MQTTPublisherOptions {
    user?: string;
    pass?: string;
    host: string;

    exchange?: string;

}


export class MQTTPublisher {
    
    private options : MQTTPublisherOptions;

    private client? : MQTT.Client;

    constructor(options: MQTTPublisherOptions){
        this.options = options;
    }

    connect(){
        this.client = MQTT.connect(this.options.host, {
            username: this.options.user,
            password: this.options.pass
        })    

        this.client.on('connect', () => {
            console.log("MQTT Connected...");
        })

        this.client.on('error', (err) => {
            console.error("MQTT Error", err)
        });

        this.client.on('reconnect', () => {
            console.log("MQTT Reconnecting...");
        });

    }

}