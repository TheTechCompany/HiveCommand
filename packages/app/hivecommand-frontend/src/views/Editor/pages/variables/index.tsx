import { VariableModal } from "../../../../components/modals/program-variable";
import { Button, Box, Text, List } from "grommet"
import { Add } from 'grommet-icons';
import { useState } from "react";
import { gql, useApolloClient, useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import { useCreateProgramVariable, useDeleteProgramVariable, useUpdateProgramVariable } from "@hive-command/api";

export const Variables = () => {

    const [ modalOpen, openModal ] = useState(false);

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
        <Box flex pad="xsmall">
            <VariableModal 
                open={modalOpen}
                onClose={() => openModal(false)}
                onSubmit={(variable) => {
                    if(variable.id){
                        updateProgramVariable(variable.id, variable).then(() => {
                            refetch()
                            openModal(false)
                        })
                    }else{
                        createProgramVariable(variable).then(() => {
                            refetch();
                            openModal(false);
                        })
                    }
                }}
                />
            <Box direction="row" align="center" justify="between">
                <Text>Variables</Text>
                <Button
                    onClick={() => openModal(true)}
                    plain
                    style={{padding: 6, borderRadius: 3}}
                    hoverIndicator={'accent-1'}
                    icon={<Add size="small" />} />
            </Box>
            <Box flex>
                <List
                    data={variables}
                    
                    >
                    {(datum) => (
                        <Box>
                            {datum.name}
                        </Box>
                    )}
                </List>
            </Box>
        </Box>
    )
}