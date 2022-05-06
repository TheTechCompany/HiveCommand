import React, { forwardRef } from "react";
import { Text, Button } from "grommet";
import { Close } from "grommet-icons";
import { Graph } from ".";
import { MoreVert } from "@mui/icons-material";
import { Menu, MenuItem, Box, IconButton, Paper } from "@mui/material";
import { BaseStyle } from "@hexhive/styles";

export interface GraphContainerProps {
  dataKey: string;
  label: string;
  total: string;
  // onRemove: () => void;

  onEdit?: () => void;
  onDelete?: () => void;
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
        background: BaseStyle.global.colors["neutral-1"], 
        borderRadius: 6, 
        overflow: 'hidden'}}
    >
      <Box
        style={{
          color: 'white',
          padding: 3, 
          justifyContent: 'space-between', 
          flexDirection: 'row',
          alignItems: 'center',
          display: 'flex',
          background: BaseStyle.global.colors["accent-2"]
        }}

      >
        <Box style={{paddingLeft: 8}}>
          <Text>{props.label}</Text>
          <Text size="small">{props.total && `total: ${props.total}`}</Text>
        </Box>

        <IconButton
          size="small"
          color="inherit"
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
                handleClose();
                props.onEdit?.();
              }}>Edit</MenuItem>
              <MenuItem style={{color: 'red'}} onClick={() => {
                handleClose()
                props.onDelete?.();
              }}>Delete</MenuItem>
            </Menu>
      </Box>
      <Box style={{flex: 1, display: 'flex'}}> {props.children}</Box>
    </Paper>
  );
};
