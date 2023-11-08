import React, { useContext } from 'react';
import { HMITag, HMIType, HMITemplate } from '@hive-command/interface-types'
export interface HMIPack {
    id: string;
    name: string;
    url: string;

    elements?: {id: string, name: string}[]
}

export interface HMINodeData {
    position?: {x: number, y: number};
    size?: {width: number, height: number};
    rotation?: number;
}


export const HMIContext = React.createContext<{
    programId?: string;
    actions?: any[]
    interfaces?: any[];
    refetch?: () => void;
    selected?: any;
    
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