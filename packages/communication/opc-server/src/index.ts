import {
    ArgumentOptions,
    BrowsePath,
    DataType,
    EUEngineeringUnit,
    makeEUInformation,
    makeRelativePath,
    Namespace,
    OPCUAServer, RegisterServerMethod, StatusCode, UAMethod, UAObject, UAObjectType, UAVariable, Variant
} from 'node-opcua'
import { networkInterfaces } from 'os';

import { getNodeId } from '@hive-command/opcua-utils'
import { StatusCodes } from 'node-opcua';
import { EUInformation } from 'node-opcua-types';
import { DeviceManager } from './device-manager';

export interface ServerOpts {
    productName: string;
    hostname?: string;
    discoveryServer?: string;

    controller?: {
        state?: {
            [key: string]: {
                type: DataType;
                get: () => Variant;
                set?: (variant: Variant) => StatusCode;
            }
        },
        actions?: {
            [key: string]: {
                inputs: ArgumentOptions[]
                outputs: ArgumentOptions[]
                func: (args: Variant[]) => Promise<[Error | null, Variant[]]>
            }
        }
    }
}

export default class Server {
    private server: OPCUAServer;

    public namespace?: Namespace;

    public deviceFolder? : UAObject //Stores all the device for a program
    public controllerFolder?: UAObject; //Contains all the major actions for controlling the program
    
    public plantFolder?: UAObject; //Stores all high-level plant information
    public plantActions?: UAObject;

    public controller?: UAObjectType;
    public plant?: UAObjectType;

    private objectTypes: {
        [key: string]: UAObjectType
    } = {};

    private commandEndpoint?: (value: Variant) => void;

    private options : ServerOpts;

    private deviceManager : DeviceManager;

    constructor(opts: ServerOpts){
        this.options = opts;

        this.deviceManager = new DeviceManager();

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
        this.plant = this.namespace?.addObjectType({
            browseName: 'Plant',
        })

      
        this.controller = this.namespace?.addObjectType({
            browseName: 'ControllerHw'                
        })

        if(this.controller !== undefined) {

            const controller = this.controller;

            //Init state vars
            Object.keys(this.options.controller?.state || {}).forEach((key) => {
                this.namespace?.addVariable({
                    browseName: key,
                    dataType: this.options.controller?.state?.[key].type,
                    componentOf: this.controller,
                    minimumSamplingInterval: 500,
                    modellingRule: "Mandatory"
                })
            })

            //Init actions
            Object.keys(this.options.controller?.actions || {}).forEach((key) => {
                this.namespace?.addMethod(controller, {
                    browseName: key,
                    inputArguments: this.options.controller?.actions?.[key].inputs,
                    outputArguments: this.options.controller?.actions?.[key].outputs,
                    modellingRule: "Mandatory"
                })
            })
        }
       
    }

    async initializeFolders(){
        const addressSpace = this.server.engine.addressSpace;
        if(addressSpace){
            this.namespace = addressSpace.getOwnNamespace()

            const objectsFolder = addressSpace.rootFolder.objects;
            this.controllerFolder = this.namespace.addFolder(objectsFolder, {browseName: 'Controller'})
            this.deviceFolder = this.namespace.addFolder(objectsFolder, {browseName: 'Devices'})
           
            this.plantFolder = this.namespace.addFolder(objectsFolder, {browseName: 'Plant'})
            this.plantActions = this.namespace.addFolder(this.plantFolder, {browseName: 'Actions'})
            // this.namespace.addMethod

            await this.initializeController();
            
        }
    }

    getDeviceTypes(){
        return this.objectTypes;    
    }

    async addDevice(
            device: {name: string, type: string}, 
            definition?: {
                state: {
                    [key: string]: {
                        type: DataType, 
                        get: ((key: string) => any),
                        set?: (value: Variant) => void
                    }
                },
                actions?: {
                    [key: string]: {
                        inputs?: ArgumentOptions[],
                        outputs?: ArgumentOptions[],
                        func: (args: Variant[]) => Promise<Variant[]>
                    }
                }
            },
            organizedBy?:  "Devices" | "Plant" | "Controller" | "PlantActions"
        ){

        let organizedFolder : UAObject | undefined = this.deviceFolder;

        switch(organizedBy){
            case 'Devices':
                organizedFolder = this.deviceFolder;
                break;
            case 'Controller':
                organizedFolder = this.controllerFolder;
                break;
            case 'Plant':
                organizedFolder = this.plantFolder;
                break;
            case 'PlantActions':
                organizedFolder = this.plantActions;
                break;
            default:
                organizedFolder = this.deviceFolder;
                break;
        }

        if(organizedFolder){

            let obj;
            
                let type;
                if(this.objectTypes[device.type]) type = this.objectTypes[device.type];
                
                //No template ready, make one now
                if(!this.objectTypes[device.type]) {

                    type = this.namespace?.addObjectType({
                        browseName: device.type,
                    })
                
                    if(!type) return;

                    //Initialize actions
                    for(var key in definition?.actions){
                        this.namespace?.addMethod(type, {
                            browseName: key,
                            inputArguments: definition?.actions[key].inputs,
                            outputArguments: definition?.actions[key].outputs,
                            modellingRule: "Mandatory"
                        })
                    }
                    //Initialize state variables
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
                    organizedBy: organizedFolder
                })
                
           

                for(var k in definition?.actions){
                    const key = k;
                   (obj?.getMethodByName(key) as UAMethod)?.bindMethod(async (inputs, context, callback) => {
                        //   callback()
                        console.log(`Key ${key}`)
                        try{
                            const outputs = await definition?.actions?.[key].func(inputs)
                            callback(null, {statusCode: StatusCodes.Good, outputArguments: outputs})
                        }catch(err : any){
                            callback(err, {statusCode: StatusCodes.BadInternalError})
                        }

                   });

                }

                for(var k in definition?.state){
                    const key = k;
                    const getter = definition?.state[key]?.get;
                    const setter = definition?.state[key]?.set;

                    (obj?.getComponentByName(k) as UAVariable).bindVariable({
                        get: function (this: UAVariable){
                            // const parts = this.parent?.displayName.toString().split('_')
                            return getter?.(key)
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

        // const plant = await this.plant?.instantiate({
        //     browseName: "Plant",
        //     organizedBy: this.controllerFolder
        // })

        const that = this;

        //Bind controller state vars
        Object.keys(this.options.controller?.state || {}).forEach((key) => {
            (controller?.getComponentByName(key) as UAVariable).bindVariable({
                get: this.options.controller?.state?.[key].get || (() => {return  new Variant({dataType: DataType.Double, value: 0})}),
                set: this.options.controller?.state?.[key].set
            }, true)
        });

        //Bind controller actions
        Object.keys(this.options.controller?.actions || {}).forEach((key) => {
            (controller?.getMethodByName(key) as UAMethod).bindMethod(async (inputs, context, callback) => {
                return await new Promise(async (resolve, reject) => {
                    try{
                        const result = await this.options.controller?.actions?.[key].func(inputs)
                        if(!result) return callback(null, {statusCode: StatusCodes.BadInternalError})
                        
                        const [ err, output ] = result;
                        callback(null, {statusCode: err ? StatusCodes.Bad : StatusCodes.Good, outputArguments: output})
                    }catch(e: any){
                        callback(e, {statusCode: StatusCodes.BadInternalError})
                    }
                })

            })
        })


        console.log(`=> OPC-UA Server Start: Access = ${this.server.getEndpointUrl()}`)
    }

    async stop(){
        await this.server.shutdown();
    }
}