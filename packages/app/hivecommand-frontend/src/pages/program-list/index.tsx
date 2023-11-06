import React, { useEffect, useState } from 'react'
import { ProgramModal } from '../../components/modals/program';
import { useNavigate } from 'react-router-dom';
import { useCreateProgram, useDeleteProgram, useUpdateProgram } from '@hive-command/api';
import { gql, useQuery, useApolloClient } from '@apollo/client';
import { Box, IconButton, List, ListItem, ListItemButton, Paper, Typography } from '@mui/material';
import { Add, MoreVert } from '@mui/icons-material';

export interface ProgramListProps  {
}

export const ProgramList: React.FC<ProgramListProps> = (props) => {

    
    const navigate = useNavigate()


    const createProgram = useCreateProgram()
    const updateProgram = useUpdateProgram()
    const deleteProgram = useDeleteProgram()
    
    const [ modalOpen, openModal ] = useState(false)
    const [ selectedProgram, setSelectedProgram ] = useState<any>()

    const client = useApolloClient()

    const { data, error } = useQuery(gql`
        query Programs {
            commandPrograms {
                id
                name
            }
        }
    `)

    
    const programs = data?.commandPrograms || []; 
    

    return (
        <Box sx={{flex: 1, display: 'flex'}}>
          <ProgramModal 
            selected={selectedProgram}
            open={modalOpen} 
            onClose={() => {
                setSelectedProgram(null)
                openModal(false)
            }}
            onDelete={async () => {
                await deleteProgram(selectedProgram?.id)
                client.refetchQueries({include: ['Programs']})

                setSelectedProgram(null)
                openModal(false)
            }}
            onSubmit={async (program: {id: string, name: string, item: any}) => {

                if(program.id){
                    await updateProgram(
                        program.id,
                        program.name
                    )
                }else{
                    if(program.name){

                        // alert(program.name)
                        await createProgram(
                            program.name
                        )
                  
                    }
                }
                openModal(false)
                setSelectedProgram(null)

                client.refetchQueries({include: ['Programs']})

            }}/>
            <Paper sx={{flex: 1, display: 'flex', flexDirection: 'column'}}>
                <Box sx={{bgcolor: 'secondary.main', paddingLeft: '6px', flexDirection: 'row', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                    <Typography sx={{color: 'navigation.main'}}>Programs</Typography>
                    <IconButton
                        sx={{color: 'navigation.main'}}
                        onClick={() => openModal(true)}>
                        <Add />
                    </IconButton>
                </Box>
                {error ? (
                    <Typography>{error.message}</Typography>
                ) : (
                    <List>
                        {programs?.map((program) => (
                            <ListItem 
                            disablePadding
                            secondaryAction={(
                                <IconButton onClick={() => {
                                    openModal(true);
                                    setSelectedProgram(program);
                                }} size="small">
                                    <MoreVert fontSize="inherit" />
                                </IconButton>
                            )}>
                                <ListItemButton onClick={() => navigate(`${program.id}`)}>
                                    {program.name}
                                </ListItemButton>
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
