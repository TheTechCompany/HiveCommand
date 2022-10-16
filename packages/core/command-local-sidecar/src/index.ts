import express from 'express';

import OPCUAClient from '@hive-command/opcua-client';

// import { BrowsePath, ClientSession, OPCUAClient } from 'node-opcua'

const OPC_PROXY_PORT = 8484;

class DevSidecar {

    private clients : {[key: string]: OPCUAClient} = {};

    // private sessions : {[key: string]: ClientSession} = {};

    constructor(){

    }

    async browse(client: OPCUAClient, browsePath: string, recursive?: boolean){
        // const endpointUrl = `opc.tcp://${host}:${port}`;

        const browseResult = await client.browse(browsePath)

        let results : any[] = [];
        console.log("references of RootFolder :");
        for(const reference of browseResult || []) {

            const name = reference.browseName.toString();

            if(recursive){
                try{
                    const innerResults = await this.browse(client, `${browsePath}/${name}`, recursive);
                    results.push({name: name, children: innerResults})
                }catch(e){
                    console.log({e, name})
                }
            }else{
                results.push(name)
            }
            // console.log( "   -> ", reference.browseName.toString());
            // results.push(reference.browseName.toString());
        }

        return results;
    }

    async connect(host: string, port: number){
        const endpointUrl = `opc.tcp://${host}:${port}`;

        try{
    

            this.clients[endpointUrl] = new OPCUAClient();

            await this.clients[endpointUrl].connect(endpointUrl)

      
            // await this.clients[endpointUrl].connect(endpointUrl);

            // this.clients[endpointUrl].browse('RootFolder')

            // this.sessions[endpointUrl] = await this.clients[endpointUrl].createSession();
            
            const results = await this.browse(this.clients[endpointUrl], "/Objects", true);
            // const browseResult = await this.sessions[endpointUrl]?.browse("RootFolder");

         

            return results;
        }catch(e: any){
            return [e.message]
        }

    }


}

const sidecar = new DevSidecar();

const app = express();

app.get('/:host/test', (req, res) => {
    res.send({success: true})
})


app.get('/:host/:port/tree', async (req, res) => {

    // res.send("Tree called");

    let port : number;
    try{
        port = parseInt(req.params.port)
    }catch(e){
        return res.send({error: "Port not a valid integer"});
    }

    const tree = await sidecar.connect(req.params.host, port);
    res.send({results: tree})
});


const server = app.listen(OPC_PROXY_PORT, () => {
    console.debug(`Listening on ${OPC_PROXY_PORT}`)
})

process.on('SIGTERM', () => {
    server.close(() => {
        console.debug('Server stopped');
    })
})