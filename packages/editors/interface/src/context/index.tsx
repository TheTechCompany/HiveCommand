import { HMITag, HMITemplate, HMIType } from "@hive-command/interface-types";
import React from "react"

import { Node, Edge } from 'reactflow';

export interface ComponentPack {
        id: string,  
        pack?: { name: string, component?: (props: any) => any }[]
}

export interface ComponentTool {
    pack: string,
    name: string
}
export const InterfaceEditorContext = React.createContext<{
    tags?: HMITag[];
    types?: HMIType[];
    templates?: HMITemplate[];

    packs?: ComponentPack[],

    nodes?: Node[];
    edges?: Edge[];

    selected?: {nodes: Node[], edges: Edge[]};

    activeTool?: ComponentTool | null,
    toolRotation?: number,
    changeTool?: (tool: ComponentTool | null) => void,

    grid?: [number | undefined, number | undefined, boolean];
    onChangeGrid?: (grid: [number | undefined, number | undefined, boolean]) => void;

}>({

})

export const InterfaceEditorProvider = InterfaceEditorContext.Provider;

export const useInterfaceEditor = () => React.useContext(InterfaceEditorContext)