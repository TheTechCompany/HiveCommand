import React from 'react';


export const ElectricalNodesContext = React.createContext<{

    onEdgePointCreated?: (id: string, ix: number, pos: {x: number, y: number}) => void;
    onEdgePointChanged?: (id: string, ix: number, change: {x: number, y: number}) => void; 

    onUpdatePage?: (page: any, log?: string) => void;

    elements?: any[]
    
}>({});

export const ElectricalNodesProvider = ElectricalNodesContext.Provider

export const useElectricalNodeContext = () => React.useContext(ElectricalNodesContext)