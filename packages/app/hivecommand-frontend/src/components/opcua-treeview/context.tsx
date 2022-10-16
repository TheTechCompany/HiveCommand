import React from 'react';


export const TreeMapContext = React.createContext<{items: any[], onMap?: (item: any) => void}>({items: []})

export const TreeMapProvider = TreeMapContext.Provider;

export const useTreeMap = () => React.useContext(TreeMapContext);


const mapNode = (nodes: any) => {
    return nodes.reduce((prev, curr) => {

        const children = mapNode(curr.children || []);
        if(children.length < 1) curr.editable = true;
        return [...prev, curr, ...children];
    }, [])
}

export const useTreeMapNode = (nodeId: string) => {
    const { items } = useTreeMap();

    return mapNode(items).find((a) => a.id == nodeId)
}