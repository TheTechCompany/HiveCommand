import React from 'react'

export type StateUpdateFn = (stateUpdate: (state: any) => any) => void;

// export type StateUpdate = (key: string, value: any) => void;

export const SetupContext = React.createContext<{
    state?: any;
    setState?: any;
    globalState?: {
        subscriptionMap?: any[],
        controlLayout?: {
            devices: any[]
        },
        networkLayout?: any[]
        deviceMap?: {
            path: string, 
            tag: string
        }[]
    };
    setGlobalState?: StateUpdateFn;
}>({

    
});

export const SetupProvider = SetupContext.Provider;