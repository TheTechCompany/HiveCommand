import { Box, debounce } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { ECadEditor } from '@hive-command/electrical-editor'
import { useQuery, useMutation, gql } from '@apollo/client'
import { useParams } from 'react-router-dom';
import { arrayMove } from '@dnd-kit/sortable';
import { saveAs } from 'file-saver';

import './index.css';

export const SchematicEditor = () => {

    const [ pages, setPages ] = useState<any[]>([])

    const { id } = useParams();

    const { data } = useQuery(gql`
        query GetSchematic ($id: ID) {
            commandSchematics(where: {id: $id}){
                id

                name

                pages {
                    id
                    name

                    nodes
                    edges

                    rank
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

    const [deletePage] = useMutation(gql`
        mutation DeletePage($schematic: ID, $id: ID) {
            deleteCommandSchematicPage(schematic: $schematic, id: $id)
        }
    `, {
            refetchQueries: ['GetSchematic'],
            awaitRefetchQueries: true
        })

    const [ updatePageOrder ] = useMutation(gql`
        mutation UpdatePageOrder($schematic: ID, $oldIx: Int, $newIx: Int){
            updateCommandSchematicPageOrder(schematic: $schematic, oldIx: $oldIx, newIx: $newIx)
        }
    `, {
        refetchQueries: ['GetSchematic']
    })

    const [ exporting, setExporting ] = useState(false);

    const [ exportSchematic ] = useMutation(gql`
        mutation ExportSchematic ($id: ID!){
            exportCommandSchematic(id: $id)
        }
    `)

    const debouncedUpdate = useMemo(() => debounce(updatePage, 500), [])


    const schematic = data?.commandSchematics?.[0];

    console.log(schematic)

    useEffect(() => {
        setPages(schematic?.pages || []);
    }, [schematic]);
    
    return (
        <Box sx={{
            flex: 1,
            height: 'calc(100% - 36px)',
            padding: '6px',
            display: 'flex', 
            flexDirection: 'column'
        }}>
            <ECadEditor
                exporting={exporting}
                pages={pages || []}
                onCreatePage={(page: any) => {
                    createPage({ variables: { schematic: id, name: page.name } })

                }}
                onDeletePage={(page) => {
                    deletePage({variables: {schematic: id, id: page.id}});
                }}

                onExport={() => {
                    setExporting(true);
                    exportSchematic({variables: {id: schematic.id}}).then(async (response) => {

                        console.log(response.data)

                        const resp = await fetch(response.data?.exportCommandSchematic);

                        const data = await resp.blob()
                        saveAs(
                            data,
                            `${schematic?.name}.pdf`
                        );
    
                        setExporting(false);
                        
                    }).catch((e) => {
                        setExporting(false);
                    })
                }}
                onUpdatePageOrder={(oldIx, newIx) => {

                    console.log(oldIx, newIx, pages)
                    
                    updatePageOrder({
                        variables: {
                            schematic: id,
                            oldIx,
                            newIx
                        }
                    })

                    setPages((pages) => {
                        return arrayMove(pages, oldIx, newIx);
                    })

                }}
                onUpdatePage={(page: any, log) => {

                    let update = {};

                    if(page.nodes){
                        update['nodes'] =  page.nodes?.map((x) => ({id: x.id, data: x.data, position: x.position, type: x.type}))
                    }
                    if(page.edges){
                        update['edges'] = page.edges;
                    }
                    if(page.name)
                        update['name'] = page.name;

                    debouncedUpdate({ 
                        variables: { 
                            schematic: id, 
                            id: page.id, 
                            input: { 
                                ...update
                            } 
                        } 
                    })


                    setPages((pages) => {
                        let p = pages.slice();

                        let ix = p.findIndex((a) => a.id == page.id);

                        p[ix] = {...page}
                        return p;
                    })
                }}
            />
        </Box>
        
    )
}