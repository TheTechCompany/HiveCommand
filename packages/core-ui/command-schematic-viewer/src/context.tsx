import React from 'react';
import { ReactFlowProvider } from 'reactflow';

export const SchematicViewerContext = React.createContext<any>({});

export const SchematicViewerContextProvider = SchematicViewerContext.Provider;

export interface SchematicViewerProviderProps {
    value?: any;
}

export const SchematicViewerProvider : React.FC<SchematicViewerProviderProps> = (props) => {
    return (
        <ReactFlowProvider>
            <SchematicViewerContextProvider value={props.value}>
            {props.children}
            </SchematicViewerContextProvider>
        </ReactFlowProvider>
    )
}