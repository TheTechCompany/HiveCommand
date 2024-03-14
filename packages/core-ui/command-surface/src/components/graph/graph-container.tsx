import React, { forwardRef } from "react";
import { MoreVert, Close, Download, Delete, Edit } from "@mui/icons-material";
import { Typography, Menu, MenuItem, Box, IconButton, Paper, ListItemText, ListItemIcon } from "@mui/material";

export interface GraphContainerProps {
  dataKey: string;
  label: string;
  total: string;
  // onRemove: () => void;

  onExport?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;

  children?: any;
}

export const GraphContainer: React.FC<GraphContainerProps> = (props) => {

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Paper
      elevation={1}
      style={{
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        // background: HexHiveTheme.global.colors["neutral-1"], 
        borderRadius: 6, 
        overflow: 'hidden'}}
    >
      <Box
        sx={{
          color: 'white',
          padding: '3px', 
          justifyContent: 'space-between', 
          flexDirection: 'row',
          alignItems: 'center',
          display: 'flex',
          bgcolor: 'secondary.main',
          position: 'relative'
        }}

      >
        <Box style={{display: 'flex', flexDirection: 'column', paddingLeft: 8}}>
          <Typography>{props.label}</Typography>
          <Typography fontSize="small">{props.total && `Total: ${props.total}`}</Typography>
        </Box>

        <IconButton
          size="small"
          color="inherit"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={handleClick}
        >
          <MoreVert fontSize="small" />

        </IconButton>
          <Menu
             anchorEl={anchorEl}
             open={open}
             onClose={handleClose}
             anchorOrigin={{
               vertical: 'bottom',
               horizontal: 'right',
             }}
             transformOrigin={{
               vertical: 'top',
               horizontal: 'right',
             }}>
              <MenuItem onClick={() => {
                handleClose?.();
                props.onExport?.();
              }}>
                <ListItemIcon>
                  <Download fontSize="inherit"/>
                </ListItemIcon>
                <ListItemText>
                Export
                  
                </ListItemText>
              </MenuItem>
              <MenuItem onClick={() => {
                handleClose();
                props.onEdit?.();
              }}>
                <ListItemIcon>
                  <Edit fontSize="inherit"/>
                </ListItemIcon>
                <ListItemText>
                Edit
                </ListItemText>
                </MenuItem>
              <MenuItem style={{color: 'red'}} onClick={() => {
                handleClose()
                props.onDelete?.();
              }}>
                <ListItemIcon>
                  <Delete sx={{color: 'red'}} fontSize="inherit"/>
                </ListItemIcon>
                <ListItemText>
                Delete
                </ListItemText>
              </MenuItem>
            </Menu>
      </Box>
      <Box style={{flex: 1, display: 'flex'}}> {props.children}</Box>
    </Paper>
  );
};
