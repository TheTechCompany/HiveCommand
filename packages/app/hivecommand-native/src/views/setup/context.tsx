import { HMIProgram } from '@hive-command/command-surface';
import React from 'react'

export type StateUpdateFn = (stateUpdate: (state: GlobalState) => any) => void;

// export type StateUpdate = (key: string, value: any) => void;

export interface GlobalState extends HMIProgram {

    iotEndpoint: string,
    iotSubject: string,
    iotUser: string,
    iotToken: string,

    dataScopes?: { id: string, name: string, plugin: { id: string, name: string, module: string } }[]

}
export const SetupContext = React.createContext<{
    state?: any;
    setState?: any;
    globalState?: GlobalState
    setGlobalState?: StateUpdateFn;
}>({


});

export const SetupProvider = SetupContext.Provider;