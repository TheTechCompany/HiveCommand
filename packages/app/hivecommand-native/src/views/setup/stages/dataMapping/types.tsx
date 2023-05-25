import { Box, Collapse, List, ListItem, ListItemButton, Typography } from '@mui/material';
import React, { useContext, useState } from 'react';
import { SetupContext } from '../../context';

export const TypeView = () => {

    const { state, setState, globalState, setGlobalState } = useContext(SetupContext);

    const [ expanded, setExpanded ] = useState('');

    return (
        <Box>  
            <List>
            {globalState?.controlLayout?.types?.map((type) => (
                <ListItemButton onClick={() => {
                    setExpanded(expanded === type.id ? '' : type.id)
                }} sx={{flexDirection: 'column', display: 'flex', alignItems: 'flex-start'}}>
                    <Typography>{type.name}</Typography>
                    <Collapse in={type.id == expanded} sx={{marginLeft: '12px'}}>
                        {type?.fields?.map((field) => (
                            <Box>
                                {field.name}
                            </Box>
                        ))}
                    </Collapse>
                </ListItemButton>
            ))}
            </List>
        </Box>
    )
}