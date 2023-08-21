import React from 'react';
import { ECADPage } from '..';

export const ElectricalEditorContext = React.createContext<{
    selectedPage?: string;
    pages?: ECADPage[],
    page?: ECADPage;
    
    onUpdatePage?: (page: any, log?: string) => void;
    onReorderPage?: (oldIx: any, newIx: any) => void;

    elements?: any[],
    cursorActive?: boolean,
    cursorPosition?: {x: number, y: number} | null
    draftWire?: any;
    setDraftWire?: any;

    symbolRotation?: number;
    selectedSymbol?: any | null;
    setSelectedSymbol?: any;
}>({});

export const ElectricalEditorProvider = ElectricalEditorContext.Provider

export const useEditorContext = () => React.useContext(ElectricalEditorContext)