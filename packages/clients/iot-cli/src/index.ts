import { exchangeShortcode, getProgramLayout } from "./auth";
import { Sidecar } from '@hive-command/local-sidecar/dist/wrapper/sidecar'

export interface IOTCLIOptions {
    discoveryServer: string;

    provisionCode: string;

    // subscriptionMap: any[];
    // deviceMap: any[];
}

export class IOTCLI {

    private discoveryServer: string;

    private provisionCode: string;

    private sidecar? : Sidecar;

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

        this.sidecar = new Sidecar({
            tags: controlLayout?.tags,
            types: controlLayout?.types,
            dataScopes: controlLayout?.dataScopes,
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

        await this.sidecar.setup()

    }

    
}