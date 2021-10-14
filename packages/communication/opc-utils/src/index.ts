import { resolveNodeId, NodeId } from 'node-opcua'

export const getNodeId = (node: any) : NodeId => {
    if(node.nodeId){
        return node.nodeId;
    }

    return resolveNodeId(node)
}