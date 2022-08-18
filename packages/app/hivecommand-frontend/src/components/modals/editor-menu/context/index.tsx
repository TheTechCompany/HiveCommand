import React, { useContext } from "react";

export const EditorMenuContext = React.createContext<{
    item?: any;
    setItem?: (item: any) => void;
}>({

})

export const EditorMenuProvider = EditorMenuContext.Provider;

export const useMenuContext = () => useContext(EditorMenuContext);