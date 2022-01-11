import express, { Express } from 'express';
import {createServer, Server as HttpServer} from 'http';
import { Server, Socket } from "socket.io";
import jwt from 'jsonwebtoken'
import jwt_decode from 'jwt-decode';
import bodyParser from 'body-parser'
import { Models, connect_data, disconnect_data } from '@hive-command/data-types'
import routes from './routes';
import { handleSocket } from './socket-handler';
import { HiveCommandData } from '@hive-command/data'
import { DiscoveryService } from '@hive-command/opcua-lds'
import { promises } from 'dns';

import { SyncClient } from './sync-client/SyncClient';
const { Device, Program } = Models;
import os from 'os';
import { Data } from './data';

import amqp from 'amqplib'
import { DataType } from 'node-opcua-variant';

export class DiscoveryServer {
    private app : Express;
    private server : HttpServer;
    private io: Server;

    private data: HiveCommandData;

    private opcuaDiscovery : DiscoveryService;

    private syncClient: SyncClient;

    private dataBroker : Data;

    private requestConsumer? : amqp.Channel

    private connected: any[] = [];

    constructor(){

        this.dataBroker = new Data({
            uri: process.env.NEO4J_URI,
            user: process.env.NEO4J_USER,
            pass: process.env.NEO4J_PASS
        })

        this.opcuaDiscovery = new DiscoveryService({
            port: 4840,
            automaticallyAcceptUnknownCertificate: true,
            force: false,
            applicationName: "HexHive OPCUA Global Discovery Service"
        })
        
        this.syncClient = new SyncClient({discoveryServer: this.opcuaDiscovery})

        this.app = express();
        this.server = createServer(this.app);
        this.io = new Server(this.server)

        this.data = new HiveCommandData()

        console.log("Construct")
        this.initListeners()

        connect_data()
    }

    initListeners(){
        this.app.use(bodyParser.json())
        this.app.use(routes(this.dataBroker))

        this.io.use(async (socket, next) => {

            let remoteAddress = socket.request.socket.remoteAddress

            let ip = remoteAddress?.replace('::ffff:', '')
            console.log("IO-SOCKET", remoteAddress)
            if(!ip) return next(new Error("Couldn't find IP allocation"));
            const [host] = await promises.reverse(ip)
            console.log("IO-SOCKET", host)
           
            let deviceId = host?.replace(".hexhive.io", '');

            (socket as any).networkName = deviceId;

            // let token: string | undefined = socket.request.headers.authorization
            // console.log("Machine info", token);

            // if(token){
            //     const info = jwt_decode(token);

            //     console.log("Machine info", info);

            //     (socket as any).machine_info = info;
            //     next();
            // }
            next();
        })
        this.io.sockets.on('connection', this.onSocketConnect.bind(this))
    }

    /*
        Setup socket listener for base functions

        - identity:proof - Prove identity for socket
        - identity:heartbeat - Heartbeat of settings also used as keep-alive signal
        - system:information - 
    */
    onSocketConnect(socket: Socket){
        console.log("Socket Connected ", socket.id)

        handleSocket(this.data, socket)

        socket.on('disconnect', this.onSocketDisconnect.bind(this, socket))
    }

    async onSocketDisconnect(socket: Socket){
        await this.data.updateLiveness((socket as any)?.networkName, false)
        await this.data.updateMode((socket as any)?.networkName, 'disabled')
        // await Device.updateOne({_id: (socket as any)?.machine_info.id}, {$set: {connected: false}})
        socket.removeAllListeners();
    }


