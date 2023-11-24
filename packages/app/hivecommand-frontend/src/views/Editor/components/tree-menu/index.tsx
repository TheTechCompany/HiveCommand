import React, { useState } from 'react';

import { TreeView, TreeItem, TreeItemProps } from '@mui/x-tree-view'
import { Add, ChevronRight, ExpandMore } from '@mui/icons-material';
import { CustomTreeItem, MenuItem, MenuItemGroup } from './item';
import { TreeViewProvider } from './context';
import { Box, IconButton, Typography } from '@mui/material';
import { HexHiveTheme } from '@hexhive/styles';
import { useMatch, useNavigate, useResolvedPath } from 'react-router-dom';

export interface TreeMenuItem {
    id: string;
    name: string;
    icon?: any;
    dontAdd?: boolean;
    dontEdit?: boolean;
    children?: TreeMenuItem[];

    element?: any;
}

export interface TreeMenuProps {
    onNodeSelect?: (nodeId: string) => void;
    onEdit?: (nodeId: string) => void;
    onAdd?: (nodeId?: string) => void;
    // selected?: string;

    items?: TreeMenuItem[]

    label?: string;
}

export const TreeMenu : React.FC<TreeMenuProps> = (props) => {

    const [ expanded, setExpanded ] = useState<string[]>([]);

    const topLevel = props.items?.filter((item) => {
        return useMatch(useResolvedPath(item.id?.split('-root')?.[0] + '/*').pathname) != null
    })

    const renderItems = (items: any[], parentId?: string) => {
        return items.map((item) => (
            <CustomTreeItem decoration={item.icon} parentId={parentId} nodeId={item.id} dontAdd={item.dontAdd} dontEdit={item.dontEdit} label={item.name}>
                {renderItems(item.children ||[], item.id?.split('-root')?.[0])}
            </CustomTreeItem>
        ))
    }

    const expandedNodeIds = [...new Set(expanded.concat((topLevel || []).map((x) => x.id)))]

    const navigate = useNavigate();


    return (
    <Box sx={{display: 'flex', overflowY: 'auto', flex: 1}}>
        <TreeViewProvider value={{onEdit: props.onEdit, onAdd: props.onAdd}}>
        
            <TreeView
                onNodeSelect={(event, node) => {
                    // console.log({nodeId})
                    // props.onNodeSelect?.(nodeId);
                    // navigate()

                    let isRoot = node.match(/(.+)-root/);
                    if(isRoot){
                        // setSelected({
                        //     id: isRoot[1],
                        //     type: 'root'
                        // })
                        if((props.items || []).find((a) => a.id == node)?.element){
                            navigate(isRoot[1])
                        }
                        // setView(node.match(/(.+)-root/)?.[1] as any)
                    }else{

                        console.log("SELECTING NEW ITEM")

                        let elements = ((props.items || []) as any[]).reduce((prev, curr) => {
                            return [...prev, ...(curr.children || []).map((x) => ({...x, parent: curr.id}))]
                        }, [])

                        let element = elements.find((a) => a?.id == node);

                        let root = element?.parent?.match(/(.+)-root/)?.[1];

                        // setSelected({
                        //     id: node,
                        //     parent: element?.parent,
                        //     type: 'editor',
                        // })

                        navigate(root + '/'+ node)
                    }
                }}
                expanded={expandedNodeIds}
                onNodeToggle={(ev, nodeIds) => {
                    setExpanded(nodeIds);
                }}
                selected={undefined}
                sx={{ flex: 1, userSelect: 'none', maxWidth: `100%` }}
                defaultCollapseIcon={<ExpandMore />}
                defaultExpandIcon={<ChevronRight />}
            >
                {renderItems(props.items || [])}
                {/* {props.items?.map((item) => (
                    <CustomTreeItem decoration={item.icon} nodeId={item.id} dontAdd={item.dontAdd} dontEdit={item.dontEdit} label={item.name}>
                        {item.children?.map((g) => (
                            <CustomTreeItem decoration={g.icon} nodeId={g.id} dontAdd={g.dontAdd} dontEdit={g.dontEdit}  label={g.name} />
                        ))}
                    </CustomTreeItem>
                ))}    */}
            </TreeView>
        </TreeViewProvider>
    </Box>
    )
}