import express, { Express } from 'express';
import {createServer, Server as HttpServer} from 'http';
import { Server, Socket } from "socket.io";
import bodyParser from 'body-parser'
import routes from './routes';
import { handleSocket } from './socket-handler';
import { DiscoveryService } from '@hive-command/opcua-lds'
import { promises } from 'dns';
import { log } from './logging'
import { SyncClient } from './sync-client/SyncClient';
import { Data } from './data';
import { PrismaClient, cache } from '@hive-command/data'

import { IOTServer } from '@hive-command/iot-server'

import amqp from 'amqplib'
import { DataType } from 'node-opcua-variant';

export interface DiscoveryServerOptions {
    apiKey?: string;
    gatewayURL?: string;
    rootFolder?: string;
    fqdn?: string;
}

export class DiscoveryServer {
    private app : Express;
    private server : HttpServer;
    private io: Server;

    private prisma: PrismaClient;

    private opcuaDiscovery : DiscoveryService;

    private syncClient: SyncClient;

    private dataBroker : Data;

    private options: DiscoveryServerOptions;

    // private iotServer: IOTServer;

    constructor(opts: DiscoveryServerOptions){
        this.options = opts;

        this.prisma = new PrismaClient()

        // this.iotServer = new IOTServer();

        cache.connect_to(process.env.MONGO_URL || '');

        this.dataBroker = new Data({
            gatewayURL: opts.gatewayURL,
            apiKey: opts.apiKey
        })

        this.opcuaDiscovery = new DiscoveryService({
            port: 4840,
            // rootFolder: opts.rootFolder,
            automaticallyAcceptUnknownCertificate: true,
            // force: true,
            fqdn: this.options.fqdn,
            applicationName: "HiveCommand OPCUA"
        })
        
        this.syncClient = new SyncClient({prisma: this.prisma, discoveryServer: this.opcuaDiscovery, broker: this.dataBroker})

        this.app = express();
        this.server = createServer(this.app);
        this.io = new Server(this.server)

        console.log("Construct")
        this.initListeners()
    }

    initListeners(){
        this.app.use(bodyParser.json())
        this.app.use(routes(this.dataBroker))

        // this.app.use('/iot', this.iotServer.router);
        
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

        handleSocket(this.prisma, socket)

        socket.on('disconnect', this.onSocketDisconnect.bind(this, socket))
    }

