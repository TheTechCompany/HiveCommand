import { Add, MoreVert } from "@mui/icons-material";
import { Divider, List, ListItem } from "@mui/material";
import { ListItemSecondaryAction } from "@mui/material";
import { Box, IconButton, Typography } from "@mui/material";
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CRUDOPCUAModal } from "../../components";
import { DevContext } from "../../context";

export const OPCUAList = () => {

    const navigate = useNavigate();

    const [ modalOpen, openModal ] = useState(false);

    const [ selected, setSelected ] = useState<any>();
    
    const { opcuaList, createOPCUASource } = useContext(DevContext);

    return (
        <Box sx={{flex: 1, display: 'flex', flexDirection: 'column'}}>
            <CRUDOPCUAModal 
                open={modalOpen} 
                selected={selected}
                onSubmit={({host, port, name}) => {
                    createOPCUASource?.(name, {host, port})
                    openModal(false)
                    setSelected(null)
                }}
                onClose={() => {
                    setSelected(null)
                    openModal(false)
                }} />
            <Box sx={{display: 'flex', padding: '3px', alignItems: 'center', justifyContent: 'space-between'}}>
                <Typography>Available OPCUA Sources</Typography>
                <IconButton onClick={() => openModal(true)}>
                    <Add />
                </IconButton>
            </Box>
            <Divider />
            <Box sx={{flex: 1}}>
                <List>
                    {opcuaList.map((opcua_item) => (
                        <ListItem 
                            button
                            onClick={() => {
                                navigate(opcua_item.id);
                            }}>
                            {opcua_item.name}
                            <ListItemSecondaryAction>
                                <IconButton onClick={() => {
                                    openModal(true)
                                    setSelected(opcua_item)
                                }}>
                                    <MoreVert />
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                </List>
            </Box>
        </Box>
    )
}