import React from 'react'
import { HMIOptions, OPCUASourceOptions } from '../types';

export const DevContext = React.createContext<{
    hmiList: any[];
    opcuaList: any[];

    createOPCUASource?: (name: string, opts: OPCUASourceOptions) => void;
    createHMI?: (name: string, opts: HMIOptions) => void;
}>({
    hmiList: [],
    opcuaList: []
})

export const DevProvider = DevContext.Provider;