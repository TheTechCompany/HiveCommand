import { Box, debounce } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { ECadEditor } from '@hive-command/electrical-editor'
import { useQuery, useMutation, gql } from '@apollo/client'
import { useParams } from 'react-router-dom';
import { arrayMove } from '@dnd-kit/sortable';
import { saveAs } from 'file-saver';

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

                onExport={() => {

                    saveAs(
                        'https://hivecommand-schematic-export-bucket-6e95298.s3.ap-southeast-2.amazonaws.com/DfJFb4olASqMpXjgxdjl7?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAW3WJ3ZIPLC3BFO6W%2F20230913%2Fap-southeast-2%2Fs3%2Faws4_request&X-Amz-Date=20230913T214842Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEE4aDmFwLXNvdXRoZWFzdC0yIkgwRgIhANrolj9CwKlqgH7%2Ff2eo%2BkKm5GcQXPn2KpNSPLn6wn7%2BAiEAw9hUEgFaqrl9%2FR8iZVV6JDf19SiZxJy7q4oGLBNhDdcqqAMINxACGgw0NzE3OTYwMDk1MDIiDDp9S9eM1OVkUjyW%2FCqFA4%2FsXqGh5B98hg7PuV0AK4UeOSefcHV1UQsdl2uTKTCte0f0rKRKpODSTxmEuD%2BbJXfzKofq4ENwL4X4qdsJxYtlZcsTKsmYMtTE2z82Y6U0hLZi3CTZbtM%2FSpLTCkcEfUjxTEqZAqclGa3zFToByv1F5Km872nr06%2B8%2FydwIe6gM75kQJ1DiXq6SOKZh0V8XbvwAGLkmMEASiwc1pub3l3JyrG8RRYCJCDcnsPASmX9OGPegtkVuHlLlRJ8c55kcyeKqXsAKgdgc8gtOq6MCu%2B9q%2FWwXfenZEwfEuwwUmGxK1cEWt6J5UiIXy1cHvz2nfLYBiiJjkcDCSQRofRqD4VM5589Qjm2sSEUtmPU6WlR7mAlsyALDMDYlQb0t8963lkxOf366xSGbADWbO8DpsHsKNLmmyvJTIdicyiT4s7Jqk6akiQTTdXOd9FcUhD2Lv6j%2FvFXpMW%2BcHYG%2BG2AhYbSFOQYUlg%2BVp7M15UEabQcsNwNKtMRsBG%2BQXjoRRuAkaeoL0orMObZiKgGOpwB9q%2FKUkxPWmO1zQpqnIEnh9%2B%2Fv4w1%2BefqyInSHb4aF%2BOUXeMNFiWwhZP4jb7HBAHJlNSmDGz2%2BYykJ%2B5IeWPYmrvjjJKde4zb8M2oRMzlpcYQhqt%2BnTd0zzKNnt1gKRIAv98KgC%2BfhXletDmt6avDd7pAndSDIvqBg8Pevx8cu406%2Bhk7KXbSZrrupPwe33ce4Q31G0psNp%2Fs17lV&X-Amz-Signature=c44a819d860ed25809216a028d5a82364f4d27eb152d6b9be62820ba1b357584&X-Amz-SignedHeaders=host&x-id=GetObject',
                        `${schematic?.name}.pdf`
                    );

                    // var link = document.createElement('a');
                    //     link.target = "_blank"
                    //     link.href = 'https://hivecommand-schematic-export-bucket-6e95298.s3.ap-southeast-2.amazonaws.com/DfJFb4olASqMpXjgxdjl7?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAW3WJ3ZIPLC3BFO6W%2F20230913%2Fap-southeast-2%2Fs3%2Faws4_request&X-Amz-Date=20230913T214842Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEE4aDmFwLXNvdXRoZWFzdC0yIkgwRgIhANrolj9CwKlqgH7%2Ff2eo%2BkKm5GcQXPn2KpNSPLn6wn7%2BAiEAw9hUEgFaqrl9%2FR8iZVV6JDf19SiZxJy7q4oGLBNhDdcqqAMINxACGgw0NzE3OTYwMDk1MDIiDDp9S9eM1OVkUjyW%2FCqFA4%2FsXqGh5B98hg7PuV0AK4UeOSefcHV1UQsdl2uTKTCte0f0rKRKpODSTxmEuD%2BbJXfzKofq4ENwL4X4qdsJxYtlZcsTKsmYMtTE2z82Y6U0hLZi3CTZbtM%2FSpLTCkcEfUjxTEqZAqclGa3zFToByv1F5Km872nr06%2B8%2FydwIe6gM75kQJ1DiXq6SOKZh0V8XbvwAGLkmMEASiwc1pub3l3JyrG8RRYCJCDcnsPASmX9OGPegtkVuHlLlRJ8c55kcyeKqXsAKgdgc8gtOq6MCu%2B9q%2FWwXfenZEwfEuwwUmGxK1cEWt6J5UiIXy1cHvz2nfLYBiiJjkcDCSQRofRqD4VM5589Qjm2sSEUtmPU6WlR7mAlsyALDMDYlQb0t8963lkxOf366xSGbADWbO8DpsHsKNLmmyvJTIdicyiT4s7Jqk6akiQTTdXOd9FcUhD2Lv6j%2FvFXpMW%2BcHYG%2BG2AhYbSFOQYUlg%2BVp7M15UEabQcsNwNKtMRsBG%2BQXjoRRuAkaeoL0orMObZiKgGOpwB9q%2FKUkxPWmO1zQpqnIEnh9%2B%2Fv4w1%2BefqyInSHb4aF%2BOUXeMNFiWwhZP4jb7HBAHJlNSmDGz2%2BYykJ%2B5IeWPYmrvjjJKde4zb8M2oRMzlpcYQhqt%2BnTd0zzKNnt1gKRIAv98KgC%2BfhXletDmt6avDd7pAndSDIvqBg8Pevx8cu406%2Bhk7KXbSZrrupPwe33ce4Q31G0psNp%2Fs17lV&X-Amz-Signature=c44a819d860ed25809216a028d5a82364f4d27eb152d6b9be62820ba1b357584&X-Amz-SignedHeaders=host&x-id=GetObject'; //response.data?.exportCommandSchematic
                    //     link.name = `${schematic?.name}.pdf`;

                    //     link.click();
                    //     link = null;

                    // setExporting(true);
                    // exportSchematic({variables: {id: schematic.id}}).then((response) => {
                    //     setExporting(false);

                    //     console.log(response.data)


                        
                    // }).catch((e) => {
                    //     setExporting(false);
                    // })
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

                    debouncedUpdate({ 
                        variables: { 
                            schematic: id, 
                            id: page.id, 
                            input: { 
                                nodes: page.nodes.map((x) => ({id: x.id, data: x.data, position: x.position, type: x.type})),
                                edges: page.edges
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