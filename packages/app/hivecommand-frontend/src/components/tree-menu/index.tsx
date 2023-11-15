import React, { useState } from 'react';

import { TreeView, TreeItem, TreeItemProps } from '@mui/x-tree-view'
import { Add, ChevronRight, ExpandMore } from '@mui/icons-material';
import { CustomTreeItem, MenuItem, MenuItemGroup } from './item';
import { TreeViewProvider } from './context';
import { Box, IconButton, Typography } from '@mui/material';
import { HexHiveTheme } from '@hexhive/styles';

export interface TreeMenuItem {
    id: string, 
    name: string, 
    icon?: any;
    expanded?: boolean,
    dontAdd?: boolean, 
    dontEdit?: boolean, 
    children?: TreeMenuItem[]
}
export interface TreeMenuProps {
    onNodeSelect?: (nodeId: string) => void;
    onEdit?: (nodeId: string) => void;
    onAdd?: (nodeId?: string) => void;
    selected?: string;

    items?: TreeMenuItem[]

    label?: string;
}

export const TreeMenu : React.FC<TreeMenuProps> = (props) => {


    const defaultExpanded = (props.items || [] as any[]).reduce((prev, curr) => [...prev, curr, ...curr.children], []).filter((a) => a.expanded).map((x) => x.id)

    const [ expanded, setExpanded ] = useState(defaultExpanded);

    const handleToggle = (event: any, nodeIds: any[]) => {
        setExpanded([...new Set([...nodeIds, ...defaultExpanded])])
    }

    // console.log({items: props.items})
    return (
    <TreeViewProvider value={{onEdit: props.onEdit, onAdd: props.onAdd}}>
    
        <TreeView
            onNodeSelect={(event, nodeId) => {
                props.onNodeSelect?.(nodeId);
            }}
            expanded={expanded}
            onNodeToggle={handleToggle}
            selected={props.selected}
            sx={{ flex: 1, userSelect: 'none', maxWidth: `100%` }}
            defaultCollapseIcon={<ExpandMore />}
            defaultExpandIcon={<ChevronRight />}
        >
            {props.items?.map((item) => (
                <CustomTreeItem 
                    expanded={item.expanded}
                    decoration={item.icon} 
                    nodeId={item.id} 
                    dontAdd={item.dontAdd} 
                    dontEdit={item.dontEdit} 
                    label={item.name}>
                    {item.children?.map((g) => (
                        <CustomTreeItem 
                            decoration={g.icon} 
                            nodeId={g.id} 
                            dontAdd={g.dontAdd} 
                            dontEdit={g.dontEdit}  
                            label={g.name} />
                    ))}
                </CustomTreeItem>
            ))}   
        </TreeView>
    </TreeViewProvider>
    )
}