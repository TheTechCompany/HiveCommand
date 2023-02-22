import { exchangeShortcode, getProgramLayout } from "./auth";
import { MQTTClient } from '@hive-command/opcua-mqtt-client'

export interface IOTCLIOptions {
    discoveryServer: string;

    opcuaServer: string;

    provisionCode: string;

    subscriptionMap: any[];
    deviceMap: any[];
}

export class IOTCLI {

    private discoveryServer: string;
    private opcuaServer: string;

    private provisionCode: string;

    private opcMQTTClient? : MQTTClient;

    private deviceMap: any[];
    private subscriptionMap: any[];

    constructor(options: IOTCLIOptions){
        this.discoveryServer = options.discoveryServer
        this.opcuaServer = options.opcuaServer

        this.provisionCode = options.provisionCode;

        this.subscriptionMap = options.subscriptionMap;
        this.deviceMap = options.deviceMap;
    }

    async start(){
        const token = await exchangeShortcode(this.discoveryServer, this.provisionCode)
        if(!token) throw new Error("Couldn't exchange shortCode for token");

        const [ controlLayout, networkLayout ] = await getProgramLayout(this.discoveryServer, token)

        this.opcMQTTClient = new MQTTClient({
            tags: controlLayout?.tags,
            types: controlLayout?.types,
            opcuaServer: this.opcuaServer,
            iot: {
                host: networkLayout?.iotEndpoint,
                user: networkLayout?.iotUser,
                pass: networkLayout?.iotToken,
                exchange: networkLayout?.iotSubject
            },
            subscriptionMap: this.subscriptionMap,
            deviceMap: this.deviceMap
        })

        await this.opcMQTTClient.start()

    }

    
}