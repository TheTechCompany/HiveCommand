import React, { useContext, forwardRef } from 'react';

import { TreeItem, TreeItemContentProps, TreeItemProps, useTreeItem } from '@mui/lab';
import { Box } from '@mui/material';
import { IconButton, Typography } from '@mui/material';
import clsx from 'clsx';
import { MoreVert, Add } from '@mui/icons-material';
import { TreeViewContext } from './context'

export interface MenuItemProps extends TreeItemContentProps {
    decoration: any;
}  

export const MenuItem : React.FC<MenuItemProps> = forwardRef<HTMLDivElement, MenuItemProps>((props, ref) => {
    const {
        disabled,
        expanded,
        selected,
        focused,
        handleExpansion,
        handleSelection,
        preventSelection,
      } = useTreeItem(props.nodeId);

      const { onEdit, onAdd } = useContext(TreeViewContext);

      const {
        classes,
        className,
        label,
        nodeId,
        icon: iconProp,
        expandIcon,
        collapseIcon,
        expansionIcon,
        displayIcon,
        dontAdd,
        dontEdit
      } = props as any;
      

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
        <Box 
            className={clsx(className, classes.root, {
                [classes.expanded]: expanded,
                [classes.selected]: selected,
                [classes.focused]: focused,
                [classes.disabled]: disabled,
            })}
            sx={{
                height: '35px',
                width: 'unset !important',
                flexDirection: 'row',
                alignItems: 'center !important',
                '&:hover .MuiIconButton-root': {
                    display: 'inline-flex'
                }
            }}
   
            onMouseDown={handleMouseDown}
            ref={ref}>
            <div onClick={handleExpansionClick} className={classes.iconContainer}>
                {icon}
            </div>
            <div style={{display: 'flex', alignItems: 'center', width: '100%'}}>
                {props.decoration ? (
                    <div style={{marginRight: '3px', display: 'flex', alignItems: 'center'}}>
                        {props.decoration}
                    </div>
                ): undefined}
                <Typography
                        onClick={handleSelectionClick}
                        sx={{fontSize: '0.8em', width: '100%'}}
                    >
                        {label}
                </Typography>
            </div>

            {!dontAdd && (
            <IconButton
                onClick={() => onAdd?.(props.nodeId)}
                size="small"
                sx={{display: 'none'}}>
                <Add fontSize="small" />
            </IconButton>)}

            {!dontEdit && (
            <IconButton 
                onClick={() => onEdit?.(props.nodeId)}
                size="small"
                sx={{display: 'none'}}>
                <MoreVert fontSize='small' />
            </IconButton>
                )}

        </Box>
    )
})

export interface MenuItemGroupProps {
    nodeId: string;
    label: string;
    items?: any[];
}

export const CustomTreeItem = (props: any) => {
    // console.log({props})
    
    return (<TreeItem
            ContentProps={{style: {width: 'unset'}, decoration: props.decoration, dontAdd: props.dontAdd, dontEdit: props.dontEdit} as any}
            ContentComponent={MenuItem} 
            nodeId={props.id}
            label={props.label} />)
}

export const MenuItemGroup = (props) => {
    return (
        <CustomTreeItem nodeId={props.id} label={props.label}>
            {props.items?.map((item) => <MenuItemGroup id={item.id} label={item.name} items={item.children} />)}
        </CustomTreeItem>
    )
}