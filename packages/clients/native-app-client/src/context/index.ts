import React from 'react';

export const  NativeContext = React.createContext<{
    isSidecarRunning?: boolean
}>({});

export const useNativeContext = () => React.useContext(NativeContext)

export const NativeProvider = NativeContext.Provider