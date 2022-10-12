import { ChevronRight, ExpandMore } from "@mui/icons-material";
import { TreeItem, TreeItemContentProps, TreeView, useTreeItem } from "@mui/lab";
import { Box, TextField, Typography } from "@mui/material";
import React, { forwardRef } from "react";
import { render } from "react-dom";
import clsx from 'clsx';

export interface OPCUATreeItem {
    id: string;
    label: string;
    children?: OPCUATreeItem[]
}

export interface OPCUATreeViewProps {
    items: OPCUATreeItem[]
}

const OPCUATreeItem = forwardRef((props: TreeItemContentProps, ref) => {
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
      } = useTreeItem(nodeId);
      
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
                <Typography>{label}</Typography>
                <TextField size="small" />
            </Box>
        </div>
    )
})

export const OPCUATreeView : React.FC<OPCUATreeViewProps> = (props) => {

    const renderItems = (items: OPCUATreeItem[]) => {
        return items.map((item) => (
            <TreeItem ContentComponent={OPCUATreeItem} nodeId={item.id} label={item.label}>
                {renderItems(item.children || [])}
            </TreeItem>
        ))
    }


    return (
        <TreeView
            defaultCollapseIcon={<ExpandMore />}
            defaultExpandIcon={<ChevronRight />}
            >
            {renderItems(props.items)}
        </TreeView>
    )
}