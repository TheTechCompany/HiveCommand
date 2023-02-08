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
import { DataType } from 'node-opcua';
import { isEqual } from 'lodash'

import { MQTTPublisher } from '@hive-command/opcua-mqtt';

import { fromOPCType } from '@hive-command/scripting'

import { Client } from 'pg';

// import { BrowsePath, ClientSession, OPCUAClient } from 'node-opcua'

const OPC_PROXY_PORT = 8484;

export interface SidecarOptions {
    host: string,
    user: string,
    pass: string
}

class DevSidecar {

    private clients : {[key: string]: OPCUAClient} = {};

    private mqttPublisher? : MQTTPublisher; 

    private options? : SidecarOptions;
    // private sessions : {[key: string]: ClientSession} = {};

    constructor(){
       
    }

    async getDataType(host: string, path: string){
        console.log(host, path)
        const client = await this.connect(host);

        return await client.getType(path, true)
    }

    async setData(host: string, path: string, dataType: DataType, value: any){
        const client = await this.connect(host);

        const statusCode = await client.setDetails(path, dataType, value)
        return statusCode?.value;
    }

    async subscribe(host: string, paths: {tag: string, path: string}[]){
        const client = await this.connect(host);

        console.log("Subscribing to", paths);

        const { monitors, unsubscribe, unwrap } = await client.subscribeMulti(paths)

        const emitter = new EventEmitter()

        monitors?.on('changed', async (item, value, index) => {
            try{
                const key = unwrap(index)

                console.log("Datachanged at the OPCUA level", {key, value: value.value})

                if(this.mqttPublisher) this.mqttPublisher?.publish(key, DataType.Float, value.value);

                emitter.emit('data-changed', {key, value: value.value})
            }catch(e: any){
                console.log("Error in monitors.changed", e.message)
            }
        })

        // emitter.on('')
        
        return {emitter, unsubscribe};
    }

    async browse(host: string, browsePath: string, recursive?: boolean, withTypes?: boolean){
        // const endpointUrl = `opc.tcp://${host}:${port}`;
        const client = await this.connect(host);

        const browseResult = await client.browse(browsePath)

        let results : any[] = [];

        for(const reference of browseResult || []) {

            const name = reference?.browseName?.name?.toString();
            const nsIdx = reference?.browseName?.namespaceIndex?.toString();

            let bp = `${browsePath}/${nsIdx ? `${nsIdx}:` : ''}${name}`;

            if(recursive){
                try{
                    let {type, isArray} = withTypes ? await client.getType(bp, true) : {type: null, isArray: false};

                    const innerResults = await this.browse(host, bp, recursive, withTypes);

                    results.push({
                        id: reference?.nodeId, 
                        name: name, 
                        path: bp,
                        type: type ? fromOPCType(type) : undefined,
                        isArray,
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

    private async onClientLost(endpointUrl: string){
        console.log(`Connection to ${endpointUrl} lost. Retrying...`);
        //Reconnect client
        // try{
        //     await this.clients[endpointUrl].connect(endpointUrl);
        //     console.log(`Reconnected to ${endpointUrl}`);
        // }catch(e: any){
        //     //Backoff
        //     console.error(e.message)
        //     console.log("Retrying in 10 seconds...");
        //     setTimeout(() => {
        //         this.onClientLost(endpointUrl)
        //     }, 10 * 1000);
        // }

        //Resubscribe

        //Failover and message

    }

    async connect(host: string, port?: number){
        const endpointUrl = `opc.tcp://${host}${port ? `:${port}` : ''}`;

        if(this.clients[endpointUrl]) return this.clients[endpointUrl];

        this.clients[endpointUrl] = new OPCUAClient();


		this.clients[endpointUrl].on('close', this.onClientLost.bind(this, endpointUrl))
		this.clients[endpointUrl].on('connection_lost', this.onClientLost.bind(this, endpointUrl))

        await this.clients[endpointUrl].connect(endpointUrl)
      
        return this.clients[endpointUrl];

    }

    async setup_data(host: string, user: string, pass: string, exchange: string){

        this.mqttPublisher = new MQTTPublisher({
            host: host,
            // user: user,
            // pass: pass,
            exchange: 'TestExchange'
        })

        await this.mqttPublisher.setup()
    }

    async publish_data(){
        // this.mqttPublisher?.publish()
    }

    setConfig(options: SidecarOptions){
        this.options = options;
    }  

    getConfig(){
        return this.options;
    }


}

const sidecar = new DevSidecar();

const app = express();

const http = require('http');
const server = http.createServer(app);

const io = new Server(server, {
    allowRequest: (req, fn) => {
        fn(null, true)
    },
    cors: {
        
    }
});

let subscriptions : {[key: string]: {events: EventEmitter, paths: any[], unsubscribe: () => void}}= {};

let current_data : {[key: string]: any} = {};

const dataChanged = (data: any) => {
    io.emit('data-changed', data)
    current_data[data.key] = data.value.value;

    // console.log({data});
    // sidecar.publish_data()
}

app.use(bodyParser.json());
app.use(cors());

app.route('/setup')
    .get((req, res) => {
        res.send({config: sidecar.getConfig()})
    })
    .post(async (req, res) => {
        const config = req.body.config;

        sidecar.setConfig(config);

        await sidecar.setup_data(config.host, config.user, config.pass, config.exchange);
        res.send({config: sidecar.getConfig()})
    })

app.route('/:host/set_data')
    .post(async (req, res) => {
        // if(subscriptions[req.params.host]) return res.send({error:})

        let { path, value } = req.body;

        const { type: dt, isArray } = await sidecar.getDataType(req.params.host, path)
        
        if(!dt) return res.send({error: "No datatype"})
        //TODO pickup dataType from somewhere dynamic
        const code = await sidecar.setData(req.params.host, path, (DataType as any)[dt as any], value);

        res.send({code})
    })

app.post('/:host/subscribe', async (req, res) => {
    // if(subscriptions[req.params.host]) return res.send({error: "Already subscribed"});

    if(subscriptions[req.params.host] && !isEqual(req.body.paths, subscriptions[req.params.host]?.paths)){
        const {events: eventEmitter, unsubscribe} = subscriptions[req.params.host];

        eventEmitter.removeListener('data-changed', dataChanged);
        unsubscribe() 
        
        delete subscriptions[req.params.host];
    }

    if(subscriptions[req.params.host]) {
        // current_data[]
        return res.send({
            data: current_data
        })
    };

        try{
            const {emitter: events, unsubscribe} = await sidecar.subscribe(req.params.host, req.body.paths)

            console.log("Subscribed to", req.body.paths)

            events.on('data-changed', dataChanged)

            subscriptions[req.params.host] = {
                events,
                paths: req.body.paths || [],
                unsubscribe
            };
        }catch(e: any){
            return res.send({error: e.message})
        }

    

    res.send({success: true})
})

app.post('/:host/unsubscribe', async (req, res) => {
    if(!subscriptions[req.params.host]) return res.send({error: "No subscription found"});

    try{
        const {events: eventEmitter, unsubscribe} = subscriptions[req.params.host];

        eventEmitter.removeListener('data-changed', dataChanged);
        unsubscribe()
    }catch(e: any){
        return res.send({error: e.message})
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