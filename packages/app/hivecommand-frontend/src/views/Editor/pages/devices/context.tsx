import React from 'react';

export interface IDeviceSingleContext {
    device?: {
        type: {
            state: {key: string, units: string}[],
            actions: {id: string, key: string}[]
        },
        plugins: {id: string, key: string}[],
        interlocks: {}[]
        dataInterlocks: {}[]
        units: {id: string, state: {id: string}, inputUnit: string, displayUnit: string}[]
        setpoints: {}[]
    },
    programId?: string;
    deviceId?: string;
    variables?: any[],
    plugins?: {}[]
    devices?: {}[]
    flows?: {}[]

    refetch?: () => void;
}

export const DeviceSingleContext = React.createContext<IDeviceSingleContext>({

})

export const DeviceSingleProvider = DeviceSingleContext.Provider;