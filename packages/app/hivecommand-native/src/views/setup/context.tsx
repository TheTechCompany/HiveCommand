import { HMIProgram } from '@hive-command/command-surface';
import React from 'react'

export type StateUpdateFn = (stateUpdate: (state: GlobalState) => any) => void;

// export type StateUpdate = (key: string, value: any) => void;

export interface GlobalState {
    subscriptionMap?: {
        path: string,
        tag: string
    }[],
    controlLayout?: HMIProgram,
    // {
    //     interface: {
    //         id: string,
    //         nodes: any[],
    //         edges: any[]
    //     }
    //     devices: {
    //         id: string;
    //         tag: string;
    //         type: {
    //             tagPrefix?: string;
    //             state: {
    //                 type: string;
    //                 key: string
    //             }[];
    //         }
    //     }[]
    // },
    networkLayout?: any[]
    deviceMap?: {
        path: string,
        tag: string
    }[]
}
export const SetupContext = React.createContext<{
    state?: any;
    setState?: any;
    globalState?: GlobalState
    setGlobalState?: StateUpdateFn;
}>({


});

export const SetupProvider = SetupContext.Provider;