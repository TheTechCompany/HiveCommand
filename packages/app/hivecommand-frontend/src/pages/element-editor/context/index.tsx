import React from 'react';


export const ElementEditorContext = React.createContext<{
    editDevice?: any;
}>({});

export const ElementEditorProvider = ElementEditorContext.Provider;