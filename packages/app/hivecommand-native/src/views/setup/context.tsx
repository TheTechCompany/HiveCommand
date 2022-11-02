import { createContext } from "react";

export const SetupContext = createContext<{
    state?: any;
    setState?: any;
}>({

});

export const SetupProvider = SetupContext.Provider;