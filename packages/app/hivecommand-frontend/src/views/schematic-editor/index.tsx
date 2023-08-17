import { Box, debounce } from '@mui/material';
import React, { useMemo } from 'react';
import { ECadEditor } from '@hive-command/electrical-editor'
import { useQuery, useMutation, gql } from '@apollo/client'
import { useParams } from 'react-router-dom';

export const SchematicEditor = () => {

    const { id } = useParams();

    const { data } = useQuery(gql`
        query GetSchematic ($id: ID) {
            commandSchematics(where: {id: $id}){
                id

                pages {
                    id
                    name

                    nodes
                    edges
                }
            }
        }
    `, {
        variables: {
            id
        }
    })

    const [createPage] = useMutation(gql`
        mutation CreatePage($schematic: ID, $name: String) {
            createCommandSchematicPage(schematic: $schematic, input: {name: $name}){
                id
            }
        }
    `, {
        refetchQueries: ['GetSchematic'],
        awaitRefetchQueries: true
    })

    const [updatePage] = useMutation(gql`
    mutation UpdatePage($schematic: ID, $id: ID, $input: CommandSchematicPageInput) {
        updateCommandSchematicPage(schematic: $schematic, id: $id, input: $input){
            id
        }
    }
`, {
        // refetchQueries: ['GetSchematic'],
        // awaitRefetchQueries: true
    })

    const debouncedUpdate = useMemo(() => debounce(updatePage, 500), [])


    const schematic = data?.commandSchematics?.[0];

    return (
        <Box sx={{
            flex: 1,
            height: 'calc(100% - 36px)',
            display: 'flex', flexDirection: 'column'
        }}>
            <ECadEditor

                pages={schematic?.pages || []}
                onCreatePage={(page: any) => {
                    createPage({ variables: { schematic: id, name: page.name } })
                }}
                onUpdatePage={(page: any) => {
                    console.log({ page });

                    debouncedUpdate({ variables: { schematic: id, id: page.id, input: { nodes: page.nodes, edges: page.edges } } })
                }}
            />
        </Box>
    )
}