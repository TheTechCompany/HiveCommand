import client, {Socket} from 'socket.io-client'
import jwt_decode from 'jwt-decode'
import Server from '@hive-command/opcua-server';
import { Device } from '../io-bus/device/Device';
import { ConstantStatusCode, Variant } from 'node-opcua';
import { IOBus } from '../io-bus/IOBus';

export interface RunnerNetworkOpts {
    url: string;

    hostname?: string;
    discoveryServer?: string;

    io: IOBus;

    heartbeatInterval?: number;
    heartbeatFn?: () => any;
    token?: string;
}

export interface RunnerNetworkID {
    id: string;
    slug: string;
}

export class RunnerNetwork {
	private opcuaServer? : Server;

    private options: RunnerNetworkOpts;

    private client?: Socket;
    private heartbeatTimer?: NodeJS.Timer;

    private io: IOBus;

    public networkId?: RunnerNetworkID;

    private devices : {device: Device, typeName: string, fetch: (key?: string) => any}[] = [];

    constructor(opts: RunnerNetworkOpts){
        this.options = opts;

        this.io = opts.io;

        if(this.options.token){
            this.networkId = jwt_decode(this.options.token)
        }



    }


	// async addDevice(device: Device, typeName: string, fetch: (key?: string) => any){
    //     this.devices.push({device, typeName, fetch})
	// }

    async start(hostname: string){
        console.log("Starting Network", this.options.discoveryServer, hostname)
        this.opcuaServer = new Server({
			productName: "CommandPilot",
            hostname: hostname,
			discoveryServer: this.options.discoveryServer
		})

		this.opcuaServer.on('serverRegistered', ()=> {
			console.log("Server Registered")
		})

        await this.opcuaServer.start()

        this.devices.forEach(({device, typeName, fetch}) => {

            this.opcuaServer?.addDevice({
                name: `${device.name}`, 
                type: typeName
            }, {
                state: device.datapoints?.reduce<any>((prev, curr) => {
                    return {
                        ...prev,
                        [curr.name]: {
                            type: curr.type,
                            get: () => {
                                return curr.static ? curr.get?.() : new Variant({dataType: curr.type, value: fetch(curr.name)})
                            }
                        }
                    }
                }, {})
            })

        })

        this.connect(this.options.token);

    }
    setToken(token: string){
        this.options.token = token;
        this.networkId = jwt_decode(this.options.token)
    }

    connect(token?: string){
        console.log(`Connect ${token}`)
        let extraOps : any =  {};

        if(token){
            this.setToken(token)
            extraOps['extraHeaders'] = {Authorization: this.options.token}
        }
        if(this.client != undefined) this.disconnect();
        this.client = client(this.options.url, {
            ...extraOps
        })
        this.client.on('connect', () => {
            this.onConnect()
            this.emitHeartbeat()
        });
    }

    emitHeartbeat(){
        this.client?.emit('identity:heartbeat', this.options.heartbeatFn?.())
    }

    initHeartbeat(){
        this.heartbeatTimer = setInterval(() => this.emitHeartbeat(), this.options.heartbeatInterval)
    }

    emit(ev: string, args: any){
        return this.client?.emit(ev, args)
    }

    on(ev: string, cb: (args: any) => void){
        return this.client?.on(ev, cb)
    }

    async disconnect(){
        await this.client?.disconnect();
        await this.client?.close()
    }

    private onConnect(){
        console.log("=> Runner network initialized")
        this.initHeartbeat();
    }
}


