/*
    Command Client - Native Sidecar

    - maintains opc connections
    - provides access for native frontend
    - registers subscriptions
*/  
import EventEmitter from 'events'
import express from 'express';
import bodyParser from 'body-parser'
import cors from 'cors';
import {Server} from 'socket.io'
import OPCUAClient from '@hive-command/opcua-client';

// import { BrowsePath, ClientSession, OPCUAClient } from 'node-opcua'

const OPC_PROXY_PORT = 8484;

class DevSidecar {

    private clients : {[key: string]: OPCUAClient} = {};

    // private sessions : {[key: string]: ClientSession} = {};

    constructor(){

    }

    async subscribe(host: string, paths: {tag: string, path: string}[]){
        const client = await this.connect(host);

        const { monitors, unwrap } = await client.subscribeMulti(paths)

        const emitter = new EventEmitter()

        monitors?.on('changed', async (item, value, index) => {
            const key = unwrap(index)

            console.log(key, value.value)

            emitter.emit('data-changed', {key, value: value.value})
        })
        
        return emitter;
    }

    async browse(host: string, browsePath: string, recursive?: boolean, withTypes?: boolean){
        // const endpointUrl = `opc.tcp://${host}:${port}`;
        console.log("Browse ", browsePath)
        const client = await this.connect(host);

        const browseResult = await client.browse(browsePath)

        let results : any[] = [];

        for(const reference of browseResult || []) {

            const name = reference?.browseName?.name?.toString();
            const nsIdx = reference?.browseName?.namespaceIndex?.toString();

            let bp = `${browsePath}/${nsIdx ? `${nsIdx}:` : ''}${name}`;

            if(recursive){
                try{
                    console.log(bp, "With Types", withTypes)
                    let type = withTypes ? await client.getType(bp) : null;
                    // console.log({type})
                    const innerResults = await this.browse(host, bp, recursive, withTypes);
                    results.push({
                        id: reference?.nodeId, 
                        name: name, 
                        path: bp,
                        type,
                        children: innerResults
                    })
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

    async connect(host: string, port?: number){
        const endpointUrl = `opc.tcp://${host}${port ? `:${port}` : ''}`;

        if(this.clients[endpointUrl]) return this.clients[endpointUrl];

        this.clients[endpointUrl] = new OPCUAClient();


        await this.clients[endpointUrl].connect(endpointUrl)
      
        return this.clients[endpointUrl];

    }


}

const sidecar = new DevSidecar();

const app = express();

const http = require('http');
const server = http.createServer(app);
const io = new Server(server);

let subscriptions : {[key: string]: EventEmitter}= {};

const dataChanged = (data: any) => {
    io.emit('data-changed', data)
}

app.use(bodyParser.json());
app.use(cors());

app.post('/:host/subscribe', async (req, res) => {
    if(subscriptions[req.params.host]) return res.send({error: "Already subscribed"});

    try{
        const events = await sidecar.subscribe(req.params.host, req.body.paths)

        events.on('data-changed', dataChanged)

        subscriptions[req.params.host] = events;
    }catch(e){
        return res.send({error: e})
    }

    res.send({success: true})
})

app.post('/:host/unsubscribe', async (req, res) => {
    if(!subscriptions[req.params.host]) return res.send({error: "No subscription found"});

    try{
        const eventEmitter = subscriptions[req.params.host];

        eventEmitter.removeListener('data-changed', dataChanged);
    }catch(e){
        return res.send({error: e})
    }
    res.send({success: true})
})

app.get('/:host/tree', async (req, res) => {
    try{
        const tree = await sidecar.browse(req.params.host, '/Objects', true, true);
        res.send({results: tree})
    }catch(e: any){
        return res.send({error: e.message})
    }
});

server.listen(OPC_PROXY_PORT, () => {
    console.debug(`Listening on ${OPC_PROXY_PORT}`)
})

process.on('SIGTERM', () => {
    server.close(() => {
        console.debug('Server stopped');
    })
})