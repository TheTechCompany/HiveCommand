import { exchangeShortcode, getProgramLayout } from "./auth";
import { ScadaCommand } from '@hive-command/scada'

export interface IOTCLIOptions {
    discoveryServer: string;

    provisionCode: string;

    // subscriptionMap: any[];
    // deviceMap: any[];
}

export class IOTCLI {

    private discoveryServer: string;

    private provisionCode: string;

    private scada? : ScadaCommand;

    // private deviceMap: any[];
    // private subscriptionMap: any[];

    constructor(options: IOTCLIOptions){
        this.discoveryServer = options.discoveryServer

        this.provisionCode = options.provisionCode;

        // this.subscriptionMap = options.subscriptionMap;
        // this.deviceMap = options.deviceMap;
    }

    async start(){
        const token = await exchangeShortcode(this.discoveryServer, this.provisionCode)
        if(!token) throw new Error("Couldn't exchange shortCode for token");

        const [ controlLayout, networkLayout ] = await getProgramLayout(this.discoveryServer, token)

        this.scada = new ScadaCommand({
            tags: controlLayout?.tags,
            types: controlLayout?.types,
            dataScopes: networkLayout?.dataScopes,
            // opcuaServer: this.opcuaServer,
            iot: {
                host: networkLayout?.iotEndpoint,
                user: networkLayout?.iotUser,
                pass: networkLayout?.iotToken,
                exchange: networkLayout?.iotSubject
            },



            // subscriptionMap: this.subscriptionMap,
            // deviceMap: this.deviceMap
        })

        await this.scada.setup()

    }

    
}