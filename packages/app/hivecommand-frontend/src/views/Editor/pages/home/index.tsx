import React, { useContext, useState } from 'react';
import { Box, IconButton, List, ListItem, Paper, Typography } from '@mui/material'
import { Add } from '@mui/icons-material';
import { ElementPackListModal } from 'app/hivecommand-frontend/src/components/modals/element-pack-list';
import { gql, useQuery } from '@apollo/client';
import { useMutation } from '@apollo/client';
import { CommandEditorContext } from '../../context';

export const Home = () => {

    const { refetch, program } = useContext(CommandEditorContext)

    const { data } = useQuery(gql`
        query  Q{
            commandInterfaceDevicePacks(registered: true) {
                id
                name
            }
        }
    `)

    const [ updateProgramTemplatePacks ] = useMutation(gql`
        mutation M ($id: ID!, $templatePacks: [String]){
            updateCommandProgram(id: $id, input: {templatePacks: $templatePacks}) {
                id
            }
        }
    `)

    const elementPacks = data?.commandInterfaceDevicePacks || []

    const [ packModalOpen, openPackModal ] = useState(false);

    return (
        <Box sx={{flex: 1, display: 'flex', padding: '3px'}}>
            <Box sx={{flex: 1}}>

            </Box>

            <ElementPackListModal 
                open={packModalOpen}
                onClose={() => {
                    openPackModal(false);
                }}
                packs={elementPacks}
                onSubmit={(packList) => {
                    console.log(packList)
                    updateProgramTemplatePacks({
                        variables: {
                            id: program.id,
                            templatePacks: packList
                        }
                    }).then(() => {
                        refetch()
                        openPackModal(false);
                    })

                }}
                />
            <Paper>
                <Box sx={{display: 'flex', padding: '3px', bgcolor: 'secondary.main', color: 'white',  alignItems: 'center', justifyContent: 'space-between'}}>
                    <Typography>Element Packs</Typography>
                    <IconButton 
                        onClick={() => {
                            openPackModal(true);
                        }}
                        sx={{color: "white"}} size="small">
                        <Add fontSize="inherit"/>
                    </IconButton>
                </Box>
                <List>
                    {program?.templatePacks?.map((pack) => (
                        <ListItem>
                            {pack.name}
                        </ListItem>
                    ))}
                </List>
            </Paper>
        </Box>
    )
}