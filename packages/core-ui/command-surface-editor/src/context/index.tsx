import React, { useContext } from 'react';
import { Node, Edge } from 'reactflow';

export interface HMINodeData {
    position?: {x: number, y: number};
    size?: {width: number, height: number};
    rotation?: number;
}

export interface HMITag {
    id: string;
    name: string;
    type: string;
}

export interface HMIType {
    id: string;
    name: string;
    fields: {id: string, name: string, type: string}[];
}

export interface HMITemplate {
    id: string;
    name: string;

    inputs?: any[];
    outputs?: {id: string, name: string, type: string}[];

    edges?: any[];

}

export const HMIContext = React.createContext<{
    programId?: string;
    actions?: any[]
    interfaces?: any[];
    selected?: {
        nodes: Node[],
        edges: Edge[]
    };
    setSelected?: (selected: {nodes: Node[], edges: Edge[]}) => void;
    tags?: HMITag[]
    types?: HMIType[];

    templates?: HMITemplate[];

    nodes?: any[]

    updateNode?: (
        id: string, 
        data: ((data: HMINodeData) => HMINodeData)
    ) => void;
}>({

});

export const useHMIContext = () => useContext(HMIContext)