    async onSocketDisconnect(socket: Socket){
        //TODO add graphql update
        
        const networkName = (socket as any)?.networkName;

     
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
        channel.assertQueue(`COMMAND:DEVICE:SETPOINT`)
        channel.assertQueue(`COMMAND:FLOW:PRIORITIZE`);
        channel.assertQueue(`COMMAND:MODE`)
        channel.assertQueue(`COMMAND:STATE`)

        // await this.opcuaServer.start()
        console.log("Listen", this.opcuaDiscovery)
        await this.opcuaDiscovery.init()
        await this.opcuaDiscovery.start()

        await this.syncClient.start()

        channel.consume(`COMMAND:DEVICE:MODE`, async (msg) => {
            let stateUpdate : {
                authorizedBy: string,
                address: string,
                deviceId: string,
                deviceName: string,
                mode: string
            } = JSON.parse(msg?.content.toString() || '{}')

            if(!stateUpdate.deviceId || !stateUpdate.deviceName) return console.error(`No device in mode event`)

            log(stateUpdate.authorizedBy, `Changing mode ${stateUpdate.deviceName} : ${stateUpdate.mode}`)

            if(!stateUpdate.mode) return console.error(`No mode in mode event`)

            await this.syncClient.write(stateUpdate.address, `/Objects/1:Devices/1:${stateUpdate.deviceName}/1:mode`, DataType.String, stateUpdate.mode)
        },{
            noAck: true
        })

        channel.consume(`COMMAND:DEVICE:SETPOINT`, async (msg) => {
            let stateUpdate : {
                authorizedBy: string,
                address: string,
                deviceName: string,
                deviceSetpoint: string,
                value: string
            } = JSON.parse(msg?.content.toString() || '{}')

            console.log({stateUpdate})

            if(!stateUpdate.deviceName || !stateUpdate.deviceSetpoint || !stateUpdate.value) return console.error('No device setpoint or value in request');

            log(stateUpdate.authorizedBy, `Changing setpoint ${stateUpdate.deviceSetpoint} to ${stateUpdate.value}`)

            await this.syncClient.write(stateUpdate.address, `/Objects/1:Devices/1:${stateUpdate.deviceName}/1:Setpoints/1:${stateUpdate.deviceSetpoint}`, DataType.Double, stateUpdate.value)
        }, {
            noAck: true
        })

        channel.consume(`COMMAND:FLOW:PRIORITIZE`, async (msg) => {
            let stateUpdate : {
                authorizedBy: string,
                waitingId: string,
                address: string,
                deviceId: string,
                flow: string
            } = JSON.parse(msg?.content.toString() || '{}')

            log(stateUpdate.authorizedBy, `is waiting for flow ${stateUpdate.flow}`)
            if(!stateUpdate.flow) return console.error(`No flow in mode event`)

            await this.syncClient.callMethod(stateUpdate.address,  `/Objects/1:Plant/1:Actions/1:${stateUpdate.flow}`, `/1:start`, [])

            await this.dataBroker.removeWaitingAction(stateUpdate.deviceId, stateUpdate.waitingId)
        }, {
            noAck: true
        })

        channel.consume(`COMMAND:MODE`, async (msg) => {

            let stateUpdate: {
                authorizedBy: string,
                address: string;
                mode: string;
            } = JSON.parse(msg?.content.toString() || '{}')

            log(stateUpdate.authorizedBy, `Changing controller mode ${stateUpdate.mode}`)

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
                authorizedBy: string,
                address: string,
                state: string,
            } = JSON.parse(msg?.content.toString() || '{}')

            log(stateUpdate.authorizedBy, `Changing controller ${stateUpdate.address} state ${stateUpdate.state}`)
            if(!stateUpdate.address) return console.error(`No address in value event`)

            switch(stateUpdate.state){
                case 'on':
                    await this.syncClient.callMethod(stateUpdate.address, `/Objects/1:Controller/1:Machine`, `/1:start`, [])
                    break;
                case 'off':
                    await this.syncClient.callMethod(stateUpdate.address, `/Objects/1:Controller/1:Machine`, `/1:shutdown`, [])
                    break;
                case 'standby':
                    await this.syncClient.callMethod(stateUpdate.address, `/Objects/1:Controller/1:Machine`, `/1:standby`, [])
                    break;
                default:
                    console.error(`Unknown state ${stateUpdate.state}`)
            }
        }, {
            noAck: true
        })

        channel.consume(`COMMAND:DEVICE:VALUE`, async (msg) => {
            let stateUpdate: {
                authorizedBy: string,
                address: string,
                busPath: string,
                dataType: "UIntegerT" | "BooleanT" | "Boolean" | "IntegerT",
                value: string                        
            } = JSON.parse(msg?.content.toString() || '{}')

            log(stateUpdate.authorizedBy, `Changing value ${stateUpdate.busPath} to ${stateUpdate.value} dt: ${stateUpdate.dataType}`)

            if(!stateUpdate.address) return console.error(`No address in value event`)

            let dt = DataType.Double;

            if(stateUpdate.dataType == "BooleanT" || stateUpdate.dataType == "Boolean"){
                dt = DataType.Boolean;
            }

            try{
                await this.syncClient.write(stateUpdate.address, stateUpdate.busPath, dt, stateUpdate.value)
            }catch(e: any){
                console.error(e.message)
            }
        
        }, {
            noAck: true
        })

        channel.consume(`COMMAND:DEVICE:CONTROL`, async (msg) => {
            let stateUpdate : {
                authorizedBy: string,
                address: string,
                deviceId: string,
                deviceName?: string
                action?: string;
            } = JSON.parse(msg?.content.toString() || '{}')

            console.log(msg?.content.toString())

            if(!stateUpdate.deviceName || !stateUpdate.deviceId) return console.error("No device in state event");
            
            log(stateUpdate.authorizedBy, `Writing ${stateUpdate.action} to ${stateUpdate.deviceName}@${stateUpdate.deviceId}`)

            if(!stateUpdate.action) return console.error("No action in state event")
            await this.syncClient.callMethod(stateUpdate.address, `/Objects/1:Controller/1:Machine`, `/1:command`, [stateUpdate.deviceName, stateUpdate.action])
            // console.log(`Write complete`)
        }, {
            noAck: true,
        })

        this.server.listen(port, () => {
            console.log("Discovery started")
        })
    }

}