import { VariableModal } from "../../../../components/modals/program-variable";
import { Button, Box, Text, List } from "grommet"
import { Add, MoreVert } from '@mui/icons-material';
import { useState } from "react";
import { gql, useApolloClient, useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import { useCreateProgramVariable, useDeleteProgramVariable, useUpdateProgramVariable } from "@hive-command/api";
import { IconButton } from "@mui/material";

export const Variables = () => {

    const [ modalOpen, openModal ] = useState(false);
    const [ selected, setSelected ] = useState()

    const { id } = useParams()

    const client = useApolloClient()

    const { data } = useQuery(gql`
        query VariableQuery ($id: ID) {
            commandPrograms(where: {id: $id}){
                variables {
                    id
                    name
                    type
                    defaultValue
                }
            }
        }
    `, {
        variables: {
            id: id
        }
    })

    const refetch = () => {
        client.refetchQueries({include: ['VariableQuery']})
    }

    const createProgramVariable = useCreateProgramVariable(id)
    const updateProgramVariable = useUpdateProgramVariable(id);
    const deleteProgramVariable = useDeleteProgramVariable(id);

    const variables = data?.commandPrograms?.[0]?.variables;

    return (
        <Box flex >
                
            <VariableModal 
                selected={selected}
                open={modalOpen}
                onClose={() => {
                    openModal(false)
                    setSelected(undefined)

                }}
                onSubmit={(variable) => {
                    if(variable.id){
                        updateProgramVariable(variable.id, variable).then(() => {
                            refetch()
                            openModal(false)
                            setSelected(undefined)
                        })
                    }else{
                        createProgramVariable(variable).then(() => {
                            refetch();
                            openModal(false);
                            setSelected(undefined)

                        })
                    }
                }}
                />
            <Box  pad="xsmall" background={'accent-1'} direction="row" align="center" justify="between">
                <Text>Variables</Text>
                <IconButton
                    size="small"
                    onClick={() => openModal(true)}
                 >
                    <Add  fontSize="small" />
                </IconButton>
            </Box>
            <Box pad="xsmall" flex>
                <List
                    pad={'none'}
                    data={variables}
                    
                    >
                    {(datum) => (
                        <Box 
                            pad="xsmall"
                            justify="between"
                            direction="row" 
                            align="center">
                            <Text size="small">{datum.name}</Text>

                            <IconButton
                        
                                onClick={() => {
                                    setSelected(datum)
                                    openModal(true)
                                }}>

                                <MoreVert fontSize="small" />
                            </IconButton>
                        </Box>
                    )}
                </List>
            </Box>
        </Box>
    )
}