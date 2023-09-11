import { Box } from '@mui/material';
import React, { useState } from 'react';
import { SchematicModal } from '../../components/modals/schematic';
import { Paper, IconButton, List, Typography, ListItem } from '@mui/material';
import { useQuery, useMutation, gql } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { Add } from '@mui/icons-material'
import { FunctionModal } from '../../components/modals/function';

export const FunctionList = () => {

    const navigate = useNavigate();

    const [selectedSchematic, setSelectedSchematic] = useState<any>(null);

    const [modalOpen, openModal] = useState(false);

    const { data, error } = useQuery(gql`
        query GetFunctions {
            commandFunctions {
                id
                name
            }
        }
    `)

    const [ createFunction ] = useMutation(gql`
        mutation CreateFunction($name: String) {
            createCommandFunction(input: {name: $name}){
                id
            }
        }
    `, {
        refetchQueries: ['GetFunctions'],
        awaitRefetchQueries: true
    })

    const [ updateFunction ] = useMutation(gql`
        mutation UpdateFunction ($id: ID, $name: String) {
            updateCommandFunction(id: $id, input: {name: $name}){
                id
            }
        }
    `, {
        refetchQueries: ['GetFunctions'],
        awaitRefetchQueries: true
    })
    
    
    const functions = data?.commandFunctions || [];

    return (
        <Box sx={{ flex: 1, display: 'flex' }}>
            <FunctionModal
                selected={selectedSchematic}
                open={modalOpen}
                onClose={() => {
                    setSelectedSchematic(null)
                    openModal(false)
                }}
                onSubmit={(fd: { name: string }) => {
                    if (fd.name) {

                        // alert(program.name)

                        createFunction({variables: {name: fd.name}}).then(() => openModal(false));
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
                        {functions?.map((fd) => (
                            <ListItem button onClick={() => navigate(`${fd.id}`)}>
                                {fd.name}
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