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
    ServerOnNetwork
} from 'node-opcua'

import { getNodeId } from '@hive-command/opcua-utils'

export default class Client {
    private client: OPCUAClient;
    private session?: ClientSession;

    public monitors: {
        [key: string]: ClientMonitoredItem 
    } = {}

    private subscription?: ClientSubscription;

    constructor(discoveryServer?: string){
        this.client = OPCUAClient.create({
            endpointMustExist: false,
            discoveryUrl: discoveryServer,
            connectionStrategy: {
                maxRetry: 2,
                initialDelay: 2000,
                maxDelay: 10 * 1000
            }
        })

        // this.client.connect()
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
        await this.client.connect(endpoint)
        this.session = await this.client.createSession()
        
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


    async subscribeMulti(targets: {path: string, tag: string}[]){
        let nodes : any[] = [];
        for (const x of targets){
            const path_id = await this.getPathID(x.path) || ''
            nodes.push({tag: x.tag, path: path_id})
        }
/*        let nodes = await Promise.(targets.map((async (x) => {
            let path_id = await this.getPathID(x.path) || ''
            return {
                tag: x.tag,
                path: path_id
            }
        })))*/
        nodes = nodes?.filter((a) => a.path.length > 0)

        const items = nodes?.map((x) => ({
            tag: x.tag,
            nodeId: x.path,
            attributeId: AttributeIds.Value
        }))

        const params = {
            samplingInterval: 10 * 1000,
            discardOldest: true,
            queueSize: 10
        }

        if(this.subscription){
            let s = this.subscription

            return {
                monitors: ClientMonitoredItemGroup.create(s, items, params, TimestampsToReturn.Both),
                unwrap: (ix: number) => {
                    return items[ix].tag
                }
            }
 
            for(const item of items){
             //   let m = ClientMonitoredItem.create(s, item, params, TimestampsToReturn.Both)
              //  this.monitors[item.tag] = m
            }
        }

        return {
            monitors: null,
            unwrap: () => {}
        }

       // return this.monitors
    }

    async subscribe(opts: {path?: string, nodeId?: string}){
        let node = opts.nodeId;
        if(opts.path) node = await this.getPathID(opts.path)
        const item = {
            nodeId: node,
            attributeId: AttributeIds.Value
        }

        const params = {
            samplingInterval: 10 * 1000,
            discardOldest: true,
            queueSize: 10
        }

        if(this.subscription){
            const monitored = ClientMonitoredItem.create(this.subscription, item, params, TimestampsToReturn.Both)
            return monitored
        }
    }

    async getPathID(path: string){
        let browsePath = new BrowsePath({
            startingNode: getNodeId("RootFolder"),
            relativePath: makeRelativePath(path)
        })

        const browseTranslation = await this.session?.translateBrowsePath(browsePath)
        if(browseTranslation?.targets){
            return browseTranslation?.targets[0].targetId.toString()
        }
    }

    async setDetails(path: string, dataType: DataType, value: any){
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

    async browse(path: string){
        let path_id = await this.getPathID(path);
        if(path_id){
            return await this.session?.browse(path_id)
        }
    }
}