    async listen(port: number){

        const connection = await amqp.connect(
            process.env.RABBIT_URL || 'localhost'
        )

        const channel = await connection.createChannel()
        
        channel.assertQueue(`COMMAND:DEVICE:CONTROL`)
        channel.assertQueue(`COMMAND:DEVICE:MODE`)
        channel.assertQueue(`COMMAND:DEVICE:VALUE`);
        channel.assertQueue(`COMMAND:FLOW:PRIORITIZE`);
        channel.assertQueue(`COMMAND:MODE`)
        channel.assertQueue(`COMMAND:STATE`)

        this.requestConsumer = channel;

        // await this.opcuaServer.start()
        console.log("Listen", this.opcuaDiscovery)
        await this.opcuaDiscovery.init()
        await this.opcuaDiscovery.start()

        await this.syncClient.start()

        channel.consume(`COMMAND:DEVICE:MODE`, async (msg) => {
            let stateUpdate : {
                address: string,
                deviceId: string,
                deviceName: string,
                mode: string
            } = JSON.parse(msg?.content.toString() || '{}')

            if(!stateUpdate.deviceId || !stateUpdate.deviceName) return console.error(`No device in mode event`)
            console.log(`Changing mode ${stateUpdate.deviceName} : ${stateUpdate.mode}`)

            if(!stateUpdate.mode) return console.error(`No mode in mode event`)

            await this.syncClient.write(stateUpdate.address, `/Objects/1:Devices/1:${stateUpdate.deviceName}/1:mode`, DataType.String, stateUpdate.mode)
        },{
            noAck: true
        })

        channel.consume(`COMMAND:FLOW:PRIORITIZE`, async (msg) => {
            let stateUpdate : {
                waitingId: string,
                address: string,
                deviceId: string,
                flow: string
            } = JSON.parse(msg?.content.toString() || '{}')

            if(!stateUpdate.flow) return console.error(`No flow in mode event`)

            await this.syncClient.callMethod(stateUpdate.address,  `/Objects/1:Controller/1:Machine`, `/1:skipTo`, [stateUpdate.flow])

            await this.dataBroker.removeWaitingAction(stateUpdate.deviceId, stateUpdate.waitingId)
        }, {
            noAck: true
        })

        channel.consume(`COMMAND:MODE`, async (msg) => {

            let stateUpdate: {
                address: string;
                mode: string;
            } = JSON.parse(msg?.content.toString() || '{}')

            console.log(`Changing controller mode ${stateUpdate.mode}`)

            if(!stateUpdate.address) return console.error(`No address in mode event`)


            if(stateUpdate.mode === "DISABLED"){
                await this.syncClient.callMethod(stateUpdate.address, `/Objects/1:Controller/1:Machine`, `/1:shutdown`, [])
            }

            await this.syncClient.callMethod(stateUpdate.address, `/Objects/1:Controller/1:Machine`, `/1:changeMode`, [stateUpdate.mode])
         
        }, {
            noAck: true
        })

        channel.consume(`COMMAND:STATE`, async (msg) => {
            let stateUpdate: {
                address: string,
                state: string,
            } = JSON.parse(msg?.content.toString() || '{}')

            console.log(`Changing controller ${stateUpdate.address} state ${stateUpdate.state}`)
            if(!stateUpdate.address) return console.error(`No address in value event`)

            switch(stateUpdate.state){
                case 'on':
                    await this.syncClient.callMethod(stateUpdate.address, `/Objects/1:Controller/1:Machine`, `/1:start`, [])
                case 'off':
                    await this.syncClient.callMethod(stateUpdate.address, `/Objects/1:Controller/1:Machine`, `/1:shutdown`, [])
                case 'standby':
                    await this.syncClient.callMethod(stateUpdate.address, `/Objects/1:Controller/1:Machine`, `/1:standby`, [])
                default:
                    console.error(`Unknown state ${stateUpdate.state}`)
            }
        }, {
            noAck: true
        })

        channel.consume(`COMMAND:DEVICE:VALUE`, async (msg) => {
            let stateUpdate: {
                address: string,
                busPath: string,
                value: string                
            } = JSON.parse(msg?.content.toString() || '{}')

            if(!stateUpdate.address) return console.error(`No address in value event`)

            await this.syncClient.write(stateUpdate.address, stateUpdate.busPath, DataType.Double, stateUpdate.value)
        
        }, {
            noAck: true
        })

        channel.consume(`COMMAND:DEVICE:CONTROL`, async (msg) => {
            let stateUpdate : {
                address: string,
                deviceId: string,
                deviceName?: string
                action?: string;
            } = JSON.parse(msg?.content.toString() || '{}')

            console.log(msg?.content.toString())

            if(!stateUpdate.deviceName || !stateUpdate.deviceId) return console.error("No device in state event");
            console.log(`Writing ${stateUpdate.action} to ${stateUpdate.deviceName}@${stateUpdate.deviceId}`)
            if(!stateUpdate.action) return console.error("No action in state event")
            await this.syncClient.callMethod(stateUpdate.address, `/Objects/1:Controller/1:Machine`, `/1:command`, [stateUpdate.deviceName, stateUpdate.action])
            console.log(`Write complete`)
        }, {
            noAck: true,
        })

        this.server.listen(port, () => {
            console.log("Discovery started")
        })
    }

}