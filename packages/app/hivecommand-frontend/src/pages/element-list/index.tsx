import { Box, Paper, IconButton, Typography, List, ListItem } from "@mui/material";
import { Add } from '@mui/icons-material'
import React from "react";
import { useQuery, gql } from "@apollo/client";
import { useNavigate } from "react-router-dom";

export const ElementList = (props) => {

    const navigate = useNavigate();
    
    const { data } = useQuery(gql`
        query Elements {
            commandInterfaceDevices {
                id
                name
            }
        }
    `)

    const elements = data?.commandInterfaceDevices || []


    return (
        <Paper sx={{flex: 1, display: 'flex', flexDirection: 'column'}}>
            <Box sx={{padding: '3px', display: 'flex', justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center', bgcolor: 'secondary.main'}}>
                <Typography color="primary.light">Elements</Typography>
                <IconButton sx={{color: 'primary.light'}}>
                    <Add  />
                </IconButton>
            </Box>
            <Box sx={{flex: 1}}>
                <List>
                    {elements.map((elem) => (
                        <ListItem button onClick={() => navigate(elem.id)}>
                            {elem.name}
                        </ListItem>
                    ))}
                </List>
            </Box>
        </Paper>
    )
}