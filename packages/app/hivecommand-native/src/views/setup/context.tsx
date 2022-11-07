import React from 'react'

export const SetupContext = React.createContext<{
    state?: any;
    setState?: any;
    globalState?: any;
    setGlobalState?: any;
}>({

    
});

export const SetupProvider = SetupContext.Provider;