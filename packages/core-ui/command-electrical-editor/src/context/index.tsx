import React from 'react';
import { ECADPage } from '..';

export const ElectricalEditorContext = React.createContext<{
    selectedPage?: string;

    selected?: any;
    setSelected?: any;

    pages?: ECADPage[],
    page?: ECADPage;
    
    onUpdatePage?: (page: any, log?: string) => void;
    onReorderPage?: (id: string, above: any, below: any) => void;

    elements?: any[],
    cursorActive?: boolean,
    cursorPosition?: {x: number, y: number} | null
    draftWire?: any;
    setDraftWire?: any;

    clipboard?: any;
    setClipboard?: any;

    selectedSymbol?: any | null;
    setSelectedSymbol?: any;
}>({});

export const ElectricalEditorProvider = ElectricalEditorContext.Provider

export const useEditorContext = () => React.useContext(ElectricalEditorContext)