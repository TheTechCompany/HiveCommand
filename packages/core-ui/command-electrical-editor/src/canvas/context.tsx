import React, { useContext } from 'react';

export const CanvasContext = React.createContext<{
    wrapper?: any;
}>({

});

export const CanvasProvider = CanvasContext.Provider;

export const useCanvasContext = () => useContext(CanvasContext)