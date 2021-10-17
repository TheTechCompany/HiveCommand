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

export interface ServerOpts {
    productName: string;
    hostname?: string;
    discoveryServer?: string;
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

    constructor(opts: ServerOpts){
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

    async initializeFolders(){
        const addressSpace = this.server.engine.addressSpace;
        if(addressSpace){
            this.namespace = addressSpace.getOwnNamespace()

            const objectsFolder = addressSpace.rootFolder.objects;
            this.controllerFolder = this.namespace.addFolder(objectsFolder, {browseName: 'Controller'})
            this.deviceFolder = this.namespace.addFolder(objectsFolder, {browseName: 'Devices'})

            this.controller = this.namespace.addObjectType({
                browseName: 'ControllerHw'                
            })
        }
    }

    initializeObjectTypes(){
        if(this.namespace){
            // this.objectTypes = ObjectTypes(this.namespace)
        }
//        valve(this.namespace!, this.deviceFolder!)
//        this.namespace?.addObjectType(valve)
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
                        set?: (value: Variant, callback: (err: Error | null, statusCode: StatusCode) => void) => void
                    }
                }
            }
        ){
        if(this.deviceFolder){

            let obj;
              
                console.log("DEF", definition)     

                let type;
                if(this.objectTypes[device.type]) type = this.objectTypes[device.type];
                if(!this.objectTypes[device.type]) {

                    type = this.namespace?.addObjectType({
                        browseName: device.type,
                    })
                

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

                console.log("Instantiating", device, definition)

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
                        set: function (this: UAVariable, value: Variant, callback: (err: Error | null, statusCode: StatusCode) => void){
                            setter?.(value, callback)
                        }
                    }, true)

                }
            if(!obj) return;

            /*
            (obj.getComponentByName("Input") as UAVariable).bindVariable({
                    get: function(this: UAVariable){
                        console.log("GET Var", this.parent?.displayName[0].text)
                        return new Variant({dataType: DataType.Double, value: Math.random()})
                    }
            }, true)
            
            this.namespace?.addVariable({
                browseName: "Inputs",
                dataType: DataType.Double,
                componentOf: obj,
                minimumSamplingInterval: 100,
                value: {
                    get: function(this: UAVariable) {
                        console.log("Random val", this.parent?.browseName.toString())
                        return new Variant({dataType: DataType.Double, value: Math.random()})
                    },
                    set: function(this: UAVariable, value: Variant){
                        console.log("SET", this.parent?.browseName.toString(), value.toString())
                    }
                }
            })*/

            return{
                device: obj,
                type: obj.typeDefinitionObj.browseName.toString()
            }

            /*
            let dev_node = this.namespace?.addFolder(this.deviceFolder, {browseName: device.name})
            this.namespace?.addVariable({
                componentOf: dev_node,
                browseName: "var",
                nodeId: `s=${device.name}-var`,
                dataType: 'Double',
                minimumSamplingInterval: 1000,
                value: {
                    get: () => new Variant({dataType: 'Double', value: Math.random()})
                }
            })*/
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
        await this.initializeObjectTypes();
        await this.server.start()
        await this.controller?.instantiate({
            browseName: "Controller",
            organizedBy: this.controllerFolder
        })

        console.log(`=> OPC-UA Server Start: Access = ${this.server.getEndpointUrl()}`)
    }

    async stop(){
        await this.server.shutdown();
    }
}