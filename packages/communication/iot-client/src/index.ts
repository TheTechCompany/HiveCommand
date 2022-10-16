/*
    HiveCommand IOT Client

    - Public key transfer
    - OPC-Client
    - Reverse tunnel
    - Watchdog
*/

import OPCUAClient from "@hive-command/opcua-client";
import axios from 'axios'

export interface IOTClientOptions {
    iotServer: string;
    opcServer: string;

    keyphrase?: string;
}

export class IOTClient {
    
    private iotServer: string;
    private opcServer: string;

    private keyphrase?: string;

    constructor(options: IOTClientOptions){
        this.iotServer = options.iotServer;
        this.opcServer = options.opcServer;

        this.keyphrase = options.keyphrase;
    }

    async connect(){
        //Check connection to OPC Server
        const client = new OPCUAClient()

        try{
            await client.connect(this.opcServer)
        }catch(e){
            console.error(e)
            throw e
        }

        //Scan OPC Server for tree-structure
        // const session = await client.createSession();

        const results = await client.scan(`/Objects`, true, ['/Objects/0:Server', '/Objects/0:Aliases'])

        console.log(JSON.stringify({results}));

        //Submit local map to IOT server

        const handshakeResult = await axios.post(`${this.iotServer}/handshake`, {keyphrase: this.keyphrase})

        console.log("Handshake received");

        const { token } = handshakeResult.data

        const contextResult = await axios.post(`${this.iotServer}/context`, {tree: results, token})

        console.log("Context sent")
        //Tunnel connection to IOT server for OPC-Client -> Local server


    }

    //Check condition of SSH keys
    hasKeys(){

    }

    //Generate SSH key pair
    generateKeys(){

    }


}