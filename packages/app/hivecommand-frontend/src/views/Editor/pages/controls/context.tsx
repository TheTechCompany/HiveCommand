import React, { useContext } from 'react';

export const HMIContext = React.createContext<{
    programId?: string;
    actions?: any[]
    flows?: any[]
    refetch?: () => void;
    selected?: any;
    devices?: any[]
    nodes?: any[]
}>({

});

export const useHMIContext = () => useContext(HMIContext)