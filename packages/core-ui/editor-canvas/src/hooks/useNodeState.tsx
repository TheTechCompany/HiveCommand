import React, {useState} from 'react';
import { NodeChange, Node } from 'reactflow';

export const useNodeState = (initialNodes: Node[]): [
    Node[], 
    React.Dispatch<React.SetStateAction<Node<any>[]>>,
    string[], 
    React.Dispatch<React.SetStateAction<string[]>>,
    (changes: NodeChange[]) => void
] => {

    const [ selectedNodes, setSelectedNodes ] = useState<string[]>([])
    const [ nodes, setNodes ] = useState<Node[]>(initialNodes || []);

    const onNodesChanged = (changes: NodeChange[]) => {

    }

    const addSelect = (edge: Node) => {
        return {
            ...edge,
            selected: (selectedNodes || []).indexOf(edge.id) > -1
        }
    }

    return [nodes.map(addSelect), setNodes, selectedNodes, setSelectedNodes, onNodesChanged]

}