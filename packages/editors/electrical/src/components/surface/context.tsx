import React from "react";

export const EditorContext = React.createContext<{surface?: React.RefObject<HTMLDivElement>}>({});

export const EditorProvider = EditorContext.Provider;

export const useEditor = () => React.useContext(EditorContext)