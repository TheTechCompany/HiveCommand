import React from "react"

export interface ComponentPack {
        id: string,  
        pack?: { name: string, component?: (props: any) => any }[]
}

export interface ComponentTool {
    pack: string,
    name: string
}
export const InterfaceEditorContext = React.createContext<{
    packs?: ComponentPack[],
    activeTool?: ComponentTool | null,
    changeTool?: (tool: ComponentTool | null) => void,
}>({

})

export const InterfaceEditorProvider = InterfaceEditorContext.Provider;

export const useInterfaceEditor = () => React.useContext(InterfaceEditorContext)