import { Box, debounce } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { ECadEditor } from '@hive-command/electrical-editor'
import { useQuery, useMutation, gql } from '@apollo/client'
import { useParams } from 'react-router-dom';
import { arrayMove } from '@dnd-kit/sortable';
import { saveAs } from 'file-saver';
import { ElectricalEditor } from '@hive-command/electrical-editor-v2'
import './index.css';
import { ExportModal } from './export-modal';

export const SchematicEditor = () => {

    const [ pages, setPages ] = useState<any[]>([])

    const { id } = useParams();

    const { data } = useQuery(gql`
        query GetSchematic ($id: ID) {
            commandSchematics(where: {id: $id}){
                id

                name

                versions {
                    id
                    rank

                    createdAt
		            createdBy {
                        name
                    }
                }

                templates {
                    id
                    name
                }

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


    const [createPageTemplate] = useMutation(gql`
        mutation CreatePageTemplate($schematic: ID, $name: String) {
            createCommandSchematicPageTemplate(schematic: $schematic, input: {name: $name}){
                id
            }
        }
    `, {
        refetchQueries: ['GetSchematic'],
        awaitRefetchQueries: true
    })

    const [updatePageTemplate] = useMutation(gql`
        mutation UpdatePageTemplate($schematic: ID, $id: ID, $input: CommandSchematicPageTemplateInput) {
            updateCommandSchematicPageTemplate(schematic: $schematic, id: $id, input: $input){
                id
            }
        }
    `, {

            // refetchQueries: ['GetSchematic'],
            // awaitRefetchQueries: true
        })

    const [deletePageTemplate] = useMutation(gql`
        mutation DeletePageTemplate($schematic: ID, $id: ID) {
            deleteCommandSchematicPageTemplate(schematic: $schematic, id: $id)
        }
    `, {
            refetchQueries: ['GetSchematic'],
            awaitRefetchQueries: true
        })

    const [ updatePageOrder ] = useMutation(gql`
        mutation UpdatePageOrder($schematic: ID, $id: String, $above: String, $below: String){
            updateCommandSchematicPageOrder(schematic: $schematic, id: $id, below: $below, above: $above)
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


    const onCreatePage = (page: any) => {
        createPage({
            variables: {
                schematic: id,
                name: page?.name
            }
        })
    }

    const nodeMap = (item: any) => {
        return {
            id: item.id,
            type: item.type,
            position: item.position,
            data: item.data
        }
    }



    const onUpdatePage = (page: any) => {

        let input : any = {};

        if(page.nodes){
            input.nodes = page.nodes?.filter((a) => a.id != 'page' && a.id != 'canvas')?.map(nodeMap);
        }

        if(page.edges){
            input.edges = page.edges;
        }

        debouncedUpdate({
            variables:{
                schematic: id,
                id: page.id,
                input
            }
        })


        setPages((pages) => {
            let p = pages.slice();

            let ix = p.findIndex((a) => a.id == page.id);

            p[ix] = {...p[ix], ...page}
            return p;
        })
    }

    const onDeletePage = (page: any) => {
        deletePage({
            variables: {
                schematic: id,
                id: page.id
            }
        })
    }

    const onCreateTemplate = (page: any) => {
        createPageTemplate({
            variables: {
                schematic: id,
                name: page.name
            }
        })
    }


    const onUpdateTemplate = (page: any) => {
        updatePageTemplate({
            variables: {
                schematic: id,
                id: page.id,
                input: page
            }
        })
    }

    const onDeleteTemplate = (page: any) => {
        deletePageTemplate({
            variables: {
                schematic: id,
                id: page.id
            }
        })
    }

    const onUpdatePageOrder = (id: string, above: any, below: any) => {
        updatePageOrder({
            variables: {
                schematic: id,
                id,
                above,
                below
            }
        })
    }

    const debouncedUpdate = useMemo(() => debounce(updatePage, 500), [])

    const schematic = data?.commandSchematics?.[0];

    useEffect(() => {
        setPages(schematic?.pages || []);
    }, [schematic]);
    
    const sortedPages = useMemo(() => pages?.slice()?.sort((a,b) => (a.rank || '').localeCompare(b.rank || '')), [pages]);

    const [ exportModalOpen, openExportModal ] = useState(false);

    return (
        <Box sx={{
            flex: 1,
            height: 'calc(100% - 36px)',
            padding: '6px',
            display: 'flex', 
            flexDirection: 'column'
        }}>
            <ExportModal
                open={exportModalOpen}
                versions={schematic?.versions || []}
                onClose={() => openExportModal(false)}
                />
            <ElectricalEditor
                title={schematic?.name}
                versions={schematic?.versions || []}
                pages={pages || []}
                templates={schematic?.templates || []}
                onCreatePage={onCreatePage}
                onUpdatePage={onUpdatePage}
                onDeletePage={onDeletePage}
                onCreateTemplate={onCreateTemplate}
                onUpdateTemplate={onUpdateTemplate}
                onDeleteTemplate={onDeleteTemplate}

                onUpdatePageOrder={onUpdatePageOrder}
                onExport={() => {
                    openExportModal(true)
                }}
             />
{/*              
            <ECadEditor
                exporting={exporting}
                pages={sortedPages || []}
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
                onUpdatePageOrder={(pageId, above, below) => {

                    console.log({pageId, above, below})
                    
                    let oldIx = sortedPages?.findIndex((a) => a.id == pageId);
                    let newIx = above ? sortedPages?.findIndex((a) => a.id == above) : sortedPages?.findIndex((a) => a.id == below);

                    console.log(pageId, oldIx, newIx, sortedPages)
                    
                    updatePageOrder({
                        variables: {
                            schematic: id,
                            id: pageId,
                            above,
                            below
                        }
                    })

                    setPages((pages) => {
                        return arrayMove(sortedPages, oldIx, newIx);
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
            /> */}
        </Box>
        
    )
}