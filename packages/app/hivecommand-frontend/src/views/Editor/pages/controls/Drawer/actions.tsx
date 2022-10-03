import { AssignFlowModal } from "../../../../../components/modals/assign-flow";
import { Box, Button, List, ListItem, Typography } from "@mui/material";
import { MoreVert, Add } from '@mui/icons-material';
import React, { useState } from "react";
import { useCreateHMIAction, useDeleteHMIAction } from "@hive-command/api";
import { useHMIContext } from "../context";
import { IconButton } from "@mui/material";

export const ActionMenu = () => {
    const [ assignModalOpen, openAssignModal ] = useState<boolean>(false);
    const [ selectedHMIAction, setSelectedHMIAction ] = useState<any>(undefined)
    

    const { programId, actions, flows, refetch } = useHMIContext();

    const createHMIAction = useCreateHMIAction(programId)
    const deleteHMIAction = useDeleteHMIAction(programId)

    
    return (
        <Box sx={{flex: 1, display: 'flex', flexDirection: 'column'}}>
             <AssignFlowModal   
                flows={flows}
                selected={selectedHMIAction}
                onDelete={() => {
                    deleteHMIAction(selectedHMIAction.id).then(() => {
                        openAssignModal(false)
                        setSelectedHMIAction(undefined)
                        refetch()
                    })
                }}
                onClose={() => openAssignModal(false)}
                onSubmit={(assignment) => {
                    createHMIAction(
                        assignment.name,
                        assignment.flow, 
                    ).then(() => {
                        openAssignModal(false);
                        refetch()


                    })
                }}
                open={assignModalOpen} />
        <Box 
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '3px',
                bgcolor: 'secondary.main',
                color: 'white'
            }}>
            <Typography>Action Palette</Typography>
            <IconButton 
                size="small"
                sx={{
                    color: 'white'
                }}
                onClick={() => openAssignModal(true)}
            >
                <Add fontSize="inherit" />
            </IconButton>
        </Box>

        <List>
            {(actions || []).map((datum) => (
                <ListItem 
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}>
                    <Typography fontSize="small">{datum?.name}</Typography>
                    <IconButton    
                        sx={{
                            color: 'white'
                        }}                             
                        onClick={() => {
                            openAssignModal(true)
                            setSelectedHMIAction(datum)
                        }}
                        >
                        <MoreVert sx={{color: 'white'}} />
                    </IconButton>
                </ListItem>
            ))}
        </List>
    </Box>
    )
}