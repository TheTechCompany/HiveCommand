import { Box } from '@mui/material';
import React, { useState } from 'react';
import { SchematicModal } from '../../components/modals/schematic';
import { Paper, IconButton, List, Typography, ListItem } from '@mui/material';
import { useQuery, useMutation, gql } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { Add } from '@mui/icons-material'

export const SchematicList = () => {

    const navigate = useNavigate();

    const [selectedSchematic, setSelectedSchematic] = useState<any>(null);

    const [modalOpen, openModal] = useState(false);

    const { data, error } = useQuery(gql`
        query GetSchematics {
            commandSchematics {
                id
                name
            }
        }
    `)

    const [ createSchematic ] = useMutation(gql`
        mutation CreateSchematic ($name: String) {
            createCommandSchematic(input: {name: $name}){
                id
            }
        }
    `, {
        refetchQueries: ['GetSchematics'],
        awaitRefetchQueries: true
    })

    const [ updateSchematic ] = useMutation(gql`
        mutation CreateSchematic ($id: ID, $name: String) {
            updateCommandSchematic(id: $id, input: {name: $name}){
                id
            }
        }
    `, {
        refetchQueries: ['GetSchematics'],
        awaitRefetchQueries: true
    })
    
    
    const schematics = data?.commandSchematics || [];

    return (
        <Box sx={{ flex: 1, display: 'flex' }}>
            <SchematicModal
                selected={selectedSchematic}
                open={modalOpen}
                onClose={() => {
                    setSelectedSchematic(null)
                    openModal(false)
                }}
                onSubmit={(schematic: { name: string }) => {
                    if (schematic.name) {

                        // alert(program.name)

                        createSchematic({variables: {name: schematic.name}}).then(() => openModal(false));
                        // createProgram(
                        //     program.name
                        // ).then((program) => {
                        //     openModal(false)

                        //     // client.refetchQueries({include: ['Programs']})


                        //     // if(program?.item){
                        //     //     let p : any[] = programs.slice()
                        //     //     p.push(program?.item)
                        //     //     setPrograms(p)
                        //     // }
                        // });
                    }

                }} />
            <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ bgcolor: 'secondary.main', flexDirection: 'row', display: 'flex', justifyContent: 'flex-end' }}>
                    <IconButton
                        sx={{ color: 'navigation.main' }}
                        onClick={() => openModal(true)}>
                        <Add />
                    </IconButton>
                </Box>
                {error ? (
                    <Typography>{error.message}</Typography>
                ) : (
                    <List>
                        {schematics?.map((program) => (
                            <ListItem button onClick={() => navigate(`${program.id}`)}>
                                {program.name}
                            </ListItem>
                        ))}
                    </List>
                )}

            </Paper>
            {/* <NestedList
                data={programs}
                onClick={({item}) => navigate(`${item.id}`)}
                renderItem={(item) => item.name}
                onAdd={() => openModal(true)} /> */}
            {/*<PaperList 
                title="Programs"
                items={programs}
                renderItem={(item: any) => item.name}
                onClick={(item: any) => props.history.push(`/editor/${item._id}`)}
                onAdd={() => openModal(true)}
                onEdit={(item: any) => {
                    setSelectedProgram(item);
                    openModal(true)
                }} />*/}
        </Box>
    )
}