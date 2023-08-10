import React, { useEffect, useState, useRef, useMemo } from 'react';
import { gql, useApolloClient, useQuery } from '@apollo/client';
import { useParams } from 'react-router-dom';
import { useCreateHMINode, useDeleteHMINode, useDeleteHMIPath, useUpdateHMINode, useCreateHMIPath, useUpdateHMIPath, useUpdateProgramHMI } from '@hive-command/api';
import { useCommandEditor } from '../../context';
import { isEqual } from 'lodash';
import { useRemoteComponents } from '@hive-command/remote-components';
import { debounce } from 'lodash';
import { SurfaceEditor } from '@hive-command/surface-editor';

export const Controls = (props) => {

    const { id } = useParams()

    const { getPack } = useRemoteComponents()

    const { program: { templatePacks, tags, types, components } } = useCommandEditor()


    const [ nodeState, setNodeState ] = useState<any[]>([]);
    const [ edgeState, setEdgeState ] = useState<any[]>([]);


    const client = useApolloClient()

    const { data, loading } = useQuery(gql`
        query GetInterfaceInfo ($id: ID){

            commandInterfaceDevices{
                id
                name
                width
                height
            }

            commandPrograms(where: {id: $id}){
                id
                name

                tags {
                    id
                    name
                    type
                }

                types {
                    id 
                    name
                    fields {
                        name
                        type
                    }
                }

                templates {
                    id
                    name

                    inputs {
                        id
                        name
                        type
                    }

                    outputs {
                        id
                        name
                        type
                    }
                }

                templatePacks {
                    id
                    name
                    url
                    elements {
                        id
                        name
                    }
                }
                interface {
                    id
                    name

                    edges 
                    nodes 
                }               
            }
        }
    `, {
        variables: {
            id: id
        }
    })


    const updateHMI = useUpdateProgramHMI(id)


    const { program: flows, devices } = data?.commandPrograms?.[0] || {};

    let program = data?.commandPrograms?.[0]

    let hmiTemplatePacks = program?.templatePacks || [];

    let activeProgram = useMemo(() => {
        return (program?.interface)?.find((a) => a.id == props.activeProgram)
    }, [props.activeProgram, program]);

    const [nodePacks, setNodePacks] = useState<any[]>([]);

    const [ packsDownloaded, setPacksDownloaded ] = useState(false);
    
    const [ isData, setIsData ] = useState(false);

    useEffect(() => {
        Promise.all(templatePacks.filter((a) => a.url)?.map(async (pack) => {
            if (pack?.url) {
                let base = pack?.url?.split('/');
                let [url_slug] = base.splice(base.length - 1, 1)
                base = base.join('/');

                const p = await getPack(pack?.id, `${base}/`, url_slug)
                return {
                    ...pack,
                    pack: p
                }
            }
        })).then((data) => {
            setNodePacks(data);
            setPacksDownloaded(true)
        })
    }, [templatePacks]);


    useEffect(() => {
        if(loading){
            setIsData(false);
        }
    }, [loading])

    useEffect(() => {
        let program = data?.commandPrograms?.[0]
        if (program && !loading) {

            let {nodes, edges} = activeProgram || []

            if(!isEqual(nodes, nodeState)){
                console.log("setNode", nodes)
                setNodeState(nodes)
            }

            if(!isEqual(edges, edgeState)){
                setEdgeState(edges)
            }

            setIsData(true)
        }
    }, [activeProgram, data?.commandPrograms?.[0], loading])




    const debouncedHMIUpdate = useMemo(() => {
        return debounce(updateHMI, 500)
    }, [])

    useEffect(() => {
        let {nodes, edges} = activeProgram || []

        if(isData && !loading && ((nodes && !isEqual(nodeState, nodes)) || (edges && !isEqual(edgeState, edges)))){

            console.log({nodeState, nodes, edgeState, edges})
            
            debouncedHMIUpdate({
                id: props.activeProgram,
                nodes: nodeState,
                edges: edgeState
            });
        }
    }, [nodeState, edgeState, activeProgram, loading, isData])

   
    return (
        <SurfaceEditor
            id={id}
            nodePacks={nodePacks}
            activeProgram={activeProgram}
            hmiTemplatePacks={hmiTemplatePacks}
            loading={loading}
            program={program}
            packsDownloaded={packsDownloaded}
            nodes={nodeState}
            edges={edgeState}
            onNodesChanged={(nodes) => {
                console.log({nodes});
            }}
            onEdgesChanged={(edges) => {

            }} />
    )
}

