import { TreeItem, useTreeItem } from '@mui/lab';
import {Typography, Box, IconButton} from '@mui/material';
import clsx from 'clsx';
import React, {forwardRef} from 'react';
import { Add } from '@mui/icons-material'

export const TreeItems = (props: any) => {
    return <TreeItem {...props} label={(
        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: '12px'}}>
            <Typography>{props.label}</Typography>

            <IconButton size="small" onClick={props.onAdd}>
                <Add fontSize='inherit' />
            </IconButton>
        </Box>
    )} />
}

// export const TreeItemContent = forwardRef((props: any, ref) => {
//     const {
//       classes,
//       className,
//       label,
//       nodeId,
//       icon: iconProp,
//       expansionIcon,
//       displayIcon,
//     } = props;

//     const {
//       disabled,
//       expanded,
//       selected,
//       focused,
//       handleExpansion,
//       handleSelection,
//       preventSelection,
//     } = useTreeItem(props.nodeId);

//     const icon = iconProp || expansionIcon || displayIcon;

//     const handleMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
//       preventSelection(event);
//     };
  
//     const handleExpansionClick = (
//       event: React.MouseEvent<HTMLDivElement, MouseEvent>,
//     ) => {
//       handleExpansion(event);
//     };
  
//     const handleSelectionClick = (
//       event: React.MouseEvent<HTMLDivElement, MouseEvent>,
//     ) => {
//       handleSelection(event);
//     };
    
//   console.log({props})
//   return (
//   <Box className={
//       clsx(className, classes.root, {
//           [classes.expanded]: expanded,
//           [classes.selected]: selected,
//           [classes.focused]: focused,
//           [classes.disabled]: disabled,
//         })
//   } 
//   onMouseDown={handleMouseDown}
//   ref={ref}>
//       <div onClick={handleExpansionClick} className={classes.iconContainer}>
//           {icon}
//       </div>
//       <Typography>
//           {props.label}
//       </Typography>
//   </Box>
//   )
// })