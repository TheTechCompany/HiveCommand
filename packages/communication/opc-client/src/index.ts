import {
    OPCUAClient,
    ClientSession,
    resolveNodeId,
    makeRelativePath,
    NodeId,
    AttributeIds,
    BrowsePath,
    ClientSubscription,
    ClientMonitoredItem,
    TimestampsToReturn,
    Variant,
    DataType,
    ClientMonitoredItemGroup,
    ServerOnNetwork,
    OPCUAClientBase,
    ReferenceDescription
} from 'node-opcua'
import { getNodeId } from '@hive-command/opcua-utils'

export interface SubscriptionParams {
    samplingInterval: number; // in milliseconds
    discardOldest: boolean, //If queueSize > 1 then this parameter is used to discard the oldest samples in the queue when the queue is full.
    queueSize: number //Max number of notifications that can be in queue (default: 1), counts per tag in subscribeMulti (1 * 5 tags = 5 in queue)
}

export interface OPCSubscription {
    path: string;
    tag?: string;
}

const baseSubscriptionParams : SubscriptionParams = {
    samplingInterval: 500,
    discardOldest: true,
    queueSize: 0
}

export default class Client {
    private client: OPCUAClient;
    
    private session?: ClientSession;
    //TODO add extra session for writing value

    public monitors: {
        [key: string]: ClientMonitoredItem 
    } = {}

    private subscription?: ClientSubscription;

    private subscribedTo: (OPCSubscription | OPCSubscription[])[] = [];

    constructor(discoveryServer?: string){
        // super();

        this.client = OPCUAClient.create({
            endpointMustExist: false,
            discoveryUrl: discoveryServer,
            requestedSessionTimeout: 60 * 1000, //1 minutes
            keepSessionAlive: true,
            connectionStrategy: {
                // maxRetry: 2,
                initialDelay: 1000,
                maxDelay: 60 * 1000
            }
        })

        // this.client.on('')
    }

    // on(key: string, listener: any){
    //     return this.client.on(key, listener)
    // }

    // get isConnected(){
    //     // return this.session.
    // }

    on(event: any, eventHandler: any){
        return this.client.on(event, eventHandler)
    }
    
    async discoverOnNetwork(){
        const servers : ServerOnNetwork[] = await this.client.findServersOnNetwork()
        return servers;
    }

    async discover(){
        const servers = await this.client.findServers()
        return servers
    }

    async getSession(){
        return await this.client.createSession()
    }

    async connect(endpoint: string){

        //TODO if reconnect make sure subscription is re-instated.

        await this.client.connect(endpoint)

        this.session = await this.client.createSession()

        this.session.on('session_closed', () => console.debug("Session closed"))

        this.session.on('keepalive', () => {
            console.log("keep alive packet");
        })

        this.session.on('keepalive_failure', () => {
            console.log("keep alive failed");
        })
        
        this.subscription = ClientSubscription.create(this.session, {
            requestedPublishingInterval: 1000,
            requestedLifetimeCount: 100,
            requestedMaxKeepAliveCount: 10,
            maxNotificationsPerPublish: 100,
            publishingEnabled: true,
            priority: 10
        })
    }

    async disconnect(){
        await this.subscription?.terminate();
        await this.session?.close()
        await this.client.disconnect();
    }


    async subscribeMulti(
        targets: OPCSubscription[], 
        samplingInterval: number = 500,
    ){
        let nodes : any[] = [];
        for (const x of targets){
            const path_id = await this.getPathID(x.path) || ''
            nodes.push({tag: x.tag, path: path_id})
        }

        nodes = nodes?.filter((a) => a.path.length > 0)

        const items = nodes?.map((x) => ({
            tag: x.tag,
            nodeId: x.path,
            attributeId: AttributeIds.Value
        }))

        if(this.subscription){
            let s = this.subscription

            const group =  ClientMonitoredItemGroup.create(s, items, {
                ...baseSubscriptionParams, 
                samplingInterval
            }, TimestampsToReturn.Both)
            
            this.subscribedTo.push(targets)

            return {
                unsubscribe: () => {
                    group.terminate();
                },
                monitors: group,
                unwrap: (ix: number) => {
                    return items[ix].tag
                }
            }
 
       
        }

        return {
            unsubscribe: () => {

            },
            monitors: null,
            unwrap: () => {}
        }

       // return this.monitors
    }

