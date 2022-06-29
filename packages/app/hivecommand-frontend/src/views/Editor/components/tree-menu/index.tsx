import React from 'react';

import { TreeView, TreeItem, TreeItemProps } from '@mui/lab'
import { Add, ChevronRight, ExpandMore } from '@mui/icons-material';
import { CustomTreeItem, MenuItem, MenuItemGroup } from './item';
import { TreeViewProvider } from './context';
import { Box, IconButton, Typography } from '@mui/material';
import { BaseStyle } from '@hexhive/styles';

export interface TreeMenuProps {
    onNodeSelect?: (nodeId: string) => void;
    onEdit?: (nodeId: string) => void;
    onAdd?: (nodeId?: string) => void;
    selected?: string;

    items?: {id: string, name: string, children?: any[]}[]

    label?: string;
}

export const TreeMenu : React.FC<TreeMenuProps> = (props) => {
    return (
    <TreeViewProvider value={{onEdit: props.onEdit, onAdd: props.onAdd}}>
        <Box 
            style={{
                background: BaseStyle.global.colors['accent-1'],
                paddingLeft: '4px',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
            <Typography
                color="#fff"
                    component="div"
                >
                    {props.label}
            </Typography>

            <IconButton size="small" onClick={() => props.onAdd?.()}>
                <Add fontSize="inherit" />
            </IconButton>
        </Box>
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
                <CustomTreeItem nodeId={item.id} label={item.name}>
                    {item.children?.map((g) => (
                        <CustomTreeItem nodeId={g.id} label={g.name} />
                    ))}
                </CustomTreeItem>
            ))}   
        </TreeView>
    </TreeViewProvider>
    )
}