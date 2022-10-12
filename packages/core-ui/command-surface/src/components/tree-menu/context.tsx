import React from 'react';

export const TreeViewContext = React.createContext<{
    onEdit?: (nodeId: string) => void;
    onAdd?: (nodeId: string) => void;
}>({});

export const TreeViewProvider = TreeViewContext.Provider