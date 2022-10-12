import React from 'react'

export const SetupContext = React.createContext<{
    state?: any;
    setState?: any;
}>({

});

export const SetupProvider = SetupContext.Provider;