    async subscribe(target: OPCSubscription, samplingInterval: number = 500){

        const path_id = await this.getPathID(target.path) || ''

        const item = {
            nodeId: path_id,
            attributeId: AttributeIds.Value
        }

        if(this.subscription){
            const monitored = ClientMonitoredItem.create(this.subscription, item, {
                ...baseSubscriptionParams, 
                samplingInterval
            }, TimestampsToReturn.Both)

            this.subscribedTo.push(target)

            return monitored
        }
    }

    async getPathID(path: string){
        let browsePath = new BrowsePath({
            startingNode: getNodeId("RootFolder"),
            relativePath: makeRelativePath(path)
        })

        try{
            const browseTranslation = await this.session?.translateBrowsePath(browsePath)
        
            if(browseTranslation?.targets){
                return browseTranslation?.targets[0].targetId.toString()
            }
        }catch(e){
            console.log("Error getting path for ", path)
        }
    }

    getOPCUAType(input: string | number | boolean){
        switch(typeof(input)){
            case 'number':
                return DataType.Double
            case 'string':
                return DataType.String;
            case 'boolean':
                return DataType.Boolean
            default: 
                return DataType.String
        }
    }

    /*
        Call method on opposing OPCUA server
        Path is relative to root folder e.g. /1:Objects/1:Controller/1:Machine
        Method is relative to path e.g. /1:SetMachineState

    */  
    async callMethod(path: string, method: string, args: (number | string | boolean)[]){
        return await new Promise(async (resolve, reject) => {
            let nodeId, methodId;
            try{
                 nodeId = await this.getPathID(path)
                 methodId = await this.getPathID(`${path}${method}`)
    
            }catch(e){
                return reject("Couldn't resolve method")
            }
        
            const input_args = args.map((k) => { 
                return new Variant({dataType: this.getOPCUAType(k), value: k})
            })

            this.session?.call({
                objectId: nodeId,
                methodId: methodId,
                inputArguments: input_args,
            }, (err, result) => {
                if(err) reject(err)
                resolve(result)
            })
        })
    }

    async setDetails(path: string, dataType: DataType, value: any){
        // console.log("SeDetails")
        const nodeId = await this.getPathID(path)
        return await this.session?.write({
            nodeId: nodeId,
            attributeId: AttributeIds.Value,
            value: {value: new Variant({dataType: dataType, value})}
        })
    }

    async getDetails(path: string){
        const nodeId = await this.getPathID(path)
        return await this.session?.read({
            nodeId: nodeId,
            attributeId: AttributeIds.Value
        })
    }

    async getType(path: string, isArray?: boolean) : Promise<{type: string, isArray: boolean}> {
        const nodeId = await this.getPathID(path)
        // this.session.read

        // if(!this.session) throw new Error("Session isn't available");
        
        let attributesToRead = [{
            nodeId,
            attributeId: AttributeIds.DataType
        }];

        if(isArray){
            attributesToRead.push({
                nodeId,
                attributeId: AttributeIds.ValueRank
            })
        }

        const resp = await this.session?.read(attributesToRead)

        if(!resp) throw new Error("No response from node " + path);

        let [ typeResp, arrayResp ] = resp;

        return {
            type: DataType[typeResp?.value.value?.value],
            isArray: arrayResp.value.value > 0 //DataType[typeResp?.value.value]
        }
    }

    async browse(path: string){
        let path_id = await this.getPathID(path);
        if(path_id){
            const results = await this.session?.browse(path_id)
            return results?.references || [];
        }
        return null;
    }

    async scan(startPath: string, recursive?: boolean, blacklist?: string[]){
        let results : ReferenceDescription[] = await this.browse(startPath) || [];

        // let outputResults = [];
        
        if(recursive){
            let newResults : any[] = [];
            for(const result of results){

                let extension = `${startPath}/${result.browseName.namespaceIndex}:${result.browseName.name}`

                if((blacklist || []).map((x) => x.indexOf(extension) > -1).indexOf(true) < 0){

                    const type = await this.session?.read({
                        nodeId: result.nodeId,
                        attributeId: AttributeIds.DataType
                    })

                    const children = await this.scan(extension, recursive)

                    
                    newResults.push({
                        path: extension,
                        label: result.browseName.name,
                        type: DataType[type?.value?.value?.value],
                        // ...result, 
                        children: children.length > 0 ? children : undefined
                    })
                }

            }
            results = newResults;
            return results;
        }

        return results.map((x) => ({
            path: `${startPath}/${x.browseName.namespaceIndex}:${x.browseName.name}`,
            type: x.typeDefinition,
        }));
    }
}