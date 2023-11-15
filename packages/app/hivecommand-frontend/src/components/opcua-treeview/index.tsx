import { ChevronRight, ExpandMore, Explore } from "@mui/icons-material";
import { TreeItem, TreeItemContentProps, TreeView, useTreeItem } from "@mui/x-tree-view";
import { Box, TextField, Typography } from "@mui/material";
import React, { forwardRef } from "react";
import { render } from "react-dom";
import clsx from 'clsx';
import { TreeMapProvider, useTreeMap, useTreeMapNode } from "./context";
import { IconButton } from "@mui/material";

export interface OPCUATreeItem {
    id: string;
    label: string;
    children?: OPCUATreeItem[]
}

export interface OPCUATreeItemProps extends TreeItemContentProps {
    parentId?: string;
}

export interface OPCUATreeViewProps {
    items: OPCUATreeItem[]
    onMap?: (item: any, parentId?: string) => void;
}

const OPCUATreeItem = forwardRef((props: OPCUATreeItemProps, ref) => {
    const {
        classes,
        className,
        label,
        nodeId,
        icon: iconProp,
        expansionIcon,
        displayIcon,
      } = props;


      const {
        disabled,
        expanded,
        selected,
        focused,
        handleExpansion,
        handleSelection,
        preventSelection,
      }  = useTreeItem(nodeId); //= useTreeItem(nodeId);
      
      const { editable, value } = useTreeMapNode(nodeId, props.parentId);

      const { onMap } = useTreeMap()

      const icon = iconProp || expansionIcon || displayIcon;

      const handleMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        preventSelection(event);
      };
    
      const handleExpansionClick = (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>,
      ) => {
        handleExpansion(event);
      };
    
      const handleSelectionClick = (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>,
      ) => {
        handleSelection(event);
      };

    
    return (
        <div 
            className={clsx(className, classes.root, {
                [classes.expanded]: expanded,
                [classes.selected]: selected,
                [classes.focused]: focused,
                [classes.disabled]: disabled,
            })}
            onMouseDown={handleMouseDown}
            style={{display: 'flex', alignItems: 'center'}}
            ref={ref as  React.Ref<HTMLDivElement>}>
                <div onClick={handleExpansionClick} className={classes.iconContainer}>
                    {icon}
                </div>
            <Box sx={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                <Typography sx={{padding: editable ? '6px' : undefined}}>{label}</Typography>

               {editable ? (
                <Box sx={{display: 'flex', alignItems: 'center', marginRight: '6px'}}>
                    <TextField value={value} size="small" />
                    <IconButton onClick={() => onMap?.(nodeId, props.parentId)} size="small">
                        <Explore fontSize="inherit" />
                    </IconButton>
                </Box>
               ) : null} 
            </Box>
        </div>
    )
})

export const OPCUATreeView : React.FC<OPCUATreeViewProps> = (props) => {

    const renderItems = (items: OPCUATreeItem[], parentId?: string) => {
        return items.map((item: any) => {
            // item.editable = item.children?.length > 0
            return (
            <TreeItem ContentComponent={OPCUATreeItem} ContentProps={{parentId} as any} nodeId={item.id} label={item.label}>
                {renderItems(item.children || [], item.id)}
            </TreeItem>
            )
        })
    }


    return (
        <TreeMapProvider value={{items: props.items, onMap: props.onMap}}>
            <TreeView
                // onSelect={(evt)}
                defaultCollapseIcon={<ExpandMore />}
                defaultExpandIcon={<ChevronRight />}
                >
                {renderItems(props.items)}
            </TreeView>
        </TreeMapProvider>
    )
}