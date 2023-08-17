import React from 'react';
import { ECADPage } from '..';

export const ElectricalEditorContext = React.createContext<{
    selectedPage?: string;
    pages?: ECADPage[],
    onUpdatePage?: (page: any) => void;

    elements?: any[],
    cursorActive?: boolean,
    cursorPosition?: {x: number, y: number} | null
    symbolRotation?: number;
    selectedSymbol?: any | null;
    setSelectedSymbol?: any;
}>({});

export const ElectricalEditorProvider = ElectricalEditorContext.Provider

export const useEditorContext = () => React.useContext(ElectricalEditorContext)