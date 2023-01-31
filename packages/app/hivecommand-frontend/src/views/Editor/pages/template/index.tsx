import React, { useContext, useMemo, useState } from 'react';
import { Box, Divider, IconButton, List, ListItem, ListItemButton, ListItemText, Paper, Typography } from '@mui/material';
import { Add, Javascript, MoreVert } from '@mui/icons-material'
import { TemplateModal } from './modal';
import { useMutation, gql } from '@apollo/client'
import { useCommandEditor } from '../../context';
import { useParams } from 'react-router-dom';
import { getOPCType, ScriptEditorModal } from '../../../../components/script-editor';

export const TemplateEditor = (props: any) => {

    const { id: activeProgram } = useParams()

    const id = props.active

    const [ selected, setSelected ] = useState<any>();

    const { refetch, deviceTypes, program: {templates} } = useCommandEditor()

    const [ defaultSrc, setDefaultSrc ] = useState<{src: string, srcId?: string, id: string} | null>()

    const [ direction, setDirection ] = useState<any>(null)

    // const [ createTemplateIO ] = useMutation


    const [ createTemplateIO ] = useMutation(gql`
        mutation CreateIO($template: ID!, $input: CommandTemplateIOInput!) {
            createCommandTemplateIO(template: $template, input: $input){
                id
            }

        }    
    `)

    const [ updateTemplateIO ] = useMutation(gql`
        mutation UpdateIO($template: ID!, $id: ID!, $input: CommandTemplateIOInput!){
            updateCommandTemplateIO(template: $template, id: $id, input: $input){
                id
            }
        }
    `)

    const [ deleteTemplateIO ] = useMutation(gql`
        mutation  Delete($template: ID!, $id: ID!){
            deleteCommandTemplateIO(template: $template, id: $id){
                id
            }
        }
    `)

    const [ createTemplateEdge ] = useMutation(gql`
        mutation CreateIO($template: ID!, $input: CommandTemplateEdgeInput!) {
            createCommandTemplateEdge(template: $template, input: $input){
                id
            }

        }    
    `)

    const [ updateTemplateEdge ] = useMutation(gql`
        mutation UpdateIO($template: ID!, $id: ID!, $input: CommandTemplateEdgeInput!){
            updateCommandTemplateEdge(template: $template, id: $id, input: $input){
                id
            }
        }
    `)



    const activeTemplate = templates?.find((a) => a.id === id);
    

    const getDefault = (type: string) => {
        if(type === 'Function'){
            return `export const handler = (elem: {x: number, y: number, width: number, height: number}, state: Inputs) => {

}`
        }else{ 

        return `export const getter = (inputs: Inputs) : ${getInputType(type)} => {
    return inputs;
}
        
export const setter = (value: ${getInputType(type)}, setInputs: SetInputs) => {
    setInputs({

    })
}`
        }
    }

    const getInputType = (type: string) => {
        if(type.indexOf("Device:") > -1){
            //Return device interface by id
            const typeParts = type?.split(':')
            console.log(deviceTypes, type, deviceTypes?.find((a) => a.id == typeParts?.[1]))
            let deviceInterface = deviceTypes?.find((a) => a.id === typeParts?.[1])?.state?.map((stateItem) => `${stateItem.key}: ${getOPCType(stateItem.type)}`).join(';\n')
            return `{ ${deviceInterface} }`
        }

        switch(type){
            case 'Boolean':
                return 'boolean';
            case 'String':
                return 'string';
            case 'Number':
                return 'number';
        }
    }

    const extraLib = useMemo(() => {
        return `
                    interface Inputs {
                        ${activeTemplate.inputs?.map((input) => `${input.name}: ${getInputType(input.type)}`).join(';\n')}
                    }

                    declare type SetInputs = (inputs: DeepPartial<Inputs>) => void;

                    declare function showWindow (elem: any, data: Function){

                    }


                    declare function showDeviceWindow(
                        position: {x: number, y: number, width: number, height: number, anchor?: string},
                        deviceTag: string
                    ){
                        
                    }

                `
    }, [activeTemplate])

    
    return (
        <Box sx={{flex: 1, display: 'flex', flexDirection: 'column'}}> 
            <ScriptEditorModal
                open={Boolean(defaultSrc)}
                onClose={() => {
                    setDefaultSrc(null)
                }}
                onSubmit={(codeValue) => {
                    if(defaultSrc.srcId){
                        updateTemplateEdge({
                            variables: {
                                template: id,
                                id: defaultSrc.srcId,
                                input: {
                                    to: defaultSrc.id,
                                    script: codeValue
                                }
                            }
                        }).then(() => {
                            refetch?.()
                            setDefaultSrc(null);
                        })
                    }else{
                        createTemplateEdge({
                            variables: {
                                template: id,
                                input: {
                                    to: defaultSrc.id,
                                    script: codeValue
                                }
                            }
                        }).then(() => {
                            refetch?.()
                            setDefaultSrc(null);
                        })
                    }
                }}
                defaultValue={defaultSrc?.src}
                extraLib={extraLib}
                
                />
            <TemplateModal 
                selected={selected}
                direction={direction}
                onDelete={() => {
                    deleteTemplateIO({
                        variables: {
                            template: id,
                            id: selected?.id
                        }
                    }).then(() => {
                        refetch();
                        setSelected(null);
                        setDirection(null);
                    })
                }}
                onSubmit={(templateIO) => {
                    if(selected?.id){
                        updateTemplateIO({
                            variables: {
                                template: id,
                                id: selected?.id,
                                input: {
                                    direction: direction,
                                    name: templateIO.name,
                                    type: templateIO.type
                                }   
                            }
                        }).then(() => {
                            refetch();
    
                            setSelected(null);
    
                            setDirection(null)
                        });
                    }else{
                        createTemplateIO({
                            variables: {
                                template: id,
                                input: {
                                    direction: direction,
                                    name: templateIO.name,
                                    type: templateIO.type
                                }
                            }
                        }).then(() => {
                            refetch();
    
                            setSelected(null);
    
                            setDirection(null)
                        });
                    }
              
                }}
                onClose={() => {
                    setDirection(null);
                }}
                open={Boolean(direction)} />

            <Box sx={{padding: '6px'}}>
                <Typography>{activeTemplate?.name}</Typography>
            </Box>
            <Divider />
            <Box sx={{flex: 1, display: 'flex'}}>
                <Paper sx={{flex: 1,  margin: '6px',  display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{display: 'flex', padding: '6px', alignItems: 'center', justifyContent: 'space-between'}}>
                        <Typography>Inputs</Typography>
                        <IconButton onClick={() => setDirection('input')}>
                            <Add />
                        </IconButton>
                    </Box>
                    <Divider />
                    <List sx={{flex: 1}}>
                        {activeTemplate?.inputs?.map((input) => (
                            <ListItem 
                                secondaryAction={
                                    <>
                                        <IconButton 
                                            onClick={() => {
                                                setDirection('input')
                                                setSelected(input)
                                            }}
                                            size="small">
                                            <MoreVert fontSize='inherit' />   
                                        </IconButton>

                                    </>
                                }
                                sx={{display: 'flex', padding: '6px'}}>
                                <ListItemButton>
                                    <ListItemText>
                                        {input.name} : {input.type}
                                    </ListItemText>
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Paper>
                <Paper sx={{flex: 1, margin: '6px', display: 'flex', flexDirection: 'column'}}>
                    <Box sx={{display: 'flex', padding: '6px', alignItems: 'center', justifyContent: 'space-between'}}>
                    
                        <Typography>Outputs</Typography>
                        <IconButton onClick={() => setDirection('output')}>
                            <Add />
                        </IconButton>
                    </Box>
                    <Divider />
                    <List sx={{flex: 1}}>
                        {activeTemplate?.outputs?.map((output) => (
                            <ListItem 
                                secondaryAction={
                                    <>
                                        <IconButton 
                                            onClick={() => {
                                                let activeScript = activeTemplate?.edges?.find((a) => a.to?.id === output?.id);

                                                if(activeScript){
                                                    setDefaultSrc({src: activeScript.script, srcId: activeScript.id, id: output.id});
                                                }else{
                                                    const defaultSrc = getDefault(output.type)

                                                    setDefaultSrc({src: defaultSrc, id: output.id})
                                                }
                                            }}
                                            edge="end" size="small">
                                            <Javascript fontSize="inherit" />
                                        </IconButton>
                                         <IconButton 
                                            onClick={() => {
                                                setDirection('output')
                                                setSelected(output)

                                            }}
                                            size="small">
                                            <MoreVert fontSize='inherit'/>   
                                        </IconButton>
                                    </>
                              
                                }
                                 sx={{display: 'flex', position: 'relative', padding: '6px'}}>
                                <ListItemButton>
                                    <ListItemText>
                                        {output.name} : {output.type} - {activeTemplate?.edges?.filter((a) => a.to?.id === output.id)?.length}
                                    </ListItemText>
                                </ListItemButton>
                                
                            </ListItem>
                        ))}
                    </List>

                </Paper>
            </Box>
        </Box>
    )
}