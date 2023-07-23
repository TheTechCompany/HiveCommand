import React, { useEffect, useState } from 'react'
import { ProgramModal } from '../../components/modals/program';
import { useNavigate } from 'react-router-dom';
import { useCreateProgram } from '@hive-command/api';
import { gql, useQuery, useApolloClient } from '@apollo/client';
import { Box, IconButton, List, ListItem, Paper, Typography } from '@mui/material';
import { Add } from '@mui/icons-material';

export interface ProgramListProps  {
}

export const ProgramList: React.FC<ProgramListProps> = (props) => {

    
    const navigate = useNavigate()


    const createProgram = useCreateProgram()//(activeUser as any)?._json?.organisation)
    
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
            onSubmit={(program: {name: string, item: any}) => {
                if(program.name){

                    // alert(program.name)
                    createProgram(
                        program.name
                    ).then((program) => {
                        openModal(false)

                        client.refetchQueries({include: ['Programs']})
                        // if(program?.item){
                        //     let p : any[] = programs.slice()
                        //     p.push(program?.item)
                        //     setPrograms(p)
                        // }
                    });
                }

            }}/>
            <Paper sx={{flex: 1, display: 'flex', flexDirection: 'column'}}>
                <Box sx={{bgcolor: 'secondary.main', flexDirection: 'row', display: 'flex', justifyContent: 'flex-end'}}>
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
