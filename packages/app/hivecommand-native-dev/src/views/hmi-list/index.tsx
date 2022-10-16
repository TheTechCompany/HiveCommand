import { Add, MoreVert } from '@mui/icons-material';
import { Divider, List, ListItemSecondaryAction, Typography } from '@mui/material';
import { IconButton } from '@mui/material';
import { ListItem } from '@mui/material';
import { Box } from '@mui/material';
import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CRUDHMIModal } from '../../components';
import { DevContext } from '../../context';

export const HMIList = () => {

    const navigate = useNavigate();

    const [ modalOpen, openModal ] = useState(false);

    const { hmiList, createHMI } = useContext(DevContext)

    const [ selected, setSelected ] = useState<any>(null)
    
    return (
        <Box sx={{flex: 1, display: 'flex', flexDirection: 'column'}}>
            <Box sx={{display: 'flex', padding: '3px', alignItems: 'center', justifyContent: 'space-between'}}>
                <Typography>Available HMI</Typography>
                <IconButton onClick={() => {
                    openModal(true);
                }}>
                    <Add />
                </IconButton>
            </Box>
            <Divider />

            <CRUDHMIModal 
                selected={selected}
                open={modalOpen}
                onSubmit={({name, file}: any) => {
                    createHMI?.(name, {filePath: file});
                    openModal(false);
                    setSelected(null)
                }}
                onClose={() => {
                    openModal(false);
                    setSelected(null)
                }} />

            <List>
                {hmiList.map((oneHmi) => (
                    <ListItem 
                        button 
                        onClick={() => {
                            navigate(oneHmi.id)
                        }}>
                        {oneHmi.name}
                        <ListItemSecondaryAction>
                            <IconButton onClick={() => {
                                openModal(true)
                                setSelected(oneHmi)
                            }}>
                                <MoreVert />
                            </IconButton>
                        </ListItemSecondaryAction>
                    </ListItem>
                ))}
            </List>
        </Box>
    )
}