import React, { useEffect, useState } from 'react'
import { ProgramModal } from '../../components/modals/program';
import { Box } from 'grommet';
import { NestedList } from '../../components/ui/nested-list';
import { useNavigate } from 'react-router-dom';
import { useCreateProgram } from '@hive-command/api';
import { gql, useQuery, useApolloClient } from '@apollo/client';
import { useAuth } from '@hexhive/auth-ui';

export interface ProgramListProps  {
}

export const ProgramList: React.FC<ProgramListProps> = (props) => {

    const {activeUser} = useAuth()
    
    const navigate = useNavigate()


    const createProgram = useCreateProgram(activeUser?.id)//(activeUser as any)?._json?.organisation)
    
    const [ modalOpen, openModal ] = useState(false)
    const [ selectedProgram, setSelectedProgram ] = useState<any>()

    const client = useApolloClient()

    const { data } = useQuery(gql`
        query Programs {
            commandPrograms {
                id
                name
            }
        }
    `)

    
    const programs = data?.commandPrograms; 
    

    return (
        <Box flex className="program-list">
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

            <NestedList
                data={programs}
                onClick={({item}) => navigate(`${item.id}`)}
                renderItem={(item) => item.name}
                onAdd={() => openModal(true)} />
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
