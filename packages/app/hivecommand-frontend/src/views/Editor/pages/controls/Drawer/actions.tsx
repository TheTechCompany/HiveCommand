import { AssignFlowModal } from "../../../../../components/modals/assign-flow";
import { Box, Button, List, Text } from "grommet";
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
        <Box flex>
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
            pad="xsmall" 
            background={"accent-1"} 
            direction="row" 
            align='center'
            justify="between">
            <Text>Action Palette</Text>
            <IconButton 
                size="small"
                onClick={() => openAssignModal(true)}
            >
                <Add fontSize="inherit" />
            </IconButton>
        </Box>

        <List
            pad={'none'} 
            primaryKey={'name'}
            data={actions || []}>
            {(datum) => (
                <Box pad="xsmall" direction='row' justify='between' align='center'>
                    <Text size="small">{datum?.name}</Text>
                    <Button                                 
                        style={{padding: 6, borderRadius: 3}}
                        hoverIndicator 
                        onClick={() => {
                            openAssignModal(true)
                            setSelectedHMIAction(datum)
                        }}
                        icon={<MoreVert />} />
                </Box>
            )}
        </List>
    </Box>
    )
}