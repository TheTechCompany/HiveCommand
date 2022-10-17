import React from 'react';

import { TreeView, TreeItem, TreeItemProps } from '@mui/lab'
import { Add, ChevronRight, ExpandMore } from '@mui/icons-material';
import { CustomTreeItem, MenuItem, MenuItemGroup } from './item';
import { TreeViewProvider } from './context';
import { Box, IconButton, Typography } from '@mui/material';
import { HexHiveTheme } from '@hexhive/styles';

export interface TreeMenuProps {
    onNodeSelect?: (nodeId: string) => void;
    onEdit?: (nodeId: string) => void;
    onAdd?: (nodeId?: string) => void;
    selected?: string;

    items?: {
        id: string, 
        name: string, 
        icon?: any;
        dontAdd?: boolean, 
        dontEdit?: boolean, 
        children?: any[]
    }[]

    label?: string;
}

export const TreeMenu : React.FC<TreeMenuProps> = (props) => {

    return (
    <TreeViewProvider value={{onEdit: props.onEdit, onAdd: props.onAdd}}>
    
        <TreeView
            onNodeSelect={(event, nodeId) => {
                props.onNodeSelect?.(nodeId);
            }}
            selected={props.selected}
            sx={{ flex: 1, userSelect: 'none', maxWidth: `100%` }}
            defaultCollapseIcon={<ExpandMore />}
            defaultExpandIcon={<ChevronRight />}
        >
            {props.items?.map((item) => (
                <CustomTreeItem decoration={item.icon} nodeId={item.id} dontAdd={item.dontAdd} dontEdit={item.dontEdit} label={item.name}>
                    {item.children?.map((g) => (
                        <CustomTreeItem decoration={g.icon} nodeId={g.id} dontAdd={g.dontAdd} dontEdit={g.dontEdit}  label={g.name} />
                    ))}
                </CustomTreeItem>
            ))}   
        </TreeView>
    </TreeViewProvider>
    )
}