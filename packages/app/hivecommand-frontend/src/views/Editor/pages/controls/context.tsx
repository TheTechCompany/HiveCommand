import React, { useContext } from 'react';

export interface HMINodeData {
    position?: {x: number, y: number};
    size?: {width: number, height: number};
    rotation?: number;
}

export const HMIContext = React.createContext<{
    programId?: string;
    actions?: any[]
    flows?: any[]
    interfaces?: any[];
    refetch?: () => void;
    selected?: any;
    devices?: any[]
    nodes?: any[]

    updateNode?: (
        id: string, 
        data: ((data: HMINodeData) => HMINodeData)
    ) => void;
}>({

});

export const useHMIContext = () => useContext(HMIContext)