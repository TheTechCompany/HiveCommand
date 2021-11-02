import {
    BrowsePath,
    DataType,
    EUEngineeringUnit,
    makeEUInformation,
    makeRelativePath,
    Namespace,
    OPCUAServer, RegisterServerMethod, StatusCode, UAObject, UAObjectType, UAVariable, Variant
} from 'node-opcua'
import { networkInterfaces } from 'os';

import { getNodeId } from '@hive-command/opcua-utils'
import { StatusCodes } from 'node-opcua';
import { EUInformation } from 'node-opcua-types';

export interface ServerOpts {
    productName: string;
    hostname?: string;
    discoveryServer?: string;

    controller: {
        [key: string]: {
            type: DataType;
            get: () => Variant;
            set: (variant: Variant) => StatusCode;
        }
    }
}

export default class Server {
    private server: OPCUAServer;

    public namespace?: Namespace;
    public deviceFolder? : UAObject
    public controllerFolder?: UAObject;

    public controller?: UAObjectType;

    private objectTypes: {
        [key: string]: UAObjectType
    } = {};

    private commandEndpoint?: (value: Variant) => void;

    private options : ServerOpts;

    constructor(opts: ServerOpts){
        this.options = opts;

        let discovery = {};
        if(opts.discoveryServer) discovery = {
            discoveryServerEndpointUrl: opts.discoveryServer,
            registerServerMethod: RegisterServerMethod.LDS 
        }
        this.server = new OPCUAServer({
            hostname: opts.hostname || '0.0.0.0',
            port: 8440,
            buildInfo: {
                productName: opts.productName,
                buildDate: new Date()
            },
            ...discovery,
        })
    }

    async initializeController(){
        this.controller = this.namespace?.addObjectType({
            browseName: 'ControllerHw'                
        })

        Object.keys(this.options.controller || {}).forEach((key) => {
            this.namespace?.addVariable({
                browseName: key,
                dataType: this.options.controller[key].type,
                componentOf: this.controller,
                minimumSamplingInterval: 500,
                modellingRule: "Mandatory"
            })
        })
       
    }

    async initializeFolders(){
        const addressSpace = this.server.engine.addressSpace;
        if(addressSpace){
            this.namespace = addressSpace.getOwnNamespace()

            const objectsFolder = addressSpace.rootFolder.objects;
            this.controllerFolder = this.namespace.addFolder(objectsFolder, {browseName: 'Controller'})
            this.deviceFolder = this.namespace.addFolder(objectsFolder, {browseName: 'Devices'})

            // this.namespace.addMethod

            await this.initializeController();
            
        }
    }


    getDeviceTypes(){
        return this.objectTypes;    
    }

    async addControllerInfo(key: string, type: DataType, getter: () => any){

        this.namespace?.addVariable({
            browseName: key,
            componentOf: this.controller,
            dataType: type,
            modellingRule: "Mandatory",
            minimumSamplingInterval: 1000,
            value: {
                get: () => {
                    return getter()
                }
            }
        })
    }

    async addDevice(
            device: {name: string, type: string}, 
            definition: {
                state: {
                    [key: string]: {
                        type: DataType, 
                        get: ((key: string) => any),
                        set?: (value: Variant) => void
                    }
                }
            }
        ){
        if(this.deviceFolder){

            let obj;
            
                let type;
                if(this.objectTypes[device.type]) type = this.objectTypes[device.type];
                if(!this.objectTypes[device.type]) {

                    type = this.namespace?.addObjectType({
                        browseName: device.type,
                    })
                
                    if(!type) return;

                    for(var k in definition?.state){
                        this.namespace?.addAnalogDataItem({
                            browseName: k,
                            dataType: definition?.state[k].type,
                            componentOf: type,
                            modellingRule: "Mandatory",
                            minimumSamplingInterval: 500,
                            engineeringUnits: makeEUInformation('c', 'celsius', 'Celsius'),
                            engineeringUnitsRange: {low: -100, high: 100}
                        })
                    }
                    if(type) this.objectTypes[device.type] = type;

                }


                obj = type?.instantiate({
                    browseName: device.name,
                    organizedBy: this.deviceFolder
                })
                
                for(var k in definition?.state){
                    const key = k;
                    const getter = definition?.state[key]?.get;
                    const setter = definition?.state[key]?.set;

                    (obj?.getComponentByName(k) as UAVariable).bindVariable({
                        get: function (this: UAVariable){
                            // const parts = this.parent?.displayName.toString().split('_')
                            return getter(key)
                        },
                        set: function (this: UAVariable, value: Variant){
                            
                            if(!setter) return StatusCodes.BadNotWritable;
                            
                            try{
                                setter?.(value)

                            }catch(e){
                                console.error("Error writing port value", value)
                            }

                            return StatusCodes.Good;
                        }
                    }, true)

                }
            if(!obj) return;

            return{
                device: obj,
                type: obj.typeDefinitionObj.browseName.toString()
            }

        }
    }

    async getDevice(name: string) {
        let browsePath = new BrowsePath({
            startingNode: getNodeId("RootFolder"),
            relativePath: makeRelativePath(`/Objects/1:Devices`)
        })
        
        const result = this.namespace?.addressSpace.browsePath(browsePath)

        if(result?.targets?.[0].targetId){
            const res : any = this.namespace?.addressSpace.findNode(result?.targets?.[0].targetId)
            let ua : UAObject = res[name];

            return {
                device: ua,
                type: ua.typeDefinitionObj.browseName.toString()
            }

            //console.log((res[name] as UAObject).typeDefinitionObj)
        }
    }

    on(event: string, eventHandler: any){
        this.server.on(event, eventHandler)
    }

    async start(){
        await this.server.initialize();
        await this.initializeFolders();

        await this.server.start()

        const controller = await this.controller?.instantiate({
            browseName: "Machine",
            organizedBy: this.controllerFolder
        });

        const that = this;

        Object.keys(this.options.controller || {}).forEach((key) => {
            (controller?.getComponentByName(key) as UAVariable).bindVariable({
                get: this.options.controller[key].get,
                set: this.options.controller[key].set
            }, true)
        });

        console.log(`=> OPC-UA Server Start: Access = ${this.server.getEndpointUrl()}`)
    }

    async stop(){
        await this.server.shutdown();
    }
}